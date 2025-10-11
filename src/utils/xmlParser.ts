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
  BusinessSpending,
  Subscription,
  SubscriptionPayment
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

const BULGARIAN_CITIES = [
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
].sort((a, b) => b.length - a.length)

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
  const result = getBusinessInfo(oppositeSideName)
  return result.name
}

// Function to get business name and subscription eligibility
export function getBusinessInfo(oppositeSideName: string): {
  name: string
  canBeSubscription: boolean
} {
  if (!oppositeSideName || oppositeSideName.trim() === '') {
    return { name: 'Без име', canBeSubscription: true }
  }

  // Normalize the input (transliterate Cyrillic to Latin and uppercase)
  const normalizedInput = normalizeText(oppositeSideName)

  // First priority: Check exact custom mappings
  const customMappings = getCustomMappings()
  if (customMappings[oppositeSideName]) {
    // Custom mappings are always eligible for subscriptions
    return { name: customMappings[oppositeSideName], canBeSubscription: true }
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
        // Use merchant's canBeSubscription flag, default to false if not set
        return {
          name: merchant.name,
          canBeSubscription: !!merchant.canBeSubscription
        }
      }
    }
  }

  // If no mapping found, clean up the name and allow as subscription (unknown merchant)
  return { name: cleanBusinessName(oppositeSideName), canBeSubscription: true }
}

// Helper function to clean up business names that don't have mappings
function cleanBusinessName(name: string): string {
  // Remove country codes (BGR, LUX, DEU, FRA, USA, etc.)
  let cleaned = name.replace(/^[A-Z]{3}\s+/i, '')

  // Remove city names at the start (common pattern in Bulgarian bank exports)
  for (const city of BULGARIAN_CITIES) {
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

// Function to detect potential subscriptions
function detectSubscriptions(transactions: Transaction[]): Subscription[] {
  const PRICE_THRESHOLD_PERCENTAGE = 0.1
  const DATE_TOLERANCE_DAYS = 3
  const MINIMUM_CONSECUTIVE_MONTHS = 2
  const subscriptions: Subscription[] = []

  // Filter only Debit transactions without OppositeSideAccount (not bank transfers)
  // AND where canBeSubscription is true
  const eligibleTransactions = transactions.filter(
    (t) =>
      t.movementType === 'Debit' &&
      (!t.oppositeSideAccount || t.oppositeSideAccount.trim() === '') &&
      t.canBeSubscription
  )

  // Group by business name
  const businessGroups: Record<string, Transaction[]> = {}
  eligibleTransactions.forEach((t) => {
    if (!businessGroups[t.businessName]) {
      businessGroups[t.businessName] = []
    }
    businessGroups[t.businessName].push(t)
  })

  // Analyze each business for subscription patterns
  Object.entries(businessGroups).forEach(([businessName, txns]) => {
    if (txns.length < MINIMUM_CONSECUTIVE_MONTHS) return

    // Sort by date (oldest first)
    const sortedTxns = [...txns].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())

    // Group transactions by month-year
    const monthlyTxns: Record<string, Transaction[]> = {}
    sortedTxns.forEach((t) => {
      const monthKey = `${t.dateObj.getFullYear()}-${String(t.dateObj.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyTxns[monthKey]) {
        monthlyTxns[monthKey] = []
      }
      monthlyTxns[monthKey].push(t)
    })

    // Get sorted month keys
    const monthKeys = Object.keys(monthlyTxns).sort()

    // Find consecutive month sequences with similar amounts AND same day of month (±1 day)
    let currentSequence: SubscriptionPayment[] = []
    let lastAmount: number | null = null
    let lastMonthKey: string | null = null
    let lastDayOfMonth: number | null = null

    monthKeys.forEach((monthKey) => {
      // Use the first transaction of the month for subscription detection
      const monthTxn = monthlyTxns[monthKey][0]
      const currentAmount = monthTxn.amount
      const currentDayOfMonth = monthTxn.dateObj.getDate()

      if (lastAmount === null) {
        // First transaction in potential sequence
        currentSequence = [
          {
            date: monthTxn.dateObj,
            amount: currentAmount,
            monthYear: monthTxn.monthYear,
            transaction: monthTxn
          }
        ]
        lastAmount = currentAmount
        lastMonthKey = monthKey
        lastDayOfMonth = currentDayOfMonth
      } else {
        // Check if this month is consecutive
        const [lastYear, lastMonth] = lastMonthKey!.split('-').map(Number)
        const [currentYear, currentMonth] = monthKey.split('-').map(Number)

        const lastDate = new Date(lastYear, lastMonth - 1)
        const currentDate = new Date(currentYear, currentMonth - 1)
        const monthDiff =
          (currentDate.getFullYear() - lastDate.getFullYear()) * 12 +
          (currentDate.getMonth() - lastDate.getMonth())

        const isConsecutive = monthDiff === 1

        // Check if day of month is within ±1 day tolerance
        const dayDifference = Math.abs(currentDayOfMonth - lastDayOfMonth!)
        const isWithinDaysThreshold = dayDifference <= DATE_TOLERANCE_DAYS

        if (isConsecutive && isWithinDaysThreshold) {
          // Check if amount is within threshold
          const threshold = lastAmount * PRICE_THRESHOLD_PERCENTAGE
          const lowerBound = lastAmount - threshold
          const upperBound = lastAmount + threshold

          if (currentAmount >= lowerBound && currentAmount <= upperBound) {
            // Add to current sequence
            currentSequence.push({
              date: monthTxn.dateObj,
              amount: currentAmount,
              monthYear: monthTxn.monthYear,
              transaction: monthTxn
            })
            lastAmount = currentAmount // Update reference amount for next comparison
            lastMonthKey = monthKey
            lastDayOfMonth = currentDayOfMonth
          } else {
            // Amount outside threshold - end current sequence if it's valid
            if (currentSequence.length >= 2) {
              createSubscription(businessName, currentSequence, subscriptions)
            }
            // Start new sequence
            currentSequence = [
              {
                date: monthTxn.dateObj,
                amount: currentAmount,
                monthYear: monthTxn.monthYear,
                transaction: monthTxn
              }
            ]
            lastAmount = currentAmount
            lastMonthKey = monthKey
            lastDayOfMonth = currentDayOfMonth
          }
        } else {
          // Not consecutive or not same day - end current sequence if it's valid
          if (currentSequence.length >= MINIMUM_CONSECUTIVE_MONTHS) {
            createSubscription(businessName, currentSequence, subscriptions)
          }
          // Start new sequence
          currentSequence = [
            {
              date: monthTxn.dateObj,
              amount: currentAmount,
              monthYear: monthTxn.monthYear,
              transaction: monthTxn
            }
          ]
          lastAmount = currentAmount
          lastMonthKey = monthKey
          lastDayOfMonth = currentDayOfMonth
        }
      }
    })

    // Check final sequence
    if (currentSequence.length >= MINIMUM_CONSECUTIVE_MONTHS) {
      createSubscription(businessName, currentSequence, subscriptions)
    }
  })

  // Sort subscriptions by last payment date (most recent first)
  return subscriptions.sort((a, b) => b.lastPayment.getTime() - a.lastPayment.getTime())
}

// Helper function to create a subscription from a payment sequence
function createSubscription(
  businessName: string,
  payments: SubscriptionPayment[],
  subscriptions: Subscription[]
) {
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0)
  const averageAmount = totalAmount / payments.length
  const firstPayment = payments[0].date
  const lastPayment = payments[payments.length - 1].date

  // Check if subscription is active (last payment was within the last 45 days)
  const now = new Date()
  const daysSinceLastPayment = (now.getTime() - lastPayment.getTime()) / (1000 * 60 * 60 * 24)
  const isActive = daysSinceLastPayment <= 45

  subscriptions.push({
    businessName,
    payments,
    averageAmount,
    isActive,
    firstPayment,
    lastPayment,
    consecutiveMonths: payments.length
  })
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
    const oppositeSideAccount = movement.OppositeSideAccount?.[0] || ''
    const movementType = movement.MovementType[0]
    const businessInfo = getBusinessInfo(oppositeSideName)
    const monthYear = getMonthYear(date)

    const transaction: Transaction = {
      date: movement.ValueDate[0],
      dateObj: date,
      amount,
      oppositeSideName,
      oppositeSideAccount,
      businessName: businessInfo.name,
      canBeSubscription: businessInfo.canBeSubscription,
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
      const businessName = businessInfo.name
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

  // Detect subscriptions
  const subscriptions = detectSubscriptions(transactions)

  return {
    totalSpent,
    totalIncome,
    netBalance: totalIncome - totalSpent,
    monthlySpending,
    businessSpending,
    subscriptions,
    transactions: transactions.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())
  }
}
