import React from 'react';

/**
 * Civic Standard Button Component
 * Variants:
 * - primary: Navy background (#173B57), white text
 * - secondary: White background, navy text, border
 * - accent: Saffron background (#E89922), dark navy text
 * - destructive: Crimson red border/background
 * - outline: Subtle border, neutral hover
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  icon: Icon,
  iconPosition = 'left',
  ...rest
}) => {
  const variantClassMap = {
    primary: 'btn-civic-primary',
    secondary: 'btn-civic-secondary',
    accent: 'btn-civic-accent',
    destructive: 'btn-civic-destructive',
    'destructive-solid': 'btn-civic-destructive-solid',
    outline: 'btn-civic-outline'
  };

  const sizeClassMap = {
    sm: 'py-1.5 px-3 fs-6',
    md: 'py-2 px-4',
    lg: 'py-2.5 px-5 fs-5'
  };

  const variantClass = variantClassMap[variant] || 'btn-civic-primary';
  const sizeClass = sizeClassMap[size] || '';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      {...rest}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={18} aria-hidden="true" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon size={18} aria-hidden="true" />}
        </>
      )}
    </button>
  );
};

export default Button;
