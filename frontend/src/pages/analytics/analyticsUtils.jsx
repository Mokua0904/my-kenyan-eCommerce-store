import React, { useState, useEffect, useCallback } from 'react';

export const PERIODS = [
  { label: '7 Days',  value: 7  },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
  { label: '1 Year',  value: 365 },
];

export const COLORS = [
  '#c2621a', '#e8894a', '#f5b88a', '#2d7a4a',
  '#1a6fa8', '#6a1a8a', '#b8860b', '#c0392b',
];

export const CHART_COLORS = {
  revenue:   '#c2621a',
  orders:    '#1a6fa8',
  customers: '#2d7a4a',
  products:  '#6a1a8a',
  grid:      'var(--border-light, #e8e2db)', // Added fallback color
  tooltip:   '#1a1008',
};

export function usePeriod(initial = 30) {
  const [period, setPeriod] = useState(initial);
  return { period, setPeriod };
}

export function useAnalytics(fetcher, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      setData(res.data || null);
    } catch (e) {
      console.error("Analytics fetch error:", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line

  useEffect(() => { 
    load(); 
  }, [load]);
  
  return { data, loading, error, reload: load };
}

// 🇰🇪 KENYAN LOCALIZATION: All formatting is now in KES
export const fmt = {
  currency: (v) => `KES ${Number(v || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  
  number:   (v) => Number(v || 0).toLocaleString('en-KE'),
  
  pct:      (v) => `${v > 0 ? '+' : ''}${Number(v || 0).toFixed(1)}%`,
  
  short:    (v) => {
    v = Number(v || 0);
    if (v >= 1_000_000) return `KES ${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000)     return `KES ${(v / 1_000).toFixed(1)}K`;
    return `KES ${v.toFixed(0)}`;
  },
};

export function TrendBadge({ value }) {
  const up = value >= 0;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 3,
      fontSize: 12, fontWeight: 600,
      color: up ? 'var(--success, #2d7a4a)' : 'var(--danger, #c0392b)', // Added fallbacks
    }}>
      {up ? '▲' : '▼'} {Math.abs(value).toFixed(1)}%
    </span>
  );
}

export function SectionHeader({ title, subtitle, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 2, color: '#4E3B2C' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13, color: 'var(--text-muted, #7C6652)' }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>{children}</div>
    </div>
  );
}

export function PeriodSelector({ period, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {PERIODS.map(p => (
        <button
          key={p.value}
          className={`btn btn-sm ${period === p.value ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => onChange(p.value)}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

export function KpiCard({ label, value, change, prefix = '', suffix = '', icon: Icon, color = 'var(--primary, #A6754D)' }) {
  const up = change >= 0;
  return (
    <div className="stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', right: -10, top: -10,
        width: 70, height: 70, borderRadius: '50%',
        background: color + '15',
      }} />
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: color + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, marginBottom: 12,
      }}>
        {Icon && <Icon size={20} />}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 2, color: '#4E3B2C' }}>
        {prefix}{value}{suffix}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary, #7C6652)', marginBottom: change !== undefined ? 8 : 0 }}>
        {label}
      </div>
      {change !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
          <span style={{ color: up ? 'var(--success, #2d7a4a)' : 'var(--danger, #c0392b)', fontWeight: 600 }}>
            {up ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
          </span>
          <span style={{ color: 'var(--text-muted, #7C6652)' }}>vs prev period</span>
        </div>
      )}
    </div>
  );
}

export function ChartCard({ title, subtitle, action, children, height = 260 }) {
  return (
    <div className="card" style={{ background: 'white', borderRadius: 12, border: '1px solid #DCC7AA', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 22px 0' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#4E3B2C' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 12, color: 'var(--text-muted, #7C6652)', marginTop: 2 }}>{subtitle}</div>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div style={{ padding: '16px 22px 20px' }}>
        {children}
      </div>
    </div>
  );
}

export function EmptyChart({ message = 'No data for this period' }) {
  return (
    <div style={{
      height: 200, display: 'flex', alignItems: 'center',
      justifyContent: 'center', color: 'var(--text-muted, #7C6652)',
      fontSize: 13, flexDirection: 'column', gap: 8,
    }}>
      <span style={{ fontSize: 28 }}>📊</span>
      {message}
    </div>
  );
}