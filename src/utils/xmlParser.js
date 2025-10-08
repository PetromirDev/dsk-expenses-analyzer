import xml2js from 'xml2js'

export const defaultBusinessMapping = {
  LIDL: 'Lidl',
  KAUFLAND: 'Kaufland',
  BILLA: 'Billa',
  SHELL: 'Shell',
  DOMINOS: "Domino's Pizza",
  TECHNOPOLIS: 'Technopolis'
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
