import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import AdmZip from 'adm-zip';
import { db } from '../db';
import { tussCodes, dataImports, type InsertTussCode, type InsertDataImport } from '@shared/schema';
import { eq, count } from 'drizzle-orm';

interface TussRecord {
  codigo: string;
  descricao: string;
  tabela: string;
  nomeTabela: string;
  categoria?: string;
  subcategoria?: string;
}

export class TussImporter {
  private readonly TUSS_URL = 'https://ftp.dadosabertos.ans.gov.br/FTP/PDA/terminologia_unificada_saude_suplementar_TUSS/TUSS.zip';
  private readonly TEMP_DIR = path.join(process.cwd(), 'tmp');

  constructor() {
    // Criar diretório temporário se não existir
    if (!fs.existsSync(this.TEMP_DIR)) {
      fs.mkdirSync(this.TEMP_DIR, { recursive: true });
    }
  }

  async downloadAndImportTUSS(importedBy: string): Promise<{ success: boolean; message: string; recordsImported?: number }> {
    try {
      console.log('Iniciando download do arquivo TUSS...');
      
      // Criar registro de importação
      const [importRecord] = await db.insert(dataImports).values({
        type: 'tuss',
        recordsCount: 0,
        status: 'processing',
        importedBy,
      }).returning();

      try {
        // Download do arquivo ZIP
        const zipPath = await this.downloadFile(this.TUSS_URL, path.join(this.TEMP_DIR, 'TUSS.zip'));
        console.log('Download concluído, extraindo arquivos...');

        // Extrair arquivos CSV do ZIP
        const csvFiles = await this.extractZipFiles(zipPath);
        console.log(`Encontrados ${csvFiles.length} arquivos CSV`);

        // Processar arquivos CSV
        let totalRecords = 0;
        const relevantTables = ['22', '23', '24', '39', '41', '43', '50', '52', '57', '63', '64'];

        for (const csvFile of csvFiles) {
          const tableNumber = this.extractTableNumber(csvFile.name);
          if (relevantTables.includes(tableNumber)) {
            const records = await this.processCsvFile(csvFile.path, tableNumber);
            totalRecords += records;
            console.log(`Tabela ${tableNumber}: ${records} registros processados`);
          }
        }

        // Atualizar registro de importação como concluído
        await db.update(dataImports)
          .set({
            status: 'completed',
            recordsCount: totalRecords,
            version: new Date().toISOString().split('T')[0], // Data da importação como versão
          })
          .where(eq(dataImports.id, importRecord.id));

        // Limpar arquivos temporários
        this.cleanup();

        return {
          success: true,
          message: `Importação concluída com sucesso! ${totalRecords} códigos TUSS importados.`,
          recordsImported: totalRecords
        };

      } catch (error) {
        // Atualizar registro de importação como falhado
        await db.update(dataImports)
          .set({
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Erro desconhecido',
          })
          .where(eq(dataImports.id, importRecord.id));

        throw error;
      }

    } catch (error) {
      console.error('Erro na importação TUSS:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido na importação'
      };
    }
  }

  private downloadFile(url: string, filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(filePath);
      const isHttps = url.startsWith('https://');
      const httpModule = isHttps ? https : http;
      
      httpModule.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Erro no download: ${response.statusCode}`));
          return;
        }

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve(filePath);
        });

        file.on('error', (error) => {
          fs.unlink(filePath, () => {}); // Remover arquivo parcial
          reject(error);
        });
      }).on('error', reject);
    });
  }

  private async extractZipFiles(zipPath: string): Promise<Array<{ name: string; path: string }>> {
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();
    const csvFiles: Array<{ name: string; path: string }> = [];

    for (const entry of entries) {
      if (entry.entryName.endsWith('.csv')) {
        const extractPath = path.join(this.TEMP_DIR, entry.entryName);
        zip.extractEntryTo(entry, this.TEMP_DIR, false, true);
        csvFiles.push({
          name: entry.entryName,
          path: extractPath
        });
      }
    }

    return csvFiles;
  }

  private extractTableNumber(fileName: string): string {
    // Extrair número da tabela do nome do arquivo (ex: "Tabela_22_Procedimentos.csv" -> "22")
    const match = fileName.match(/[Tt]abela[_-]?(\d+)/);
    return match ? match[1] : '0';
  }

  private async processCsvFile(filePath: string, tableNumber: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const records: InsertTussCode[] = [];
      let processedCount = 0;

      fs.createReadStream(filePath)
        .pipe(parse({
          columns: true,
          skip_empty_lines: true,
          delimiter: ';', // TUSS geralmente usa ponto e vírgula
          encoding: 'latin1' // Encoding comum para dados brasileiros
        }))
        .on('data', (row: any) => {
          try {
            // Mapear colunas do CSV para nossa estrutura
            // As colunas podem variar entre tabelas, então vamos tentar diferentes formatos
            const code = row['Codigo'] || row['codigo'] || row['CODIGO'] || row['CD_PROCEDIMENTO'];
            const description = row['Descricao'] || row['descricao'] || row['DESCRICAO'] || row['DS_PROCEDIMENTO'];
            
            if (code && description) {
              records.push({
                code: String(code).trim(),
                description: String(description).trim(),
                tableNumber,
                tableName: this.getTableName(tableNumber),
                category: row['Categoria'] || row['categoria'] || null,
                subcategory: row['Subcategoria'] || row['subcategoria'] || null,
                isActive: true,
              });
            }
          } catch (error) {
            console.warn('Erro ao processar linha:', error);
          }
        })
        .on('end', async () => {
          try {
            if (records.length > 0) {
              // Inserir em lotes para melhor performance
              const batchSize = 1000;
              for (let i = 0; i < records.length; i += batchSize) {
                const batch = records.slice(i, i + batchSize);
                await db.insert(tussCodes).values(batch).onConflictDoNothing();
                processedCount += batch.length;
              }
            }
            resolve(processedCount);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  }

  private getTableName(tableNumber: string): string {
    const tableNames: { [key: string]: string } = {
      '22': 'Procedimentos',
      '23': 'Procedimentos Odontológicos',
      '24': 'Procedimentos Fonoaudiológicos',
      '39': 'Classificação de Acidentes',
      '41': 'Motivo de Encerramento',
      '43': 'Tipo de Acomodação',
      '50': 'Via de Administração',
      '52': 'Tipo de Atendimento',
      '57': 'Origem da Receita',
      '63': 'Grupo de Despesas',
      '64': 'Tipo de Internação'
    };
    return tableNames[tableNumber] || `Tabela ${tableNumber}`;
  }

  private cleanup(): void {
    try {
      // Remover arquivos temporários
      if (fs.existsSync(this.TEMP_DIR)) {
        fs.rmSync(this.TEMP_DIR, { recursive: true, force: true });
      }
    } catch (error) {
      console.warn('Erro ao limpar arquivos temporários:', error);
    }
  }

  async getTussStatistics(): Promise<{
    totalCodes: number;
    codesByTable: Array<{ table: string; count: number }>;
    lastImport?: Date;
  }> {
    try {
      // Contar total de códigos
      const [totalResult] = await db.select({ count: count() }).from(tussCodes);
      
      // Contar por tabela
      const tableStats = await db
        .select({
          tableNumber: tussCodes.tableNumber,
          tableName: tussCodes.tableName,
        })
        .from(tussCodes)
        .groupBy(tussCodes.tableNumber, tussCodes.tableName);

      // Última importação
      const [lastImport] = await db
        .select({ importedAt: dataImports.importedAt })
        .from(dataImports)
        .where(eq(dataImports.type, 'tuss'))
        .orderBy(dataImports.importedAt)
        .limit(1);

      return {
        totalCodes: totalResult.count,
        codesByTable: tableStats.map(stat => ({
          table: `${stat.tableNumber} - ${stat.tableName}`,
          count: 0 // TODO: Implementar count por tabela
        })),
        lastImport: lastImport?.importedAt || undefined
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas TUSS:', error);
      return {
        totalCodes: 0,
        codesByTable: [],
      };
    }
  }
}