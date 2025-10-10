import type { MonthlySpending, BusinessSpending } from '../types'

export function isBusinessSpending(
  item: MonthlySpending | BusinessSpending
): item is BusinessSpending {
  return 'name' in item && 'group' in item
}

export function getItemName(item: MonthlySpending | BusinessSpending): string {
  return isBusinessSpending(item) ? item.name : item.month
}

export function getItemGroup(item: MonthlySpending | BusinessSpending): string | undefined {
  return isBusinessSpending(item) ? item.group : undefined
}

export function filterData(
  data: (MonthlySpending | BusinessSpending)[],
  searchTerm: string,
  view: 'month' | 'business'
): (MonthlySpending | BusinessSpending)[] {
  if (!searchTerm.trim()) return data

  return data.filter((item) => {
    const searchIn =
      view === 'month'
        ? isBusinessSpending(item)
          ? ''
          : item.month
        : isBusinessSpending(item)
          ? item.name
          : ''
    return searchIn.toLowerCase().includes(searchTerm.toLowerCase())
  })
}
