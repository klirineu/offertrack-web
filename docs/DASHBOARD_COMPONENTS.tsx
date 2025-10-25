/**
 * ===============================================
 * COMPONENTES REACT/TYPESCRIPT PARA DASHBOARD
 * Design System ClonUp - Componentes Prontos
 * ===============================================
 */

import React from 'react';

// ============================================
// 1. BUTTONS
// ============================================

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  icon
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary': return 'cta-button';
      case 'secondary': return 'secondary-button';
      case 'success': return 'starter-button';
      default: return 'cta-button';
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small': return { padding: '0.5rem 1rem', fontSize: '0.875rem' };
      case 'medium': return { padding: '0.8rem 1.75rem', fontSize: '1rem' };
      case 'large': return { padding: '1.25rem 2.5rem', fontSize: '1.25rem' };
      default: return {};
    }
  };

  return (
    <button
      className={getVariantClass()}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...getSizeStyle(),
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        justifyContent: 'center'
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

// ============================================
// 2. CARDS
// ============================================

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'hover' | 'elevated';
  padding?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = '2rem',
  className = ''
}) => {
  return (
    <div
      className={`${variant === 'hover' ? 'feature-card' : 'dashboard-card'} ${className}`}
      style={{ padding }}
    >
      {children}
    </div>
  );
};

// ============================================
// 3. STAT CARD (Métricas)
// ============================================

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  trend?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  change,
  changeType = 'neutral',
  trend
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'var(--success)';
      case 'negative': return 'var(--error)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className="stat-card" style={{
      background: 'var(--bg-card)',
      borderRadius: '16px',
      padding: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      border: '1px solid var(--border)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '1.5rem',
        boxShadow: '0 10px 20px rgba(37, 99, 235, 0.25)'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          marginBottom: '0.25rem'
        }}>
          {label}
        </div>
        <div style={{
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--text)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
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

// ============================================
// 4. BADGE
// ============================================

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'medium'
}) => {
  const getVariantStyle = () => {
    const baseStyle = {
      padding: size === 'small' ? '0.25rem 0.75rem' : size === 'large' ? '0.75rem 1.5rem' : '0.5rem 1rem',
      fontSize: size === 'small' ? '0.75rem' : size === 'large' ? '1rem' : '0.85rem',
      borderRadius: '20px',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem'
    };

    switch (variant) {
      case 'success':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, var(--success), var(--accent))',
          color: 'white',
          boxShadow: '0 5px 15px rgba(34, 197, 94, 0.3)'
        };
      case 'warning':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #f59e0b, #eab308)',
          color: 'white',
          boxShadow: '0 5px 15px rgba(245, 158, 11, 0.3)'
        };
      case 'error':
        return {
          ...baseStyle,
          background: 'var(--error)',
          color: 'white',
          boxShadow: '0 5px 15px rgba(239, 68, 68, 0.3)'
        };
      case 'info':
        return {
          ...baseStyle,
          background: 'rgba(34, 211, 238, 0.2)',
          color: 'var(--accent)',
          border: '1px solid var(--accent)'
        };
      default:
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          color: 'white',
          boxShadow: '0 5px 15px rgba(37, 99, 235, 0.3)'
        };
    }
  };

  return (
    <span style={getVariantStyle()}>
      {children}
    </span>
  );
};

// ============================================
// 5. TABLE
// ============================================

interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  onRowClick?: (row: any) => void;
}

export const Table: React.FC<TableProps> = ({
  columns,
  data,
  onRowClick
}) => {
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid var(--border)'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: 'var(--surface-2)' }}>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{
                padding: '1rem 1.5rem',
                textAlign: 'left',
                fontWeight: 700,
                color: 'var(--text)',
                fontSize: '0.9rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              onClick={() => onRowClick?.(row)}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {columns.map((col) => (
                <td key={col.key} style={{
                  padding: '1rem 1.5rem',
                  color: 'var(--text-secondary)',
                  borderTop: '1px solid var(--border)'
                }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================
// 6. SIDEBAR NAVIGATION
// ============================================

interface SidebarNavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

interface SidebarNavProps {
  items: SidebarNavItem[];
  logo?: React.ReactNode;
  onItemClick?: (item: SidebarNavItem) => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  items,
  logo,
  onItemClick
}) => {
  return (
    <div style={{
      width: '260px',
      height: '100vh',
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--border)',
      padding: '2rem 0',
      position: 'fixed',
      left: 0,
      top: 0,
      overflowY: 'auto'
    }}>
      {logo && (
        <div style={{
          padding: '0 1.5rem',
          marginBottom: '2rem'
        }}>
          {logo}
        </div>
      )}
      <nav>
        {items.map((item, index) => (
          <a
            key={index}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              onItemClick?.(item);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.875rem 1.5rem',
              color: item.active ? 'var(--accent)' : 'var(--text-secondary)',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              borderLeft: `3px solid ${item.active ? 'var(--accent)' : 'transparent'}`,
              background: item.active ? 'var(--bg-card-hover)' : 'transparent'
            }}
            onMouseEnter={(e) => {
              if (!item.active) {
                e.currentTarget.style.background = 'var(--bg-card-hover)';
                e.currentTarget.style.color = 'var(--accent)';
              }
            }}
            onMouseLeave={(e) => {
              if (!item.active) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <span style={{ fontSize: '1.25rem', width: '24px' }}>
              {item.icon}
            </span>
            <span style={{ fontWeight: 500 }}>
              {item.label}
            </span>
          </a>
        ))}
      </nav>
    </div>
  );
};

// ============================================
// 7. HEADER (Top Bar)
// ============================================

interface HeaderProps {
  title?: string;
  actions?: React.ReactNode;
  user?: {
    name: string;
    avatar?: string;
  };
}

export const DashboardHeader: React.FC<HeaderProps> = ({
  title,
  actions,
  user
}) => {
  return (
    <header style={{
      background: 'rgba(11, 15, 25, 0.8)',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
      padding: '1rem 2rem',
      borderBottom: '1px solid rgba(30, 41, 59, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {title && (
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text)',
          margin: 0
        }}>
          {title}
        </h1>
      )}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        {actions}
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span style={{
              color: 'var(--text)',
              fontWeight: 500
            }}>
              {user.name}
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

// ============================================
// 8. MODAL
// ============================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium'
}) => {
  if (!isOpen) return null;

  const getWidth = () => {
    switch (size) {
      case 'small': return '400px';
      case 'large': return '800px';
      default: return '600px';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(5px)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: '24px',
          width: getWidth(),
          maxWidth: '90vw',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          border: '1px solid var(--border)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div style={{
            padding: '1.5rem 2rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text)',
              margin: 0
            }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-card-hover)';
                e.currentTarget.style.color = 'var(--text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'none';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              ✕
            </button>
          </div>
        )}
        <div style={{ padding: '2rem' }}>
          {children}
        </div>
        {footer && (
          <div style={{
            padding: '1.5rem 2rem',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// 9. INPUT / FORM FIELD
// ============================================

interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  icon,
  fullWidth = false,
  disabled = false
}) => {
  return (
    <div style={{ width: fullWidth ? '100%' : 'auto' }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          color: 'var(--text)',
          fontWeight: 600,
          fontSize: '0.95rem'
        }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-secondary)',
            fontSize: '1.25rem'
          }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          style={{
            width: '100%',
            padding: icon ? '0.875rem 1rem 0.875rem 3rem' : '0.875rem 1rem',
            background: 'var(--bg-card)',
            border: `1px solid ${error ? 'var(--error)' : 'var(--border)'}`,
            borderRadius: '10px',
            color: 'var(--text)',
            fontSize: '1rem',
            transition: 'all 0.3s ease',
            outline: 'none',
            opacity: disabled ? 0.6 : 1,
            cursor: disabled ? 'not-allowed' : 'text'
          }}
          onFocus={(e) => {
            if (!error) {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(34, 211, 238, 0.1)';
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>
      {error && (
        <span style={{
          display: 'block',
          marginTop: '0.5rem',
          color: 'var(--error)',
          fontSize: '0.875rem'
        }}>
          {error}
        </span>
      )}
    </div>
  );
};

// ============================================
// 10. ALERT / NOTIFICATION
// ============================================

interface AlertProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  message,
  onClose
}) => {
  const getAlertStyle = () => {
    const baseStyle = {
      padding: '1rem 1.5rem',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '1rem',
      border: '1px solid'
    };

    switch (type) {
      case 'success':
        return {
          ...baseStyle,
          background: 'rgba(34, 197, 94, 0.1)',
          borderColor: 'var(--success)',
          color: 'var(--success)'
        };
      case 'error':
        return {
          ...baseStyle,
          background: 'rgba(239, 68, 68, 0.1)',
          borderColor: 'var(--error)',
          color: 'var(--error)'
        };
      case 'warning':
        return {
          ...baseStyle,
          background: 'rgba(245, 158, 11, 0.1)',
          borderColor: '#f59e0b',
          color: '#f59e0b'
        };
      default:
        return {
          ...baseStyle,
          background: 'rgba(34, 211, 238, 0.1)',
          borderColor: 'var(--accent)',
          color: 'var(--accent)'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✕';
      case 'warning': return '⚠';
      default: return 'ℹ';
    }
  };

  return (
    <div style={getAlertStyle()}>
      <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>
        {getIcon()}
      </span>
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{
            fontWeight: 700,
            marginBottom: '0.25rem',
            fontSize: '1rem'
          }}>
            {title}
          </div>
        )}
        <div style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem'
        }}>
          {message}
        </div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '1.25rem',
            color: 'inherit',
            cursor: 'pointer',
            padding: '0.25rem',
            opacity: 0.7,
            transition: 'opacity 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
        >
          ✕
        </button>
      )}
    </div>
  );
};

// ============================================
// EXEMPLO DE USO
// ============================================

export const DashboardExample: React.FC = () => {
  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <SidebarNav
        logo={<div style={{ fontSize: '1.5rem', fontWeight: 800 }}>ClonUp</div>}
        items={[
          { icon: '📊', label: 'Dashboard', href: '/', active: true },
          { icon: '📄', label: 'Páginas', href: '/pages' },
          { icon: '📝', label: 'Quiz', href: '/quiz' },
          { icon: '📈', label: 'Análises', href: '/analytics' },
          { icon: '⚙️', label: 'Configurações', href: '/settings' }
        ]}
        onItemClick={(item) => console.log('Clicked:', item.label)}
      />

      {/* Main Content */}
      <div style={{ marginLeft: '260px', flex: 1 }}>
        <DashboardHeader
          title="Dashboard"
          user={{ name: 'João Silva' }}
          actions={
            <Button variant="primary" icon={<i className="fas fa-plus" />}>
              Novo Projeto
            </Button>
          }
        />

        <div style={{ padding: '2rem' }}>
          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <StatCard
              icon={<i className="fas fa-users" />}
              label="Total de Usuários"
              value="1,234"
              change="+12% vs mês passado"
              changeType="positive"
            />
            <StatCard
              icon={<i className="fas fa-chart-line" />}
              label="Conversões"
              value="456"
              change="+8% vs mês passado"
              changeType="positive"
            />
            <StatCard
              icon={<i className="fas fa-dollar-sign" />}
              label="Receita"
              value="R$ 12.5k"
              change="-3% vs mês passado"
              changeType="negative"
            />
          </div>

          {/* Alert */}
          <Alert
            type="success"
            title="Sucesso!"
            message="Suas alterações foram salvas com sucesso."
          />
        </div>
      </div>
    </div>
  );
};

