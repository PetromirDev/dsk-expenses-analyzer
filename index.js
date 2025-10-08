const fs = require('fs')
const xml2js = require('xml2js')
const path = require('path')

// Business name mapping for cleaner reporting
const businessNameMapping = {
	LIDL: 'Lidl (Grocery)',
	KAUFLAND: 'Kaufland (Grocery)',
	BILLA: 'Billa (Grocery)',
	SHELL: 'Shell (Gas Station)',
	DOMINOS: "Domino's Pizza",
	TECHNOPOLIS: 'Technopolis (Electronics)',
	'BGR BURGAS': 'Restaurant (Burgas)',
	'ACME CORP': 'Salary (Acme Corp)',
	'My Savings': 'Internal Transfer'
}

// Function to parse amount from string format (e.g., "18,20" -> 18.20)
function parseAmount(amountStr) {
	return parseFloat(amountStr.replace(',', '.'))
}

// Function to parse date from DD.MM.YYYY format
function parseDate(dateStr) {
	const [day, month, year] = dateStr.split('.')
	return new Date(year, month - 1, day)
}

// Function to get human-readable business name
function getBusinessName(oppositeSideName) {
	for (const [key, value] of Object.entries(businessNameMapping)) {
		if (oppositeSideName.toUpperCase().includes(key.toUpperCase())) {
			return value
		}
	}
	return oppositeSideName // Return original if no mapping found
}

// Function to format currency
function formatCurrency(amount) {
	return `${amount.toFixed(2)} BGN`
}

// Function to get month-year key for grouping
function getMonthYear(date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

async function analyzeAccountMovements() {
	try {
		// Read and parse XML file
		const xmlFilePath = path.join(__dirname, 'data', 'data.xml')
		const xmlData = fs.readFileSync(xmlFilePath, 'utf8')

		const parser = new xml2js.Parser()
		const result = await parser.parseStringPromise(xmlData)

		const movements = result.AccountMovements.AccountMovement

		// Initialize counters and aggregators
		let totalSpent = 0
		let totalIncome = 0
		const monthlySpending = {}
		const businessSpending = {}

		console.log('=== DSK ACCOUNT MOVEMENTS ANALYSIS ===\n')

		// Process each movement
		movements.forEach((movement) => {
			const amount = parseAmount(movement.Amount[0])
			const date = parseDate(movement.ValueDate[0])
			const oppositeSideName = movement.OppositeSideName[0]
			const movementType = movement.MovementType[0]
			const businessName = getBusinessName(oppositeSideName)
			const monthYear = getMonthYear(date)

			if (movementType === 'Debit') {
				// This is spending
				totalSpent += amount

				// Add to monthly spending
				if (!monthlySpending[monthYear]) {
					monthlySpending[monthYear] = 0
				}
				monthlySpending[monthYear] += amount

				// Add to business spending
				if (!businessSpending[businessName]) {
					businessSpending[businessName] = 0
				}
				businessSpending[businessName] += amount
			} else if (movementType === 'Credit') {
				// This is income
				totalIncome += amount
			}
		})

		// Display results
		console.log('📊 SUMMARY REPORT')
		console.log('=================')
		console.log(`Total Income: ${formatCurrency(totalIncome)}`)
		console.log(`Total Spent: ${formatCurrency(totalSpent)}`)
		console.log(`Net Balance: ${formatCurrency(totalIncome - totalSpent)}`)
		console.log()

		console.log('📅 MONTHLY SPENDING')
		console.log('==================')
		const sortedMonths = Object.keys(monthlySpending).sort()
		sortedMonths.forEach((month) => {
			console.log(`${month}: ${formatCurrency(monthlySpending[month])}`)
		})
		console.log()

		console.log('🏪 SPENDING BY BUSINESS')
		console.log('======================')
		const sortedBusinesses = Object.entries(businessSpending).sort(([, a], [, b]) => b - a) // Sort by amount descending

		sortedBusinesses.forEach(([business, amount]) => {
			console.log(`${business}: ${formatCurrency(amount)}`)
		})
		console.log()

		console.log('🔄 BUSINESS NAME MAPPING')
		console.log('========================')
		console.log('The following mapping is used to convert business names to human-readable format:')
		Object.entries(businessNameMapping).forEach(([key, value]) => {
			console.log(`"${key}" → "${value}"`)
		})
		console.log()

		console.log('📋 DETAILED TRANSACTIONS')
		console.log('========================')
		movements.forEach((movement, index) => {
			const amount = parseAmount(movement.Amount[0])
			const date = movement.ValueDate[0]
			const oppositeSideName = movement.OppositeSideName[0]
			const movementType = movement.MovementType[0]
			const businessName = getBusinessName(oppositeSideName)
			const symbol = movementType === 'Debit' ? '-' : '+'

			console.log(`${index + 1}. ${date} | ${symbol}${formatCurrency(amount)} | ${businessName}`)
			if (businessName !== oppositeSideName) {
				console.log(`   Original: ${oppositeSideName}`)
			}
		})
	} catch (error) {
		console.error('Error analyzing account movements:', error)
	}
}

// Run the analysis
if (require.main === module) {
	analyzeAccountMovements()
}

module.exports = {
	analyzeAccountMovements,
	parseAmount,
	parseDate,
	getBusinessName,
	formatCurrency
}
