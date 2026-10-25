// FinPredict.js - Indian Rupee (INR / ₹) Currency Formatting Utilities
// Implements standard Indian numbering system (Lakhs, Crores, Thousands) and currency symbols

export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';

export interface CurrencyFormatOptions {
  decimals?: number;
  showSymbol?: boolean;
  compact?: boolean;
}

/**
 * Formats any numerical amount into Indian Rupee (INR / ₹) format.
 * Examples:
 *   formatINR(85000) => "₹85,000.00"
 *   formatINR(1250000, { compact: true }) => "₹12.50 L"
 *   formatINR(-15200) => "-₹15,200.00"
 *   formatINR(5400, { decimals: 0 }) => "₹5,400"
 */
export function formatINR(
  amount: number | undefined | null,
  options: CurrencyFormatOptions = {}
): string {
  const { decimals = 2, showSymbol = true, compact = false } = options;
  if (amount === undefined || amount === null || isNaN(amount)) {
    return showSymbol ? `${CURRENCY_SYMBOL}0.00` : '0.00';
  }

  const symbolPrefix = showSymbol ? CURRENCY_SYMBOL : '';
  const isNegative = amount < 0;
  const abs = Math.abs(amount);

  if (compact) {
    const sign = isNegative ? '-' : '';
    if (abs >= 10000000) {
      return `${sign}${symbolPrefix}${(abs / 10000000).toFixed(decimals)} Cr`;
    }
    if (abs >= 100000) {
      return `${sign}${symbolPrefix}${(abs / 100000).toFixed(decimals)} L`;
    }
    if (abs >= 1000) {
      return `${sign}${symbolPrefix}${(abs / 1000).toFixed(decimals)}k`;
    }
    return `${sign}${symbolPrefix}${abs.toFixed(decimals)}`;
  }

  const formatted = abs.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });

  return isNegative ? `-${symbolPrefix}${formatted}` : `${symbolPrefix}${formatted}`;
}

/**
 * Compact Rupee formatter for charts and axis labels
 * e.g. 150000 => "₹1.5L", 45000 => "₹45k"
 */
export function formatINRCompact(amount: number): string {
  return formatINR(amount, { compact: true, decimals: 1 });
}
