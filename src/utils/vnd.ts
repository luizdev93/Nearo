/** Vietnamese Dong (VND) price formatting and parsing */

const VND_SYMBOL = '₫';

/** Format number as VND: 1000000 -> "1.000.000 ₫" */
export function formatVnd(value: number): string {
  if (Number.isNaN(value) || value < 0) return '';
  const s = Math.floor(value).toString();
  const parts: string[] = [];
  for (let i = s.length; i > 0; i -= 3) {
    parts.unshift(s.slice(Math.max(0, i - 3), i));
  }
  return parts.join('.') + ' ' + VND_SYMBOL;
}

/** Parse VND string to number: "1.000.000 ₫" -> 1000000 */
export function parseVnd(value: string): number {
  const digits = value.replace(/\D/g, '');
  if (digits === '') return 0;
  return parseInt(digits, 10);
}

/** Format for input: display with dots as thousand separator */
export function formatVndInput(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits === '') return '';
  const parts: string[] = [];
  for (let i = digits.length; i > 0; i -= 3) {
    parts.unshift(digits.slice(Math.max(0, i - 3), i));
  }
  return parts.join('.');
}
