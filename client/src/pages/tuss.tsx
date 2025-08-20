import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
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
      const response = await fetch('/api/tuss-statistics');
      return response.json();
    },
  });

  // Mutation para importar dados TUSS
  const importMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/tuss-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ importedBy: 'admin' })
      });
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Sistema TUSS
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gerenciamento da Terminologia Unificada da Saúde Suplementar
          </p>
        </div>
        
        <button 
          onClick={handleImportTuss} 
          disabled={importMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          data-testid="button-import-tuss"
        >
          {importMutation.isPending ? 'Importando...' : 'Importar TUSS'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Total de Códigos
            </h3>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold" data-testid="text-total-codes">
              {isLoadingStats ? '...' : (tussStats?.totalCodes?.toLocaleString() || '0')}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              códigos TUSS disponíveis
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Última Importação
            </h3>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold" data-testid="text-last-import">
              {isLoadingStats ? '...' : 
               tussStats?.lastImport ? 
                 new Date(tussStats.lastImport).toLocaleDateString('pt-BR') : 
                 'Nunca'
              }
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              data da última atualização
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Status do Sistema
            </h3>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold text-green-600" data-testid="text-system-status">
              Ativo
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              sistema operacional
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Sobre o Sistema TUSS</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          A Terminologia Unificada da Saúde Suplementar (TUSS) é um padrão estabelecido pela ANS para codificação de procedimentos médicos.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-base mb-2">Tabelas Principais:</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Tabela 22 - Procedimentos Médicos</li>
              <li>• Tabela 23 - Procedimentos Odontológicos</li>
              <li>• Tabela 24 - Procedimentos Fonoaudiológicos</li>
              <li>• Outras tabelas auxiliares</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-base mb-2">Funcionalidades:</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Importação automática dos dados da ANS</li>
              <li>• Busca e filtros avançados</li>
              <li>• Integração com solicitações de exames</li>
              <li>• Atualização periódica dos códigos</li>
            </ul>
          </div>
        </div>

        {importMutation.isPending && (
          <div className="mt-6 bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Importando dados TUSS da ANS... Isso pode levar alguns minutos.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}