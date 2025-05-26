import React, { useState } from 'react';
import { 
  Title, 
  Group, 
  Text, 
  Paper, 
  Grid, 
  Button, 
  Modal, 
  TextInput, 
  NumberInput, 
  Select, 
  Box,
  Badge,
  Tabs,
  ActionIcon
} from '@mantine/core';
import { IconPlus, IconChartLine, IconCoin, IconBuildingBank, IconChartPie, IconEdit } from '@tabler/icons-react';
import { useFinanceStore } from '../store';
import { format, parseISO, subMonths } from 'date-fns';
import { Investment } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Investments = () => {
  const { 
    investments, 
    addInvestment, 
    updateInvestment,
    summary
  } = useFinanceStore();

  const [modalOpened, setModalOpened] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('overview');

  // Calculate investment stats
  const totalValue = investments.reduce((sum, inv) => sum + inv.value, 0);
  const totalInitial = investments.reduce((sum, inv) => sum + inv.initialInvestment, 0);
  const totalGain = totalValue - totalInitial;
  const totalReturn = totalInitial > 0 ? (totalGain / totalInitial) * 100 : 0;

  // Investment allocation data
  const allocationData = investments.map(inv => ({
    name: inv.name,
    value: inv.value,
  }));

  // Investment performance data
  const performanceData = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), 11 - i);
    const monthStr = format(date, 'MMM');
    
    // Sum up the values for each investment for this month
    const totalValue = investments.reduce((sum, inv) => {
      const historyItem = inv.history.find(h => 
        format(parseISO(h.date), 'yyyy-MM') === format(date, 'yyyy-MM')
      );
      return sum + (historyItem?.value || 0);
    }, 0);
    
    return {
      name: monthStr,
      value: totalValue,
    };
  });

  // Investment types data
  const typeData = investments.reduce((acc, inv) => {
    if (!acc[inv.type]) {
      acc[inv.type] = 0;
    }
    acc[inv.type] += inv.value;
    return acc;
  }, {} as Record<string, number>);

  const typeChartData = Object.entries(typeData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Colors for charts
  const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const handleEditInvestment = (investment: Investment) => {
    setEditingInvestment(investment);
    setModalOpened(true);
  };

  const handleSaveInvestment = (values: Partial<Investment>) => {
    if (editingInvestment) {
      const updatedInvestment = {
        ...editingInvestment,
        ...values,
        value: Number(values.value),
        initialInvestment: Number(values.initialInvestment),
        returnRate: Number(values.returnRate),
      };
      updateInvestment(updatedInvestment);
    } else if (values.name && values.type && values.value && values.initialInvestment && values.purchaseDate) {
      addInvestment({
        name: values.name,
        type: values.type as 'stock' | 'crypto' | 'etf' | 'bond' | 'real-estate',
        value: Number(values.value),
        initialInvestment: Number(values.initialInvestment),
        returnRate: Number(values.returnRate) || 0,
        purchaseDate: values.purchaseDate,
        history: [],
      });
    }
    setModalOpened(false);
    setEditingInvestment(null);
  };

  const getInvestmentTypeIcon = (type: string) => {
    switch (type) {
      case 'stock':
        return <IconChartLine size={16} />;
      case 'crypto':
        return <IconCoin size={16} />;
      case 'etf':
        return <IconChartPie size={16} />;
      case 'bond':
        return <IconBuildingBank size={16} />;
      default:
        return <IconChartLine size={16} />;
    }
  };

  const getReturnColor = (returnRate: number) => {
    if (returnRate > 0) return 'teal';
    if (returnRate === 0) return 'gray';
    return 'red';
  };

  return (
    <div>
      <Group position="apart" mb="md" mt="md" px="md">
        <Title order={2}>Investment Portfolio</Title>
        <Button 
          leftIcon={<IconPlus size={16} />} 
          onClick={() => {
            setEditingInvestment(null);
            setModalOpened(true);
          }}
        >
          Add Investment
        </Button>
      </Group>

      {/* Investment Summary */}
      <Grid gutter="md" p="md">
        <Grid.Col span={3}>
          <Paper p="md" radius="md" shadow="xs">
            <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
              Total Value
            </Text>
            <Text size="xl" weight={700}>${totalValue.toLocaleString()}</Text>
            <Group position="apart" mt="xs">
              <Text size="sm" color="dimmed">Initial Investment</Text>
              <Text size="sm" weight={500}>${totalInitial.toLocaleString()}</Text>
            </Group>
          </Paper>
        </Grid.Col>

        <Grid.Col span={3}>
          <Paper p="md" radius="md" shadow="xs">
            <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
              Total Gain/Loss
            </Text>
            <Text 
              size="xl" 
              weight={700} 
              color={totalGain >= 0 ? 'teal' : 'red'}
            >
              {totalGain >= 0 ? '+' : '-'}${Math.abs(totalGain).toLocaleString()}
            </Text>
            <Group position="apart" mt="xs">
              <Text size="sm" color="dimmed">Return</Text>
              <Text 
                size="sm" 
                weight={500} 
                color={totalGain >= 0 ? 'teal' : 'red'}
              >
                {totalGain >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
              </Text>
            </Group>
          </Paper>
        </Grid.Col>

        <Grid.Col span={3}>
          <Paper p="md" radius="md" shadow="xs">
            <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
              Number of Assets
            </Text>
            <Text size="xl" weight={700}>{investments.length}</Text>
            <Group position="apart" mt="xs">
              <Text size="sm" color="dimmed">Asset Types</Text>
              <Text size="sm" weight={500}>
                {new Set(investments.map(inv => inv.type)).size}
              </Text>
            </Group>
          </Paper>
        </Grid.Col>

        <Grid.Col span={3}>
          <Paper p="md" radius="md" shadow="xs">
            <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
              Portfolio % of Net Worth
            </Text>
            <Text size="xl" weight={700}>
              {summary.netWorth > 0 ? ((totalValue / summary.netWorth) * 100).toFixed(1) : 0}%
            </Text>
            <Group position="apart" mt="xs">
              <Text size="sm" color="dimmed">Net Worth</Text>
              <Text size="sm" weight={500}>${summary.netWorth.toLocaleString()}</Text>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Investment Tabs */}
      <Box p="md">
        <Tabs value={activeTab} onTabChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="overview" icon={<IconChartPie size={14} />}>Overview</Tabs.Tab>
            <Tabs.Tab value="performance" icon={<IconChartLine size={14} />}>Performance</Tabs.Tab>
            <Tabs.Tab value="assets" icon={<IconCoin size={14} />}>Assets</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="xs">
            <Grid mt="md">
              <Grid.Col span={6}>
                <Paper p="md" radius="md" shadow="xs">
                  <Text size="sm" weight={500} mb="md">Asset Allocation</Text>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid.Col>

              <Grid.Col span={6}>
                <Paper p="md" radius="md" shadow="xs">
                  <Text size="sm" weight={500} mb="md">Investment Types</Text>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={typeChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {typeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value}`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="performance" pt="xs">
            <Paper p="md" radius="md" shadow="xs" mt="md">
              <Text size="sm" weight={500} mb="md">Portfolio Performance (12 Months)</Text>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={performanceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Portfolio Value']} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4F46E5" 
                    activeDot={{ r: 8 }} 
                    name="Portfolio Value"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="assets" pt="xs">
            <Grid mt="md">
              {investments.map((investment) => (
                <Grid.Col key={investment.id} span={4}>
                  <Paper p="md" radius="md" shadow="xs">
                    <Group position="apart">
                      <Group>
                        {getInvestmentTypeIcon(investment.type)}
                        <Text weight={500}>{investment.name}</Text>
                      </Group>
                      <ActionIcon onClick={() => handleEditInvestment(investment)}>
                        <IconEdit size={16} />
                      </ActionIcon>
                    </Group>
                    
                    <Badge 
                      mt="xs" 
                      size="sm" 
                      variant="outline"
                      color="indigo"
                    >
                      {investment.type.toUpperCase()}
                    </Badge>
                    
                    <Text size="xl" weight={700} mt="md">
                      ${investment.value.toLocaleString()}
                    </Text>
                    
                    <Group position="apart" mt="xs">
                      <Text size="sm" color="dimmed">Initial Investment</Text>
                      <Text size="sm" weight={500}>
                        ${investment.initialInvestment.toLocaleString()}
                      </Text>
                    </Group>
                    
                    <Group position="apart" mt="xs">
                      <Text size="sm" color="dimmed">Return</Text>
                      <Text 
                        size="sm" 
                        weight={500} 
                        color={getReturnColor(investment.value - investment.initialInvestment)}
                      >
                        {investment.value >= investment.initialInvestment ? '+' : ''}
                        {((investment.value - investment.initialInvestment) / investment.initialInvestment * 100).toFixed(2)}%
                      </Text>
                    </Group>
                    
                    <Group position="apart" mt="xs">
                      <Text size="sm" color="dimmed">Purchase Date</Text>
                      <Text size="sm" weight={500}>
                        {format(parseISO(investment.purchaseDate), 'MMM dd, yyyy')}
                      </Text>
                    </Group>
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>
          </Tabs.Panel>
        </Tabs>
      </Box>

      {/* Add/Edit Investment Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setEditingInvestment(null);
        }}
        title={editingInvestment ? "Edit Investment" : "Add Investment"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            const values = {
              name: formData.get('name') as string,
              type: formData.get('type') as 'stock' | 'crypto' | 'etf' | 'bond' | 'real-estate',
              value: Number(formData.get('value')),
              initialInvestment: Number(formData.get('initialInvestment')),
              returnRate: Number(formData.get('returnRate')),
              purchaseDate: formData.get('purchaseDate') as string,
            };
            handleSaveInvestment(values);
          }}
        >
          <TextInput
            label="Investment Name"
            name="name"
            placeholder="e.g., S&P 500 ETF, Apple Stock"
            required
            defaultValue={editingInvestment?.name}
            mb="md"
          />
          
          <Select
            label="Investment Type"
            name="type"
            placeholder="Select type"
            required
            data={[
              { value: 'stock', label: 'Stock' },
              { value: 'etf', label: 'ETF' },
              { value: 'crypto', label: 'Cryptocurrency' },
              { value: 'bond', label: 'Bond' },
              { value: 'real-estate', label: 'Real Estate' },
            ]}
            defaultValue={editingInvestment?.type}
            mb="md"
          />
          
          <NumberInput
            label="Current Value"
            name="value"
            placeholder="0.00"
            required
            precision={2}
            min={0}
            defaultValue={editingInvestment?.value}
            mb="md"
          />
          
          <NumberInput
            label="Initial Investment"
            name="initialInvestment"
            placeholder="0.00"
            required
            precision={2}
            min={0}
            defaultValue={editingInvestment?.initialInvestment}
            mb="md"
          />
          
          <NumberInput
            label="Expected Annual Return Rate (%)"
            name="returnRate"
            placeholder="0.00"
            precision={2}
            defaultValue={editingInvestment?.returnRate}
            mb="md"
          />
          
          <TextInput
            label="Purchase Date"
            name="purchaseDate"
            type="date"
            required
            defaultValue={editingInvestment?.purchaseDate || format(new Date(), 'yyyy-MM-dd')}
            mb="md"
          />
          
          <Group position="right" mt="md">
            <Button 
              variant="subtle" 
              onClick={() => {
                setModalOpened(false);
                setEditingInvestment(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </Group>
        </form>
      </Modal>
    </div>
  );
};

export default Investments;
