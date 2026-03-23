import { useState, useEffect } from 'react';
import { Dashboard } from 'nexus-data';
import type { PerformanceMetrics } from 'nexus-data';

export default function NexusDashboard() {
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerformance = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/portfolio/performance');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
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

  return (
    <Dashboard
      performance={performance}
      isLoading={isLoading}
      error={error}
      onRetry={fetchPerformance}
    />
  );
}
