import React from 'react';
import { AlertCircle } from 'lucide-react';

const SelectField = ({
  id,
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error = null,
  helperText = null,
  className = '',
  placeholder
}) => {
  const fieldId = id || `select-${name}`;
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

      <select
        id={fieldId}
        name={name}
        value={value ?? ''}
        onChange={onChange}
        required={required}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={
          [error ? errorId : null, helperText ? helperId : null]
            .filter(Boolean)
            .join(' ') || undefined
        }
        className={`civic-select ${error ? 'has-error' : ''}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => {
          const optValue = typeof opt === 'object' ? opt.value : opt;
          const optLabel = typeof opt === 'object' ? opt.label : opt;
          return (
            <option key={String(optValue)} value={optValue}>
              {optLabel}
            </option>
          );
        })}
      </select>

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

export default SelectField;
