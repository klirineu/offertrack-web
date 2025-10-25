import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  trend?: React.ReactNode;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  change,
  changeType = 'neutral',
  trend,
  className = ''
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'var(--success)';
      case 'negative': return 'var(--error)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-icon">
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div className="stat-label">
          {label}
        </div>
        <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {value}
          {trend && <span style={{ fontSize: '1rem' }}>{trend}</span>}
        </div>
        {change && (
          <div style={{
            fontSize: '0.85rem',
            color: getChangeColor(),
            marginTop: '0.25rem',
            fontWeight: 600
          }}>
            {change}
          </div>
        )}
      </div>
    </div>
  );
};

