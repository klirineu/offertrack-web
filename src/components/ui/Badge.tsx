import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  className = ''
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'success': return 'badge badge-success';
      case 'warning': return 'badge badge-warning';
      case 'error': return 'badge badge-error';
      case 'info': return 'badge badge-info';
      default: return 'badge badge-primary';
    }
  };

  const getSizeStyle = (): React.CSSProperties => {
    switch (size) {
      case 'small': return { padding: '0.25rem 0.75rem', fontSize: '0.75rem' };
      case 'large': return { padding: '0.75rem 1.5rem', fontSize: '1rem' };
      default: return {};
    }
  };

  return (
    <span
      className={`${getVariantClass()} ${className}`}
      style={getSizeStyle()}
    >
      {children}
    </span>
  );
};

