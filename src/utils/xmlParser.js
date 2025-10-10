import xml2js from 'xml2js'

export const defaultBusinessMapping = {
  LIDL: 'Lidl',
  KAUFLAND: 'Kaufland',
  BILLA: 'Billa',
  SHELL: 'Shell',
  DOMINOS: "Domino's Pizza",
  TECHNOPOLIS: 'Technopolis'
}

// Default groups
export const defaultGroups = [
  'Храна',
  'Жилище',
  'Битови',
  'Транспорт',
  'Развлечения',
  'Здраве',
  'Облекло',
  'Други'
]

// Default business-to-group mappings
export const defaultBusinessGroupMapping = {
  Lidl: 'Храна',
  Kaufland: 'Храна',
  Billa: 'Храна',
  Shell: 'Транспорт',
  "Domino's Pizza": 'Храна',
  Technopolis: 'Битови'
}

// Get custom mappings from localStorage
export function getCustomMappings() {
  const stored = localStorage.getItem('customBusinessMappings')
  return stored ? JSON.parse(stored) : {}
}

// Save custom mappings to localStorage
export function saveCustomMapping(originalName, newName) {
  const customMappings = getCustomMappings()
  customMappings[originalName] = newName
  localStorage.setItem('customBusinessMappings', JSON.stringify(customMappings))
}

// Get custom groups from localStorage
export function getCustomGroups() {
  const stored = localStorage.getItem('customGroups')
  return stored ? JSON.parse(stored) : []
}

// Save custom group to localStorage
export function saveCustomGroup(groupName) {
  const customGroups = getCustomGroups()
  if (!customGroups.includes(groupName)) {
    customGroups.push(groupName)
    localStorage.setItem('customGroups', JSON.stringify(customGroups))
  }
}

// Delete custom group
export function deleteCustomGroup(groupName) {
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
export function getAllGroups() {
  return [...defaultGroups, ...getCustomGroups()]
}

// Get business-to-group mappings from localStorage
export function getBusinessGroupMappings() {
  const stored = localStorage.getItem('businessGroupMappings')
  return stored ? JSON.parse(stored) : {}
}

// Save business-to-group mapping
export function saveBusinessGroupMapping(businessName, groupName) {
  const mappings = getBusinessGroupMappings()
  mappings[businessName] = groupName
  localStorage.setItem('businessGroupMappings', JSON.stringify(mappings))
}

// Get group for a business
export function getBusinessGroup(businessName) {
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
export function exportSettings() {
  return {
    version: '1.0',
    customBusinessMappings: getCustomMappings(),
    customGroups: getCustomGroups(),
    businessGroupMappings: getBusinessGroupMappings(),
    exportDate: new Date().toISOString()
  }
}

// Import settings from a JSON object
export function importSettings(settingsData) {
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
export function getAllMappings() {
  return { ...defaultBusinessMapping, ...getCustomMappings() }
}

// Function to parse amount from string format (e.g., "18,20" -> 18.20)
export function parseAmount(amountStr) {
  return parseFloat(amountStr.replace(',', '.'))
}

// Function to parse date from DD.MM.YYYY format
export function parseDate(dateStr) {
  const [day, month, year] = dateStr.split('.')
  return new Date(year, month - 1, day)
}

// Function to get human-readable business name
export function getBusinessName(oppositeSideName) {
  if (!oppositeSideName || oppositeSideName.trim() === '') {
    return 'Без име'
  }

  const allMappings = getAllMappings()

  for (const [key, value] of Object.entries(allMappings)) {
    if (oppositeSideName.toUpperCase().includes(key.toUpperCase())) {
      return value
    }
  }
  return oppositeSideName // Return original if no mapping found
}

// Function to format currency
export function formatCurrency(amount) {
  return `${amount.toFixed(2)} лв.`
}

// Function to get month-year key for grouping
export function getMonthYear(date) {
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
export async function analyzeXML(xmlContent) {
  const parser = new xml2js.Parser()
  const result = await parser.parseStringPromise(xmlContent)

  const movements = result.AccountMovements.AccountMovement

  // Initialize counters and aggregators
  let totalSpent = 0
  let totalIncome = 0
  const monthlyData = {}
  const businessData = {}
  const transactions = []

  // Process each movement
  movements.forEach((movement) => {
    const amount = parseAmount(movement.Amount[0])
    const date = parseDate(movement.ValueDate[0])
    const oppositeSideName = movement.OppositeSideName[0]
    const movementType = movement.MovementType[0]
    const businessName = getBusinessName(oppositeSideName)
    const monthYear = getMonthYear(date)

    const transaction = {
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
    (a, b) => b.transactions[0].dateObj - a.transactions[0].dateObj
  )

  const businessSpending = Object.values(businessData).sort((a, b) => b.amount - a.amount)

  return {
    totalSpent,
    totalIncome,
    netBalance: totalIncome - totalSpent,
    monthlySpending,
    businessSpending,
    transactions: transactions.sort((a, b) => b.dateObj - a.dateObj)
  }
}
