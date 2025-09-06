import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface TussStatistics {
  totalCodes: number;
  codesByTable: Array<{ table: string; count: number }>;
  lastImport?: Date;
}

export default function TussPage() {
  const { toast } = useToast();

  // Query para estatísticas TUSS
  const { data: tussStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['/api/tuss-statistics'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/tuss-statistics');
      return response.json();
    },
  });

  // Mutation para importar dados TUSS
  const importMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/tuss-import', { importedBy: 'admin' });
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: 'Importação TUSS Concluída',
        description: result.message || 'Importação realizada com sucesso',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/tuss-statistics'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro na Importação',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    },
  });

  const handleImportTuss = () => {
    importMutation.mutate();
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Sistema TUSS
          </h1>
          <p className="text-muted-foreground mt-2">
            Gerenciamento da Terminologia Unificada da Saúde Suplementar
          </p>
        </div>
        
        <button 
          onClick={handleImportTuss} 
          disabled={importMutation.isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg disabled:opacity-50"
          data-testid="button-import-tuss"
        >
          {importMutation.isPending ? 'Importando...' : 'Importar TUSS'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              Total de Códigos
            </h3>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground" data-testid="text-total-codes">
              {isLoadingStats ? '...' : (tussStats?.totalCodes?.toLocaleString() || '0')}
            </div>
            <p className="text-xs text-muted-foreground">
              códigos TUSS disponíveis
            </p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              Última Importação
            </h3>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-foreground" data-testid="text-last-import">
              {isLoadingStats ? '...' : 
               tussStats?.lastImport ? 
                 new Date(tussStats.lastImport).toLocaleDateString('pt-BR') : 
                 'Nunca'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              data da última atualização
            </p>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              Status do Sistema
            </h3>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-green-600" data-testid="text-system-status">
              Ativo
            </div>
            <p className="text-xs text-muted-foreground">
              sistema operacional
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Sobre o Sistema TUSS</h3>
        <p className="text-muted-foreground mb-4">
          A Terminologia Unificada da Saúde Suplementar (TUSS) é um padrão estabelecido pela ANS para codificação de procedimentos médicos.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-base mb-2 text-foreground">Tabelas Principais:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Tabela 22 - Procedimentos Médicos</li>
              <li>• Tabela 23 - Procedimentos Odontológicos</li>
              <li>• Tabela 24 - Procedimentos Fonoaudiológicos</li>
              <li>• Outras tabelas auxiliares</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-2 text-foreground">Funcionalidades:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Importação automática dos dados da ANS</li>
              <li>• Busca e filtros avançados</li>
              <li>• Integração com solicitações de exames</li>
              <li>• Atualização periódica dos códigos</li>
            </ul>
          </div>
        </div>

        {importMutation.isPending && (
          <div className="mt-6 bg-primary/10 p-4 rounded-lg border border-primary/20">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm font-medium text-primary">
                Importando dados TUSS da ANS... Isso pode levar alguns minutos.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}