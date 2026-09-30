import React from 'react';
import { AlertCircle } from 'lucide-react';

const FormField = ({
  id,
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  error = null,
  helperText = null,
  prefix = null,
  min,
  max,
  step,
  className = '',
  autoComplete
}) => {
  const fieldId = id || `field-${name}`;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  return (
    <div className={`civic-form-group ${className}`}>
      {label && (
        <label htmlFor={fieldId} className="civic-label">
          {label}
          {required && <span className="required-mark" aria-hidden="true">*</span>}
        </label>
      )}

      <div className={prefix ? 'civic-input-group' : ''}>
        {prefix && <span className="civic-input-prefix">{prefix}</span>}
        <input
          id={fieldId}
          name={name}
          type={type}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={
            [error ? errorId : null, helperText ? helperId : null]
              .filter(Boolean)
              .join(' ') || undefined
          }
          className={`civic-input ${prefix ? 'civic-input-with-prefix' : ''} ${error ? 'has-error' : ''}`}
        />
      </div>

      {helperText && !error && (
        <div id={helperId} className="civic-helper">
          {helperText}
        </div>
      )}

      {error && (
        <div id={errorId} className="civic-error-message" role="alert">
          <AlertCircle size={14} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormField;
