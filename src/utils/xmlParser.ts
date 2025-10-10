import xml2js from 'xml2js'
import merchantsConfig from '../data/merchants.json'
import type {
  MerchantDatabase,
  CustomMappings,
  BusinessGroupMappings,
  SettingsData,
  AnalysisResult,
  Transaction,
  MonthlySpending,
  BusinessSpending
} from '../types'

// Transliteration map for Bulgarian Cyrillic to Latin
const transliterationMap: Record<string, string> = {
  А: 'A',
  Б: 'B',
  В: 'V',
  Г: 'G',
  Д: 'D',
  Е: 'E',
  Ж: 'ZH',
  З: 'Z',
  И: 'I',
  Й: 'Y',
  К: 'K',
  Л: 'L',
  М: 'M',
  Н: 'N',
  О: 'O',
  П: 'P',
  Р: 'R',
  С: 'S',
  Т: 'T',
  У: 'U',
  Ф: 'F',
  Х: 'H',
  Ц: 'TS',
  Ч: 'CH',
  Ш: 'SH',
  Щ: 'SHT',
  Ъ: 'A',
  Ь: 'Y',
  Ю: 'YU',
  Я: 'YA'
}

// Function to normalize text (transliterate Cyrillic and uppercase)
function normalizeText(text: string): string {
  if (!text) return ''
  return text
    .toUpperCase()
    .split('')
    .map((char) => transliterationMap[char] || char)
    .join('')
    .trim()
}

// Build merchant database from JSON config
export const merchantDatabase: MerchantDatabase = Object.values(merchantsConfig)
  .flat()
  .reduce((acc, merchant) => {
    acc[merchant.id] = merchant
    return acc
  }, {} as MerchantDatabase)

// Legacy mapping for backward compatibility
export const defaultBusinessMapping: Record<string, string> = {
  LIDL: 'Lidl',
  KAUFLAND: 'Kaufland',
  BILLA: 'Billa',
  SHELL: 'Shell',
  DOMINOS: "Domino's Pizza",
  TECHNOPOLIS: 'Technopolis'
}

// Default groups
export const defaultGroups: string[] = [
  'Храна',
  'Техника',
  'Жилище',
  'Битови',
  'Транспорт',
  'Развлечения',
  'Ресторанти',
  'Онлайн пазаруване',
  'Здраве',
  'Облекло',
  'Други'
]

// Build defaultBusinessGroupMapping from merchantDatabase
export const defaultBusinessGroupMapping: Record<string, string> = Object.values(
  merchantDatabase
).reduce(
  (acc, merchant) => {
    acc[merchant.name] = merchant.category
    return acc
  },
  {} as Record<string, string>
)

// Get custom mappings from localStorage
export function getCustomMappings(): CustomMappings {
  const stored = localStorage.getItem('customBusinessMappings')
  return stored ? JSON.parse(stored) : {}
}

// Save custom mappings to localStorage
export function saveCustomMapping(originalName: string, newName: string): void {
  const customMappings = getCustomMappings()
  customMappings[originalName] = newName
  localStorage.setItem('customBusinessMappings', JSON.stringify(customMappings))
}

// Get custom groups from localStorage
export function getCustomGroups(): string[] {
  const stored = localStorage.getItem('customGroups')
  return stored ? JSON.parse(stored) : []
}

// Save custom group to localStorage
export function saveCustomGroup(groupName: string): void {
  const customGroups = getCustomGroups()
  if (!customGroups.includes(groupName)) {
    customGroups.push(groupName)
    localStorage.setItem('customGroups', JSON.stringify(customGroups))
  }
}

// Delete custom group
export function deleteCustomGroup(groupName: string): void {
  const customGroups = getCustomGroups().filter((g) => g !== groupName)
  localStorage.setItem('customGroups', JSON.stringify(customGroups))

  // Also remove any business-group mappings using this group
  const businessGroupMappings = getBusinessGroupMappings()
  Object.keys(businessGroupMappings).forEach((business) => {
    if (businessGroupMappings[business] === groupName) {
      delete businessGroupMappings[business]
    }
  })
  localStorage.setItem('businessGroupMappings', JSON.stringify(businessGroupMappings))
}

// Get all groups (default + custom)
export function getAllGroups(): string[] {
  return [...defaultGroups, ...getCustomGroups()]
}

// Get business-to-group mappings from localStorage
export function getBusinessGroupMappings(): BusinessGroupMappings {
  const stored = localStorage.getItem('businessGroupMappings')
  return stored ? JSON.parse(stored) : {}
}

// Save business-to-group mapping
export function saveBusinessGroupMapping(businessName: string, groupName: string): void {
  const mappings = getBusinessGroupMappings()
  mappings[businessName] = groupName
  localStorage.setItem('businessGroupMappings', JSON.stringify(mappings))
}

// Get group for a business
export function getBusinessGroup(businessName: string): string {
  const customMappings = getBusinessGroupMappings()
  if (customMappings[businessName]) {
    return customMappings[businessName]
  }

  if (defaultBusinessGroupMapping[businessName]) {
    return defaultBusinessGroupMapping[businessName]
  }

  return 'Други'
}

// Export all settings to a JSON object
export function exportSettings(): SettingsData {
  return {
    version: '1.0',
    customBusinessMappings: getCustomMappings(),
    customGroups: getCustomGroups(),
    businessGroupMappings: getBusinessGroupMappings(),
    exportDate: new Date().toISOString()
  }
}

// Import settings from a JSON object
export function importSettings(settingsData: SettingsData): boolean {
  try {
    if (!settingsData.version) {
      throw new Error('Invalid settings file format')
    }

    // Import custom business mappings
    if (settingsData.customBusinessMappings) {
      localStorage.setItem(
        'customBusinessMappings',
        JSON.stringify(settingsData.customBusinessMappings)
      )
    }

    // Import custom groups
    if (settingsData.customGroups) {
      localStorage.setItem('customGroups', JSON.stringify(settingsData.customGroups))
    }

    // Import business-group mappings
    if (settingsData.businessGroupMappings) {
      localStorage.setItem(
        'businessGroupMappings',
        JSON.stringify(settingsData.businessGroupMappings)
      )
    }

    return true
  } catch (error) {
    console.error('Error importing settings:', error)
    return false
  }
}

// Get all mappings (default + custom)
export function getAllMappings(): Record<string, string> {
  return { ...defaultBusinessMapping, ...getCustomMappings() }
}

// Function to parse amount from string format (e.g., "18,20" -> 18.20)
export function parseAmount(amountStr: string): number {
  return parseFloat(amountStr.replace(',', '.'))
}

// Function to parse date from DD.MM.YYYY format
export function parseDate(dateStr: string): Date {
  const [day, month, year] = dateStr.split('.')
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
}

// Enhanced function to get human-readable business name with transliteration and fuzzy matching
export function getBusinessName(oppositeSideName: string): string {
  if (!oppositeSideName || oppositeSideName.trim() === '') {
    return 'Без име'
  }

  // Normalize the input (transliterate Cyrillic to Latin and uppercase)
  const normalizedInput = normalizeText(oppositeSideName)

  // First priority: Check exact custom mappings
  const customMappings = getCustomMappings()
  if (customMappings[oppositeSideName]) {
    return customMappings[oppositeSideName]
  }

  // Second priority: Check merchantDatabase with pattern matching
  // Sort merchants by longest pattern first for better matching
  const merchants = Object.values(merchantDatabase)
  const sortedMerchants = merchants.sort((a, b) => {
    const maxLengthA = Math.max(...a.patterns.map((p) => p.length))
    const maxLengthB = Math.max(...b.patterns.map((p) => p.length))
    return maxLengthB - maxLengthA
  })

  for (const merchant of sortedMerchants) {
    for (const pattern of merchant.patterns) {
      const normalizedPattern = normalizeText(pattern)

      // Check if the normalized pattern is in the normalized input
      if (normalizedInput.includes(normalizedPattern)) {
        return merchant.name
      }
    }
  }

  // Third priority: Check legacy defaultBusinessMapping
  const upperName = oppositeSideName.toUpperCase()
  for (const [key, value] of Object.entries(defaultBusinessMapping)) {
    if (upperName.includes(key.toUpperCase())) {
      return value
    }
  }

  // If no mapping found, clean up the name
  return cleanBusinessName(oppositeSideName)
}

// Helper function to clean up business names that don't have mappings
function cleanBusinessName(name: string): string {
  // Remove country codes (BGR, LUX, DEU, FRA, USA, etc.)
  let cleaned = name.replace(/^[A-Z]{3}\s+/i, '')

  // Remove city names at the start (common pattern in Bulgarian bank exports)
  const bulgarianCities = [
    'SOFIA',
    'SOFIYA',
    'SOFIQ',
    'СОФИЯ',
    'VARNA',
    'ВАРНА',
    'BURGAS',
    'БУРГАС',
    'PLOVDIV',
    'ПЛОВДИВ',
    'RUSE',
    'РУСЕ',
    'STARA ZAGORA',
    'СТАРА ЗАГОРА',
    'PLEVEN',
    'ПЛЕВЕН',
    'SLIVEN',
    'СЛИВЕН',
    'DOBRICH',
    'ДОБРИЧ',
    'SHUMEN',
    'ШУМЕН',
    'PERNIK',
    'ПЕРНИК',
    'HASKOVO',
    'ХАСКОВО',
    'YAMBOL',
    'ЯМБОЛ',
    'PAZARDZHIK',
    'ПАЗАРДЖИК',
    'BLAGOEVGRAD',
    'БЛАГОЕВГРАД',
    'VELIKO TARNOVO',
    'ВЕЛИКО ТЪРНОВО',
    'VRACA',
    'ВРАЦА'
  ]

  // Sort by length (longer first) to match multi-word cities first
  bulgarianCities.sort((a, b) => b.length - a.length)

  for (const city of bulgarianCities) {
    const regex = new RegExp(`^${city}\\s+`, 'i')
    cleaned = cleaned.replace(regex, '')
  }

  // Remove common legal suffixes (Bulgarian business types)
  cleaned = cleaned
    .replace(/\s+EOOD$/i, '') // ЕООД - Еднолично дружество с ограничена отговорност
    .replace(/\s+OOD$/i, '') // ООД - Дружество с ограничена отговорност
    .replace(/\s+AD$/i, '') // АД - Акционерно дружество
    .replace(/\s+EAD$/i, '') // ЕАД - Еднолично акционерно дружество
    .replace(/\s+LTD$/i, '') // Ltd - Limited
    .replace(/\s+EOOD$/i, '')
    .replace(/\s+ООД$/i, '')
    .replace(/\s+АД$/i, '')
    .replace(/\s+ЕАД$/i, '')
    .replace(/\s+ЕООД$/i, '')

  // Remove "BULGARIA" suffix
  cleaned = cleaned.replace(/\s+BULGARIA$/i, '').replace(/\s+БЪЛГАРИЯ$/i, '')

  // Trim extra whitespace
  cleaned = cleaned.trim()

  // If the cleaned name is too short or empty, return original
  if (cleaned.length < 3) {
    return name
  }

  // Capitalize first letter of each word for better readability
  cleaned = cleaned
    .toLowerCase()
    .split(' ')
    .map((word) => {
      if (word.length === 0) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')

  return cleaned
}

// Function to format currency
export function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} лв.`
}

// Function to get month-year key for grouping
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

// Main function to parse and analyze XML
export async function analyzeXML(xmlContent: string): Promise<AnalysisResult> {
  const parser = new xml2js.Parser()
  const result = await parser.parseStringPromise(xmlContent)

  const movements = result.AccountMovements.AccountMovement

  // Initialize counters and aggregators
  let totalSpent = 0
  let totalIncome = 0
  const monthlyData: Record<string, MonthlySpending> = {}
  const businessData: Record<string, BusinessSpending> = {}
  const transactions: Transaction[] = []

  // Process each movement
  movements.forEach((movement: any) => {
    const amount = parseAmount(movement.Amount[0])
    const date = parseDate(movement.ValueDate[0])
    const oppositeSideName = movement.OppositeSideName[0]
    const movementType = movement.MovementType[0]
    const businessName = getBusinessName(oppositeSideName)
    const monthYear = getMonthYear(date)

    const transaction: Transaction = {
      date: movement.ValueDate[0],
      dateObj: date,
      amount,
      oppositeSideName,
      businessName,
      movementType,
      monthYear,
      reason: movement.Reason[0]
    }

    transactions.push(transaction)

    if (movementType === 'Debit') {
      // This is spending
      totalSpent += amount

      // Add to monthly spending
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          amount: 0,
          transactions: []
        }
      }
      monthlyData[monthYear].amount += amount
      monthlyData[monthYear].transactions.push(transaction)

      // Add to business spending - now handles merging
      if (!businessData[businessName]) {
        businessData[businessName] = {
          name: businessName,
          originalNames: [oppositeSideName], // Track all original names
          group: getBusinessGroup(businessName),
          amount: 0,
          transactions: []
        }
      } else {
        // Add to originalNames if not already there
        if (!businessData[businessName].originalNames.includes(oppositeSideName)) {
          businessData[businessName].originalNames.push(oppositeSideName)
        }
      }
      businessData[businessName].amount += amount
      businessData[businessName].transactions.push(transaction)
    } else if (movementType === 'Credit') {
      // This is income
      totalIncome += amount
    }
  })

  // Convert to arrays and sort
  const monthlySpending = Object.values(monthlyData).sort(
    (a, b) => b.transactions[0].dateObj.getTime() - a.transactions[0].dateObj.getTime()
  )

  const businessSpending = Object.values(businessData).sort((a, b) => b.amount - a.amount)

  return {
    totalSpent,
    totalIncome,
    netBalance: totalIncome - totalSpent,
    monthlySpending,
    businessSpending,
    transactions: transactions.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
  }
}
