/**
 * Date utilities
 */

/**
 * Parse date from DD.MM.YYYY format (DSK format)
 */
export function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('.')
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
}

/**
 * Get month-year key for grouping in Bulgarian format
 */
export function getMonthYear(date: Date): string {
  const monthNames = [
    'Януари',
    'Февруари',
    'Март',
    'Април',
    'Май',
    'Юни',
    'Юли',
    'Август',
    'Септември',
    'Октомври',
    'Ноември',
    'Декември'
  ]
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`
}
