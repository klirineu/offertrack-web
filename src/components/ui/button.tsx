import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  icon,
  type = 'button',
  className = ''
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary': return 'cta-button';
      case 'secondary': return 'secondary-button';
      case 'success': return 'starter-button';
      default: return 'cta-button';
    }
  };

  const getSizeStyle = (): React.CSSProperties => {
    switch (size) {
      case 'small': return { padding: '0.5rem 1rem', fontSize: '0.875rem' };
      case 'medium': return { padding: '0.8rem 1.75rem', fontSize: '1rem' };
      case 'large': return { padding: '1.25rem 2.5rem', fontSize: '1.25rem' };
      default: return {};
    }
  };

  return (
    <button
      type={type}
      className={`${getVariantClass()} ${className}`}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...getSizeStyle(),
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};
