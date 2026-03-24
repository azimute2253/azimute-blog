import { useState, useEffect } from 'react';

interface AssetType {
  id: string;
  name: string;
  target_pct: number | null;
}

interface AssetGroup {
  id: string;
  name: string;
  type_id: string;
}

export default function AssetForm() {
  const [types, setTypes] = useState<AssetType[]>([]);
  const [groups, setGroups] = useState<AssetGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<AssetGroup[]>([]);
  
  const [formData, setFormData] = useState({
    type_id: '',
    group_id: '',
    ticker: '',
    quantity: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Fetch types and groups on mount
  useEffect(() => {
    fetchTypesAndGroups();
  }, []);

  // Filter groups when type changes
  useEffect(() => {
    if (formData.type_id) {
      const filtered = groups.filter(g => g.type_id === formData.type_id);
      setFilteredGroups(filtered);
      
      // Auto-select first group if only one
      if (filtered.length === 1) {
        setFormData(prev => ({ ...prev, group_id: filtered[0].id }));
      }
    } else {
      setFilteredGroups([]);
    }
  }, [formData.type_id, groups]);

  const fetchTypesAndGroups = async () => {
    try {
      const [typesRes, groupsRes] = await Promise.all([
        fetch('/api/asset-types'),
        fetch('/api/asset-groups'),
      ]);

      if (typesRes.ok) {
        const typesData = await typesRes.json();
        setTypes(typesData);
      }

      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setGroups(groupsData);
      }
    } catch (err) {
      console.error('Failed to fetch types/groups:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_id: formData.group_id,
          ticker: formData.ticker.toUpperCase(),
          quantity: parseFloat(formData.quantity),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao cadastrar ativo');
      }

      setSuccess(true);
      
      // Redirect after 1.5s
      setTimeout(() => {
        window.location.href = '/dashboard/portfolio';
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar ativo');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.successCard}>
        <div style={{ fontSize: '3rem' }}>✅</div>
        <h3 style={styles.successTitle}>Ativo cadastrado com sucesso!</h3>
        <p style={styles.successText}>Redirecionando para o Nexus Data...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {error && (
        <div style={styles.errorCard}>
          <strong>Erro:</strong> {error}
        </div>
      )}

      {/* Tipo de Ativo */}
      <div style={styles.field}>
        <label style={styles.label}>
          Tipo de Ativo <span style={styles.required}>*</span>
        </label>
        <select
          value={formData.type_id}
          onChange={(e) => setFormData({ ...formData, type_id: e.target.value, group_id: '' })}
          required
          style={styles.select}
        >
          <option value="">Selecione o tipo</option>
          {types.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      {/* Grupo (aparece depois de selecionar tipo) */}
      {formData.type_id && filteredGroups.length > 0 && (
        <div style={styles.field}>
          <label style={styles.label}>
            Grupo <span style={styles.required}>*</span>
          </label>
          <select
            value={formData.group_id}
            onChange={(e) => setFormData({ ...formData, group_id: e.target.value })}
            required
            style={styles.select}
          >
            <option value="">Selecione o grupo</option>
            {filteredGroups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name || 'Sem nome'}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Ticker */}
      <div style={styles.field}>
        <label style={styles.label}>
          Ticker / Código <span style={styles.required}>*</span>
        </label>
        <input
          type="text"
          value={formData.ticker}
          onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
          placeholder="Ex: PETR4, MXRF11, TESOURO SELIC"
          required
          style={styles.input}
        />
      </div>

      {/* Quantidade */}
      <div style={styles.field}>
        <label style={styles.label}>
          Quantidade <span style={styles.required}>*</span>
        </label>
        <input
          type="number"
          step="0.01"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
          placeholder="Ex: 100"
          required
          style={styles.input}
        />
      </div>

      {/* Buttons */}
      <div style={styles.actions}>
        <button
          type="submit"
          disabled={loading || !formData.group_id}
          style={{
            ...styles.btnPrimary,
            ...(loading || !formData.group_id ? styles.btnDisabled : {}),
          }}
        >
          {loading ? 'Salvando...' : 'Cadastrar Ativo'}
        </button>
        <a href="/dashboard/portfolio" style={styles.btnSecondary}>
          Cancelar
        </a>
      </div>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--az-text)',
    fontFamily: 'var(--az-font-display)',
  },
  required: {
    color: 'var(--az-ember)',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid var(--az-surface)',
    borderRadius: '0.5rem',
    background: 'var(--az-deep)',
    color: 'var(--az-text)',
    fontFamily: 'var(--az-font-body)',
    fontSize: '1rem',
  },
  select: {
    padding: '0.75rem',
    border: '1px solid var(--az-surface)',
    borderRadius: '0.5rem',
    background: 'var(--az-deep)',
    color: 'var(--az-text)',
    fontFamily: 'var(--az-font-body)',
    fontSize: '1rem',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  btnPrimary: {
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    background: 'var(--az-compass)',
    color: 'var(--az-void)',
    fontWeight: 500,
    fontFamily: 'var(--az-font-display)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  btnSecondary: {
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    background: 'var(--az-surface)',
    color: 'var(--az-text)',
    fontWeight: 500,
    fontFamily: 'var(--az-font-display)',
    border: '1px solid var(--az-text-dim)',
    textDecoration: 'none',
    display: 'inline-block',
  },
  errorCard: {
    padding: '1rem',
    borderRadius: '0.5rem',
    background: 'rgba(184, 92, 74, 0.1)',
    border: '1px solid var(--az-ember)',
    color: 'var(--az-ember)',
    fontSize: '0.875rem',
  },
  successCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    padding: '3rem',
    border: '2px solid var(--az-growth)',
    borderRadius: '0.5rem',
    background: 'var(--az-deep)',
    textAlign: 'center',
  },
  successTitle: {
    fontSize: '1.5rem',
    fontWeight: 600,
    color: 'var(--az-text)',
    fontFamily: 'var(--az-font-display)',
  },
  successText: {
    color: 'var(--az-text-muted)',
    fontFamily: 'var(--az-font-body)',
  },
};
