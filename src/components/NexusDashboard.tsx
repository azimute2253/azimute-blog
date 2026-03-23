import { useState, useEffect } from 'react';
import { Dashboard } from 'nexus-data';
import type { PerformanceMetrics } from 'nexus-data';

export default function NexusDashboard() {
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);

  const fetchPerformance = async () => {
    setIsLoading(true);
    setError(null);
    setIsEmpty(false);

    try {
      const response = await fetch('/api/portfolio/performance');
      
      if (!response.ok) {
        const errorText = await response.text();
        
        // Check if it's an empty portfolio (no data)
        if (response.status === 404 || errorText.includes('No data')) {
          setIsEmpty(true);
          setPerformance(null);
          return;
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      // Check if data is empty
      if (!data || !data.types || data.types.length === 0) {
        setIsEmpty(true);
        setPerformance(null);
        return;
      }
      
      setPerformance(data);
    } catch (err) {
      console.error('Failed to fetch performance:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  // Empty state
  if (isEmpty && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <div className="text-6xl">📊</div>
        <h3 className="text-xl font-semibold text-gray-900">
          Nenhuma carteira ainda
        </h3>
        <p className="max-w-md text-sm text-gray-600">
          Comece criando seus primeiros tipos de ativos, grupos e ativos para
          visualizar seu portfólio aqui.
        </p>
        <a
          href="/dashboard/types"
          className="mt-4 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Criar Primeira Carteira
        </a>
      </div>
    );
  }

  return (
    <Dashboard
      performance={performance}
      isLoading={isLoading}
      error={error}
      onRetry={fetchPerformance}
    />
  );
}
