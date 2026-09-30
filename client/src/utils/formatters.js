/**
 * Indian Number and Currency Formatting Utilities
 * Adheres to official GoI guidelines:
 * - ₹2.5 lakh or ₹2,50,000 format
 * - Never returns ₹NaN, undefined, or empty labels
 * - Graceful fallback to 'Not specified'
 */

export const formatCurrencyINR = (amount, options = {}) => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return options.fallback || 'Not specified';
  }

  const num = Number(amount);

  if (options.compact) {
    if (num >= 10000000) {
      const cr = (num / 10000000).toFixed(2).replace(/\.00$/, '');
      return `₹${cr} crore`;
    }
    if (num >= 100000) {
      const lakh = (num / 100000).toFixed(2).replace(/\.00$/, '');
      return `₹${lakh} lakh`;
    }
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

export const formatNumberIN = (value, fallback = '0') => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return fallback;
  }
  return new Intl.NumberFormat('en-IN').format(Number(value));
};

export const extractMaxIncome = (scheme) => {
  if (!scheme) return 'Not specified';
  
  // Direct field if present
  if (typeof scheme.incomeLimitMax === 'number' && !isNaN(scheme.incomeLimitMax)) {
    return formatCurrencyINR(scheme.incomeLimitMax, { compact: true });
  }

  // Check in eligibilityRules array
  if (Array.isArray(scheme.eligibilityRules)) {
    const incomeRule = scheme.eligibilityRules.find(
      r => (r.field === 'familyIncome' || r.field === 'annualIncome') &&
           (r.operator === 'lte' || r.operator === 'lt' || r.operator === '<=' || r.operator === '<')
    );
    if (incomeRule && typeof incomeRule.value === 'number' && !isNaN(incomeRule.value)) {
      return `≤ ${formatCurrencyINR(incomeRule.value, { compact: true })}`;
    }
  }

  // Check in eligibilityRules object
  if (scheme.eligibilityRules && typeof scheme.eligibilityRules === 'object') {
    if (typeof scheme.eligibilityRules.incomeLimitMax === 'number' && !isNaN(scheme.eligibilityRules.incomeLimitMax)) {
      return `≤ ${formatCurrencyINR(scheme.eligibilityRules.incomeLimitMax, { compact: true })}`;
    }
  }

  return 'Not specified';
};
