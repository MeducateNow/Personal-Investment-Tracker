import { useState } from 'react';
import { 
  Title, 
  Group, 
  ActionIcon, 
  Text, 
  Paper, 
  Progress, 
  Grid, 
  Button, 
  Modal, 
  TextInput, 
  NumberInput, 
  Select, 
  Box
} from '@mantine/core';
import { IconCalendar, IconChevronLeft, IconChevronRight, IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import { useFinanceStore } from '../store';
import { format, parseISO } from 'date-fns';
import { Budget } from '../types';

const BudgetPlanner = () => {
  const { 
    budgets, 
    updateBudget, 
    currentMonth,
    nextMonth,
    previousMonth
  } = useFinanceStore();

  const [modalOpened, setModalOpened] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Filter budgets for current month
  const currentBudgets = budgets.filter(b => b.period === currentMonth);

  // Calculate total budget stats
  const totalAllocated = currentBudgets.reduce((sum, b) => sum + b.allocated, 0);
  const totalSpent = currentBudgets.reduce((sum, b) => sum + b.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallProgress = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setModalOpened(true);
  };

  const handleSaveBudget = (values: Partial<Budget>) => {
    if (editingBudget) {
      const updatedBudget = {
        ...editingBudget,
        ...values,
        allocated: Number(values.allocated),
        spent: Number(values.spent),
        remaining: Number(values.allocated) - Number(values.spent),
      };
      updateBudget(updatedBudget);
    }
    setModalOpened(false);
    setEditingBudget(null);
  };

  const getProgressColor = (spent: number, allocated: number) => {
    const percentage = (spent / allocated) * 100;
    if (percentage < 70) return 'teal';
    if (percentage < 90) return 'yellow';
    return 'red';
  };

  return (
    <div>
      <Group position="apart" mb="md" mt="md" px="md">
        <Title order={2}>Budget Planner</Title>
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

      {/* Budget Summary */}
      <Grid gutter="md" p="md">
        <Grid.Col span={4}>
          <Paper p="md" radius="md" shadow="xs">
            <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
              Total Budget
            </Text>
            <Text size="xl" weight={700}>${totalAllocated.toLocaleString()}</Text>
            <Progress 
              value={overallProgress} 
              color={getProgressColor(totalSpent, totalAllocated)} 
              size="sm" 
              mt="md" 
            />
            <Group position="apart" mt="xs">
              <Text size="sm" color="dimmed">Overall Progress</Text>
              <Text size="sm" weight={500}>{overallProgress.toFixed(0)}%</Text>
            </Group>
          </Paper>
        </Grid.Col>

        <Grid.Col span={4}>
          <Paper p="md" radius="md" shadow="xs">
            <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
              Spent So Far
            </Text>
            <Text size="xl" weight={700}>${totalSpent.toLocaleString()}</Text>
            <Group position="apart" mt="md">
              <Text size="sm" color="dimmed">
                Percentage of Budget
              </Text>
              <Text 
                size="sm" 
                weight={500} 
                color={getProgressColor(totalSpent, totalAllocated)}
              >
                {totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(0) : 0}%
              </Text>
            </Group>
          </Paper>
        </Grid.Col>

        <Grid.Col span={4}>
          <Paper p="md" radius="md" shadow="xs">
            <Text size="xs" color="dimmed" transform="uppercase" weight={700}>
              Remaining
            </Text>
            <Text size="xl" weight={700}>${totalRemaining.toLocaleString()}</Text>
            <Group position="apart" mt="md">
              <Text size="sm" color="dimmed">
                Days Left in Month
              </Text>
              <Text size="sm" weight={500}>
                {new Date(
                  parseISO(`${currentMonth}-01`).getFullYear(),
                  parseISO(`${currentMonth}-01`).getMonth() + 1,
                  0
                ).getDate() - new Date().getDate()}
              </Text>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Budget Categories */}
      <Box p="md">
        <Group position="apart" mb="md">
          <Text size="lg" weight={600}>Budget Categories</Text>
          <Button 
            leftIcon={<IconPlus size={16} />} 
            size="sm"
            onClick={() => {
              setEditingBudget({
                id: '',
                category: '',
                allocated: 0,
                spent: 0,
                remaining: 0,
                period: currentMonth,
              });
              setModalOpened(true);
            }}
          >
            Add Category
          </Button>
        </Group>

        <Grid>
          {currentBudgets.map((budget) => (
            <Grid.Col key={budget.id} span={6}>
              <Paper p="md" radius="md" shadow="xs">
                <Group position="apart">
                  <Text weight={500}>{budget.category}</Text>
                  <Group spacing={8}>
                    <ActionIcon size="sm" onClick={() => handleEditBudget(budget)}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon size="sm" color="red">
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
                
                <Group position="apart" mt="xs">
                  <Text size="sm" color="dimmed">Spent</Text>
                  <Text size="sm" weight={500}>
                    ${budget.spent.toLocaleString()} of ${budget.allocated.toLocaleString()}
                  </Text>
                </Group>
                
                <Progress 
                  value={(budget.spent / budget.allocated) * 100} 
                  color={getProgressColor(budget.spent, budget.allocated)} 
                  size="md" 
                  mt="xs" 
                  mb="xs"
                />
                
                <Group position="apart">
                  <Text size="sm" color="dimmed">Remaining</Text>
                  <Text 
                    size="sm" 
                    weight={500} 
                    color={budget.remaining < 0 ? 'red' : undefined}
                  >
                    ${budget.remaining.toLocaleString()}
                  </Text>
                </Group>
              </Paper>
            </Grid.Col>
          ))}
        </Grid>
      </Box>

      {/* Edit Budget Modal */}
      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setEditingBudget(null);
        }}
        title={editingBudget?.id ? "Edit Budget Category" : "Add Budget Category"}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            const values = {
              category: formData.get('category') as string,
              allocated: Number(formData.get('allocated')),
              spent: Number(formData.get('spent')),
            };
            handleSaveBudget(values);
          }}
        >
          <TextInput
            label="Category"
            name="category"
            placeholder="e.g., Housing, Food, Transportation"
            required
            defaultValue={editingBudget?.category}
            mb="md"
          />
          
          <NumberInput
            label="Allocated Amount"
            name="allocated"
            placeholder="0.00"
            required
            precision={2}
            min={0}
            defaultValue={editingBudget?.allocated}
            mb="md"
          />
          
          <NumberInput
            label="Spent Amount"
            name="spent"
            placeholder="0.00"
            required
            precision={2}
            min={0}
            defaultValue={editingBudget?.spent}
            mb="md"
          />
          
          <Group position="right" mt="md">
            <Button 
              variant="subtle" 
              onClick={() => {
                setModalOpened(false);
                setEditingBudget(null);
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

export default BudgetPlanner;
