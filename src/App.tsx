import React from 'react';
import { MantineProvider, AppShell, Navbar, Header, Text, UnstyledButton, Group, ThemeIcon, Box } from '@mantine/core';
import { IconDashboard, IconChartPie, IconCoin, IconChartBar } from '@tabler/icons-react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import BudgetPlanner from './components/BudgetPlanner';
import Investments from './components/Investments';
import Forecasting from './components/Forecasting';

const MainLinks = () => {
  const links = [
    { icon: <IconDashboard size={16} />, color: 'blue', label: 'Dashboard', to: '/' },
    { icon: <IconChartPie size={16} />, color: 'teal', label: 'Budget Planner', to: '/budget' },
    { icon: <IconCoin size={16} />, color: 'violet', label: 'Investments', to: '/investments' },
    { icon: <IconChartBar size={16} />, color: 'grape', label: 'Forecasting', to: '/forecasting' },
  ];

  return (
    <div>
      {links.map((link) => (
        <UnstyledButton
          component={Link}
          to={link.to}
          key={link.label}
          sx={(theme) => ({
            display: 'block',
            width: '100%',
            padding: theme.spacing.xs,
            borderRadius: theme.radius.sm,
            color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
            '&:hover': {
              backgroundColor:
                theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
            },
          })}
        >
          <Group>
            <ThemeIcon color={link.color} variant="light">
              {link.icon}
            </ThemeIcon>
            <Text size="sm">{link.label}</Text>
          </Group>
        </UnstyledButton>
      ))}
    </div>
  );
};

function App() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Router>
        <AppShell
          padding="md"
          navbar={
            <Navbar width={{ base: 250 }} p="xs">
              <Navbar.Section grow mt="md">
                <MainLinks />
              </Navbar.Section>
              <Navbar.Section>
                <Box
                  sx={(theme) => ({
                    paddingTop: theme.spacing.sm,
                    borderTop: `1px solid ${
                      theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[2]
                    }`,
                  })}
                >
                  <Text size="xs" color="dimmed" mb="md" align="center">
                    Personal Finance Dashboard v1.0
                  </Text>
                </Box>
              </Navbar.Section>
            </Navbar>
          }
          header={
            <Header height={60} p="xs">
              <Group sx={{ height: '100%' }} px={20} position="apart">
                <Text size="lg" weight={700}>Personal Finance Dashboard</Text>
              </Group>
            </Header>
          }
          styles={(theme) => ({
            main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
          })}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/budget" element={<BudgetPlanner />} />
            <Route path="/investments" element={<Investments />} />
            <Route path="/forecasting" element={<Forecasting />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </Router>
    </MantineProvider>
  );
}

export default App;
