/**
 * Monthly Income and Expenses Chart
 * Displays a line chart showing income (green) and expenses (red) over time
 */

import { Line, LineChart, CartesianGrid, XAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'

interface MonthlyChartData {
  month: string
  income: number
  expenses: number
  dateObj: Date
}

interface MonthlyChartProps {
  data: MonthlyChartData[]
}

const chartConfig = {
  income: {
    label: 'Приходи',
    color: '#22c55e'
  },
  expenses: {
    label: 'Разходи',
    color: '#ef4444'
  }
} satisfies ChartConfig

export function MonthlyChart({ data }: MonthlyChartProps) {
  // Format the data for the chart
  const chartData = data.map((item) => ({
    month: item.month,
    income: Number(item.income.toFixed(2)),
    expenses: Number(item.expenses.toFixed(2))
  }))

  // Calculate date range for description
  const getDateRange = () => {
    if (chartData.length === 0) return ''
    if (chartData.length === 1) return chartData[0].month
    return `${chartData[0].month} - ${chartData[chartData.length - 1].month}`
  }

  // Calculate total income and expenses
  const totals = chartData.reduce(
    (acc, item) => ({
      income: acc.income + item.income,
      expenses: acc.expenses + item.expenses
    }),
    { income: 0, expenses: 0 }
  )

  const netBalance = totals.income - totals.expenses
  const netBalancePercentage =
    totals.income > 0 ? ((netBalance / totals.income) * 100).toFixed(1) : '0'

  return (
    <Card className="mb-3 overflow-hidden">
      <CardHeader className="pb-4 px-4 sm:px-6">
        <CardTitle className="text-xl">Финансов преглед</CardTitle>
        <CardDescription className="text-sm">{getDateRange()}</CardDescription>
      </CardHeader>
      <CardContent className="px-0 sm:px-4 pb-4 sm:pb-6">
        <div className="w-full overflow-hidden">
          <ChartContainer
            config={chartConfig}
            className="h-[200px] sm:h-[250px] md:h-[300px] w-full aspect-auto"
          >
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 5,
                right: 5,
                top: 5,
                bottom: 5
              }}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 10 }}
                interval="preserveStartEnd"
                tickFormatter={(value) => {
                  // Show only month name if there are many data points
                  const parts = value.split(' ')
                  return parts[0].slice(0, 3) // First 3 letters of month
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <>
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[--color-bg]"
                          style={
                            {
                              '--color-bg': `var(--color-${name})`
                            } as React.CSSProperties
                          }
                        />
                        {chartConfig[name as keyof typeof chartConfig]?.label || name}
                        <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                          {Number(value).toFixed(2)}
                          <span className="font-normal text-muted-foreground">лв</span>
                        </div>
                      </>
                    )}
                  />
                }
              />
              <Line
                dataKey="income"
                type="monotone"
                stroke="var(--color-income)"
                strokeWidth={2}
                dot={{
                  fill: 'var(--color-income)',
                  r: 3
                }}
                activeDot={{
                  r: 5
                }}
              />
              <Line
                dataKey="expenses"
                type="monotone"
                stroke="var(--color-expenses)"
                strokeWidth={2}
                dot={{
                  fill: 'var(--color-expenses)',
                  r: 3
                }}
                activeDot={{
                  r: 5
                }}
              />
            </LineChart>
          </ChartContainer>
        </div>
        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 text-sm px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#22c55e] flex-shrink-0" />
              <span className="text-muted-foreground text-sm">
                Общо приходи:{' '}
                <span className="font-medium text-foreground">{totals.income.toFixed(2)} лв</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#ef4444] flex-shrink-0" />
              <span className="text-muted-foreground text-sm">
                Общо разходи:{' '}
                <span className="font-medium text-foreground">{totals.expenses.toFixed(2)} лв</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-end">
            <div className="h-3 w-3 rounded-full bg-blue-500 flex-shrink-0" />
            <span className="text-muted-foreground text-sm whitespace-nowrap">Нетен баланс:</span>
            <span
              className={`font-semibold text-sm ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              {netBalance >= 0 ? '+' : ''}
              {netBalance.toFixed(2)} лв ({netBalance >= 0 ? '+' : ''}
              {netBalancePercentage}%)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
