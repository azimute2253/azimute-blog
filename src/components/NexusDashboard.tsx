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

  // Empty state - usando design system azimute.cc
  if (isEmpty && !isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.5rem',
          padding: '3rem',
          border: '2px dashed var(--az-surface)',
          borderRadius: '0.5rem',
          background: 'var(--az-deep)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '4rem' }}>📊</div>
        <h3
          style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--az-text)',
            fontFamily: 'var(--az-font-display)',
          }}
        >
          Nenhuma carteira ainda
        </h3>
        <p
          style={{
            maxWidth: '28rem',
            fontSize: '0.875rem',
            color: 'var(--az-text-muted)',
            fontFamily: 'var(--az-font-body)',
          }}
        >
          Comece criando seus primeiros tipos de ativos, grupos e ativos para
          visualizar seus dados aqui.
        </p>
        <a
          href="/dashboard/assets/new"
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            background: 'var(--az-compass)',
            color: 'var(--az-void)',
            fontWeight: 500,
            fontFamily: 'var(--az-font-display)',
            textDecoration: 'none',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          Cadastrar Ativo
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
