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
    color: '#22c55e' // Green
  },
  expenses: {
    label: 'Разходи',
    color: '#ef4444' // Red
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
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Финансов преглед</CardTitle>
        <CardDescription>{getDateRange()}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
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
                r: 4
              }}
              activeDot={{
                r: 6
              }}
            />
            <Line
              dataKey="expenses"
              type="monotone"
              stroke="var(--color-expenses)"
              strokeWidth={2}
              dot={{
                fill: 'var(--color-expenses)',
                r: 4
              }}
              activeDot={{
                r: 6
              }}
            />
          </LineChart>
        </ChartContainer>
        <div className="mt-4 flex items-center justify-between text-sm">
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#22c55e]" />
              <span className="text-muted-foreground">
                Общо приходи:{' '}
                <span className="font-medium text-foreground">{totals.income.toFixed(2)} лв</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#ef4444]" />
              <span className="text-muted-foreground">
                Общо разходи:{' '}
                <span className="font-medium text-foreground">{totals.expenses.toFixed(2)} лв</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Нетен баланс:</span>
            <span
              className={`font-semibold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}
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
