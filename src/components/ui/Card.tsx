import React from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'hover' | 'elevated';
  padding?: string;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = '2rem',
  className = '',
  onClick
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'hover': return 'feature-card';
      case 'elevated': return 'pricing-card';
      default: return 'dashboard-card';
    }
  };

  return (
    <div
      className={`${getVariantClass()} ${className}`}
      style={{ padding }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

