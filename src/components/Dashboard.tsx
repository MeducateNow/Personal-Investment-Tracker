import React from 'react';
import { Grid, Paper, Text, Group, Badge, Title, Button, ActionIcon } from '@mantine/core';
import { IconArrowUpRight, IconArrowDownRight, IconCalendar, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { useFinanceStore } from '../store';
import { format, parseISO } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

const Dashboard = () => {
  const { 
    transactions, 
    budgets, 
    investments, 
    summary, 
    currentMonth,
    nextMonth,
    previousMonth
  } = useFinanceStore();

  // Filter transactions for current month
  const currentMonthTransactions = transactions.filter(t => 
    t.date.startsWith(currentMonth)
  );

  // Calculate spending by category
  const spendingByCategory = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, transaction) => {
      const { category, amount } = transaction;
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += amount;
      return acc;
    }, {} as Record<string, number>);

  const spendingData = Object.entries(spendingByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  // Budget progress data
  const budgetData = budgets
    .filter(b => b.period === currentMonth)
    .map(budget => ({
      name: budget.category,
      allocated: budget.allocated,
      spent: budget.spent,
      remaining: budget.remaining,
    }));

  // Investment performance data
  const investmentData = investments.map(inv => ({
    name: inv.name,
    value: inv.value,
    return: ((inv.value - inv.initialInvestment) / inv.initialInvestment) * 100,
  }));

  // Cash flow data for area chart
  const cashFlowData = Array.from({ length: 6 }, (_, i) => {
    const monthDate = parseISO(`${currentMonth}-01`);
    const monthIndex = monthDate.getMonth() - 5 + i;
    const year = monthDate.getFullYear() + Math.floor(monthIndex / 12);
    const month = (monthIndex % 12 + 12) % 12; // Ensure positive month index
    const date = new Date(year, month, 1);
    const monthStr = format(date, 'yyyy-MM');
    
    const monthTransactions = transactions.filter(t => t.date.startsWith(monthStr));
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: format(date, 'MMM'),
      income,
      expenses,
      savings: income - expenses,
    };
  });

  // Colors for charts
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div>
      <Group position="apart" mb="md" mt="md" px="md">
        <Title order={2}>Financial Dashboard</Title>
        <Group>
          <ActionIcon onClick={previousMonth}>
            <IconChevronLeft size={16} />
          </ActionIcon>
          <Group spacing="xs">
            <IconCalendar size={16} />
            <Text>{format(parseISO(`${currentMonth}-01`), 'MMMM yyyy')}</Text>
          </Group>
          <ActionIcon onClick={nextMonth}>
            <IconChevronRight size={16} />
          </ActionIcon>
        </Group>
      </Group>

      <div className="dashboard-grid">
        {/* Summary Stats */}
        <Paper p="md" radius="md" shadow="xs" sx={{ gridColumn: 'span 3' }}>
          <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
            Net Worth
          </Text>
          <Text size="xl" weight={700}>${summary.netWorth.toLocaleString()}</Text>
          <Group position="apart" mt="xs">
            <Text size="sm" color="dimmed">
              Total Assets
            </Text>
            <Text size="sm" weight={500}>
              ${(summary.investmentValue + summary.totalIncome).toLocaleString()}
            </Text>
          </Group>
        </Paper>

        <Paper p="md" radius="md" shadow="xs" sx={{ gridColumn: 'span 3' }}>
          <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
            Monthly Income
          </Text>
          <Text size="xl" weight={700}>${summary.totalIncome.toLocaleString()}</Text>
          <Group position="apart" mt="xs">
            <Text size="sm" color="dimmed">
              vs Last Month
            </Text>
            <Group spacing="xs">
              <IconArrowUpRight size={16} color="teal" />
              <Text size="sm" color="teal" weight={500}>
                +2.1%
              </Text>
            </Group>
          </Group>
        </Paper>

        <Paper p="md" radius="md" shadow="xs" sx={{ gridColumn: 'span 3' }}>
          <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
            Monthly Expenses
          </Text>
          <Text size="xl" weight={700}>${summary.totalExpenses.toLocaleString()}</Text>
          <Group position="apart" mt="xs">
            <Text size="sm" color="dimmed">
              vs Last Month
            </Text>
            <Group spacing="xs">
              <IconArrowDownRight size={16} color={summary.monthlyChange > 0 ? "red" : "teal"} />
              <Text 
                size="sm" 
                color={summary.monthlyChange > 0 ? "red" : "teal"} 
                weight={500}
              >
                {summary.monthlyChange > 0 ? '+' : ''}{summary.monthlyChange.toFixed(1)}%
              </Text>
            </Group>
          </Group>
        </Paper>

        <Paper p="md" radius="md" shadow="xs" sx={{ gridColumn: 'span 3' }}>
          <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
            Savings Rate
          </Text>
          <Text size="xl" weight={700}>{summary.savingsRate.toFixed(1)}%</Text>
          <Group position="apart" mt="xs">
            <Text size="sm" color="dimmed">
              Monthly Savings
            </Text>
            <Text size="sm" weight={500}>
              ${(summary.totalIncome - summary.totalExpenses).toLocaleString()}
            </Text>
          </Group>
        </Paper>

        {/* Cash Flow Chart */}
        <Paper p="md" radius="md" shadow="xs" sx={{ gridColumn: 'span 8' }}>
          <Text size="sm" weight={500} mb="md">Cash Flow</Text>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart
              data={cashFlowData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, '']} />
              <Area type="monotone" dataKey="income" stackId="1" stroke="#4F46E5" fill="#EEF2FF" />
              <Area type="monotone" dataKey="expenses" stackId="2" stroke="#EF4444" fill="#FEE2E2" />
              <Area type="monotone" dataKey="savings" stackId="3" stroke="#10B981" fill="#D1FAE5" />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>

        {/* Spending by Category */}
        <Paper p="md" radius="md" shadow="xs" sx={{ gridColumn: 'span 4' }}>
          <Text size="sm" weight={500} mb="md">Spending by Category</Text>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={spendingData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {spendingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`$${value}`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Budget Progress */}
        <Paper p="md" radius="md" shadow="xs" sx={{ gridColumn: 'span 6' }}>
          <Text size="sm" weight={500} mb="md">Budget Progress</Text>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={budgetData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value}`, '']} />
              <Legend />
              <Bar dataKey="allocated" fill="#4F46E5" name="Allocated" />
              <Bar dataKey="spent" fill="#EF4444" name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Investment Performance */}
        <Paper p="md" radius="md" shadow="xs" sx={{ gridColumn: 'span 6' }}>
          <Text size="sm" weight={500} mb="md">Investment Performance</Text>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={investmentData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 'dataMax']} />
              <YAxis type="category" dataKey="name" />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'value') {
                    return [`$${value}`, 'Current Value'];
                  } else {
                    // Fix: Handle the value more explicitly to avoid type errors
                    // Convert to number and then format
                    let numericValue: number;
                    if (typeof value === 'number') {
                      numericValue = value;
                    } else if (typeof value === 'string') {
                      numericValue = parseFloat(value);
                    } else {
                      // If it's an array or other type, use a default value
                      numericValue = 0;
                    }
                    
                    return [`${numericValue.toFixed(2)}%`, 'Return'];
                  }
                }} 
              />
              <Legend />
              <Bar dataKey="value" fill="#4F46E5" name="Current Value" />
              <Bar dataKey="return" fill="#10B981" name="Return %" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Recent Transactions */}
        <Paper p="md" radius="md" shadow="xs" sx={{ gridColumn: 'span 12' }}>
          <Group position="apart" mb="md">
            <Text size="sm" weight={500}>Recent Transactions</Text>
            <Button variant="subtle" compact>View All</Button>
          </Group>
          
          {currentMonthTransactions.slice(0, 5).map((transaction) => (
            <Group key={transaction.id} position="apart" mb="xs" p="xs" sx={{ borderBottom: '1px solid #eee' }}>
              <div>
                <Text size="sm">{transaction.description}</Text>
                <Text size="xs" color="dimmed">{format(parseISO(transaction.date), 'MMM dd, yyyy')}</Text>
              </div>
              <Group>
                <Badge 
                  color={transaction.type === 'income' ? 'teal' : 'red'}
                  variant="light"
                >
                  {transaction.category}
                </Badge>
                <Text 
                  weight={500} 
                  color={transaction.type === 'income' ? 'teal' : 'red'}
                >
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                </Text>
              </Group>
            </Group>
          ))}
        </Paper>
      </div>
    </div>
  );
};

export default Dashboard;
