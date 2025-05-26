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
  Box,
  Tabs,
  ActionIcon,
  Select,
  Slider,
  RangeSlider
} from '@mantine/core';
import { IconPlus, IconChartLine, IconTrash, IconEdit, IconChartBar, IconSettings } from '@tabler/icons-react';
import { useFinanceStore } from '../store';
import { ForecastScenario } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';

const Forecasting = () => {
  const { 
    forecastScenarios, 
    addForecastScenario, 
    updateForecastScenario,
    deleteForecastScenario,
    calculateForecast
  } = useFinanceStore();

  const [modalOpened, setModalOpened] = useState(false);
  const [editingScenario, setEditingScenario] = useState<ForecastScenario | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>('scenarios');
  const [selectedScenario, setSelectedScenario] = useState<string | null>(
    forecastScenarios.length > 0 ? forecastScenarios[0].id : null
  );

  const handleEditScenario = (scenario: ForecastScenario) => {
    setEditingScenario(scenario);
    setModalOpened(true);
  };

  const handleSaveScenario = (values: Partial<ForecastScenario>) => {
    if (editingScenario) {
      const updatedScenario = {
        ...editingScenario,
        ...values,
        monthlyIncome: Number(values.monthlyIncome),
        monthlyExpenses: Number(values.monthlyExpenses),
        savingsRate: Number(values.savingsRate) / 100,
        investmentReturnRate: Number(values.investmentReturnRate) / 100,
        inflationRate: Number(values.inflationRate) / 100,
        years: Number(values.years),
      };
      updateForecastScenario(updatedScenario);
    } else if (values.name) {
      addForecastScenario({
        name: values.name,
        description: values.description || '',
        monthlyIncome: Number(values.monthlyIncome),
        monthlyExpenses: Number(values.monthlyExpenses),
        savingsRate: Number(values.savingsRate) / 100,
        investmentReturnRate: Number(values.investmentReturnRate) / 100,
        inflationRate: Number(values.inflationRate) / 100,
        years: Number(values.years),
      });
    }
    setModalOpened(false);
    setEditingScenario(null);
  };

  const handleDeleteScenario = (id: string) => {
    deleteForecastScenario(id);
    if (selectedScenario === id) {
      setSelectedScenario(forecastScenarios.length > 1 ? 
        forecastScenarios.find(s => s.id !== id)?.id || null : null);
    }
  };

  // Get the selected scenario
  const currentScenario = forecastScenarios.find(s => s.id === selectedScenario);
  
  // Calculate forecast data
  const forecastData = currentScenario ? 
    calculateForecast(currentScenario) : [];
  
  // Calculate comparison data for all scenarios
  const comparisonData = Array.from({ length: 10 }, (_, i) => {
    const year = i + 1;
    const dataPoint: Record<string, any> = { year };
    
    forecastScenarios.forEach(scenario => {
      const forecast = calculateForecast(scenario);
      const yearData = forecast[year * 12 - 1]; // Get data for the last month of each year
      if (yearData) {
        dataPoint[scenario.name] = yearData.investments;
      }
    });
    
    return dataPoint;
  });

  return (
    <div>
      <Group position="apart" mb="md" mt="md" px="md">
        <Title order={2}>Financial Forecasting</Title>
        <Button 
          leftIcon={<IconPlus size={16} />} 
          onClick={() => {
            setEditingScenario(null);
            setModalOpened(true);
          }}
        >
          New Scenario
        </Button>
      </Group>

      <Box p="md">
        <Tabs value={activeTab} onTabChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="scenarios" icon={<IconSettings size={14} />}>Scenarios</Tabs.Tab>
            <Tabs.Tab value="forecast" icon={<IconChartLine size={14} />}>Forecast</Tabs.Tab>
            <Tabs.Tab value="comparison" icon={<IconChartBar size={14} />}>Comparison</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="scenarios" pt="xs">
            <Grid mt="md">
              {forecastScenarios.map((scenario) => (
                <Grid.Col key={scenario.id} span={4}>
                  <Paper 
                    p="md" 
                    radius="md" 
                    shadow="xs"
                    sx={(theme) => ({
                      borderLeft: selectedScenario === scenario.id ? 
                        `4px solid ${theme.colors.indigo[6]}` : undefined,
                      cursor: 'pointer',
                    })}
                    onClick={() => setSelectedScenario(scenario.id)}
                  >
                    <Group position="apart">
                      <Text weight={600}>{scenario.name}</Text>
                      <Group spacing={8}>
                        <ActionIcon size="sm" onClick={(e) => {
                          e.stopPropagation();
                          handleEditScenario(scenario);
                        }}>
                          <IconEdit size={16} />
                        </ActionIcon>
                        <ActionIcon 
                          size="sm" 
                          color="red" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteScenario(scenario.id);
                          }}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Group>
                    
                    <Text size="sm" color="dimmed" mb="md">
                      {scenario.description}
                    </Text>
                    
                    <Grid>
                      <Grid.Col span={6}>
                        <Text size="xs" color="dimmed">Monthly Income</Text>
                        <Text size="sm" weight={500}>${scenario.monthlyIncome}</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="xs" color="dimmed">Monthly Expenses</Text>
                        <Text size="sm" weight={500}>${scenario.monthlyExpenses}</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="xs" color="dimmed">Savings Rate</Text>
                        <Text size="sm" weight={500}>{(scenario.savingsRate * 100).toFixed(1)}%</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="xs" color="dimmed">Investment Return</Text>
                        <Text size="sm" weight={500}>{(scenario.investmentReturnRate * 100).toFixed(1)}%</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="xs" color="dimmed">Inflation Rate</Text>
                        <Text size="sm" weight={500}>{(scenario.inflationRate * 100).toFixed(1)}%</Text>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <Text size="xs" color="dimmed">Forecast Years</Text>
                        <Text size="sm" weight={500}>{scenario.years} years</Text>
                      </Grid.Col>
                    </Grid>
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>
          </Tabs.Panel>

          <Tabs.Panel value="forecast" pt="xs">
            {currentScenario ? (
              <>
                <Paper p="md" radius="md" shadow="xs" mt="md">
                  <Group position="apart" mb="md">
                    <Text size="lg" weight={600}>{currentScenario.name} Forecast</Text>
                    <Text size="sm" color="dimmed">{currentScenario.years} Year Projection</Text>
                  </Group>
                  
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart
                      data={forecastData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        tickFormatter={(value, index) => index % 12 === 0 ? value : ''}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="balance" 
                        stackId="1"
                        stroke="#4F46E5" 
                        fill="#EEF2FF" 
                        name="Monthly Balance"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="savings" 
                        stackId="2"
                        stroke="#F59E0B" 
                        fill="#FEF3C7" 
                        name="Cumulative Savings"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="investments" 
                        stackId="3"
                        stroke="#10B981" 
                        fill="#D1FAE5" 
                        name="Investment Growth"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
                
                <Grid mt="md">
                  <Grid.Col span={4}>
                    <Paper p="md" radius="md" shadow="xs">
                      <Text size="sm" weight={600} mb="xs">Final Investment Value</Text>
                      <Text size="xl" weight={700} color="teal">
                        ${forecastData[forecastData.length - 1]?.investments.toLocaleString()}
                      </Text>
                      <Text size="xs" color="dimmed">
                        After {currentScenario.years} years
                      </Text>
                    </Paper>
                  </Grid.Col>
                  
                  <Grid.Col span={4}>
                    <Paper p="md" radius="md" shadow="xs">
                      <Text size="sm" weight={600} mb="xs">Total Contributions</Text>
                      <Text size="xl" weight={700}>
                        ${(currentScenario.monthlyIncome * currentScenario.savingsRate * 12 * currentScenario.years).toLocaleString()}
                      </Text>
                      <Text size="xs" color="dimmed">
                        Monthly: ${(currentScenario.monthlyIncome * currentScenario.savingsRate).toFixed(0)}
                      </Text>
                    </Paper>
                  </Grid.Col>
                  
                  <Grid.Col span={4}>
                    <Paper p="md" radius="md" shadow="xs">
                      <Text size="sm" weight={600} mb="xs">Investment Growth</Text>
                      <Text size="xl" weight={700} color="indigo">
                        ${(forecastData[forecastData.length - 1]?.investments - (currentScenario.monthlyIncome * currentScenario.savingsRate * 12 * currentScenario.years)).toLocaleString()}
                      </Text>
                      <Text size="xs" color="dimmed">
                        From investment returns
                      </Text>
                    </Paper>
                  </Grid.Col>
                </Grid>
              </>
            ) : (
              <Paper p="md" radius="md" shadow="xs" mt="md">
                <Text align="center" my="xl" color="dimmed">
                  Select a scenario to view forecast
                </Text>
              </Paper>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="comparison" pt="xs">
            <Paper p="md" radius="md" shadow="xs" mt="md">
              <Text size="lg" weight={600} mb="md">Scenario Comparison</Text>
              
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={comparisonData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="year" 
                    label={{ value: 'Years', position: 'insideBottomRight', offset: -10 }}
                  />
                  <YAxis 
                    label={{ value: 'Investment Value ($)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                  <Legend />
                  {forecastScenarios.map((scenario, index) => (
                    <Line
                      key={scenario.id}
                      type="monotone"
                      dataKey={scenario.name}
                      stroke={COLORS[index % COLORS.length]}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </Paper>
            
            <Grid mt="md">
              {forecastScenarios.map((scenario, index) => {
                const finalYear = comparisonData[comparisonData.length - 1];
                const finalValue = finalYear ? finalYear[scenario.name] : 0;
                
                return (
                  <Grid.Col key={scenario.id} span={3}>
                    <Paper p="md" radius="md" shadow="xs">
                      <Text size="sm" weight={600}>{scenario.name}</Text>
                      <Text size="lg" weight={700} color={COLORS[index % COLORS.length]}>
                        ${finalValue ? finalValue.toLocaleString() : 0}
                      </Text>
                      <Text size="xs" color="dimmed">
                        After 10 years
                      </Text>
                    </Paper>
                  </Grid.Col>
                );
              })}
            </Grid>
          </Tabs.Panel>
        </Tabs>
      </Box>

      {/* Add/Edit Scenario Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setEditingScenario(null);
        }}
        title={editingScenario ? "Edit Scenario" : "New Forecast Scenario"}
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            const values = {
              name: formData.get('name') as string,
              description: formData.get('description') as string,
              monthlyIncome: Number(formData.get('monthlyIncome')),
              monthlyExpenses: Number(formData.get('monthlyExpenses')),
              savingsRate: Number(formData.get('savingsRate')),
              investmentReturnRate: Number(formData.get('investmentReturnRate')),
              inflationRate: Number(formData.get('inflationRate')),
              years: Number(formData.get('years')),
            };
            handleSaveScenario(values);
          }}
        >
          <TextInput
            label="Scenario Name"
            name="name"
            placeholder="e.g., Conservative Growth, Early Retirement"
            required
            defaultValue={editingScenario?.name}
            mb="md"
          />
          
          <TextInput
            label="Description"
            name="description"
            placeholder="Brief description of this scenario"
            defaultValue={editingScenario?.description}
            mb="md"
          />
          
          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="Monthly Income ($)"
                name="monthlyIncome"
                placeholder="0"
                required
                min={0}
                defaultValue={editingScenario?.monthlyIncome}
                mb="md"
              />
            </Grid.Col>
            
            <Grid.Col span={6}>
              <NumberInput
                label="Monthly Expenses ($)"
                name="monthlyExpenses"
                placeholder="0"
                required
                min={0}
                defaultValue={editingScenario?.monthlyExpenses}
                mb="md"
              />
            </Grid.Col>
          </Grid>
          
          <Text size="sm" weight={500} mb="xs">Savings Rate (%)</Text>
          <Slider
            name="savingsRate"
            min={0}
            max={100}
            step={1}
            label={(value) => `${value}%`}
            defaultValue={editingScenario ? editingScenario.savingsRate * 100 : 20}
            mb="md"
          />
          
          <Text size="sm" weight={500} mb="xs">Investment Return Rate (%)</Text>
          <Slider
            name="investmentReturnRate"
            min={0}
            max={20}
            step={0.5}
            label={(value) => `${value}%`}
            defaultValue={editingScenario ? editingScenario.investmentReturnRate * 100 : 7}
            mb="md"
          />
          
          <Text size="sm" weight={500} mb="xs">Inflation Rate (%)</Text>
          <Slider
            name="inflationRate"
            min={0}
            max={10}
            step={0.1}
            label={(value) => `${value}%`}
            defaultValue={editingScenario ? editingScenario.inflationRate * 100 : 3}
            mb="md"
          />
          
          <Text size="sm" weight={500} mb="xs">Forecast Years</Text>
          <Slider
            name="years"
            min={1}
            max={40}
            step={1}
            label={(value) => `${value} years`}
            defaultValue={editingScenario?.years || 10}
            mb="md"
          />
          
          <Group position="right" mt="md">
            <Button 
              variant="subtle" 
              onClick={() => {
                setModalOpened(false);
                setEditingScenario(null);
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Save Scenario</Button>
          </Group>
        </form>
      </Modal>
    </div>
  );
};

// Colors for charts
const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default Forecasting;
