/**
 * Admin Dashboard Formatting Utilities
 */

export const formatConditionValue = (value: string | null | undefined): string => {
  if (!value) return 'N/A';
  return value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
};

export const formatArrayValue = (arr: string[] | null | undefined): string => {
  if (!arr || arr.length === 0) return 'None';
  if (arr.includes('none')) return 'None';
  return arr.map(item => formatConditionValue(item)).join(', ');
};

export const formatBooleanValue = (
  value: boolean | null | undefined,
  trueLabel: string,
  falseLabel: string
): string => {
  if (value === null || value === undefined) return 'N/A';
  return value ? trueLabel : falseLabel;
};

export const formatKeys = (value: string | null | undefined): string => {
  if (!value) return 'N/A';
  if (value === '1') return '1 Key';
  if (value === '2+') return '2+ Keys';
  return value;
};

export const formatTiresReplaced = (value: string | null | undefined): string => {
  if (!value || value === 'none') return 'None in last 12 months';
  return `${value} tire${value === '1' ? '' : 's'} replaced`;
};

export const formatAccidentHistory = (value: string | null | undefined): string => {
  if (!value || value === 'none') return 'No accidents';
  if (value === '1') return '1 accident';
  if (value === '2+') return '2+ accidents';
  return value;
};

export const formatSellOrTrade = (value: string | null | undefined): string => {
  if (!value) return 'N/A';
  if (value === 'sell') return 'Sell outright';
  if (value === 'trade') return 'Trade-in';
  if (value === 'not-sure') return 'Not sure yet';
  return value;
};

export const formatLoanOrLease = (value: string | null | undefined): string => {
  if (!value) return 'N/A';
  if (value === 'loan') return 'Has loan';
  if (value === 'lease') return 'Leased vehicle';
  if (value === 'neither') return 'Owned outright';
  return value;
};

export const formatCurrency = (value: number): string => {
  return `$${value.toLocaleString()}`;
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString();
};
