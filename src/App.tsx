import React, { useState } from 'react';
import { AppShell, Navbar, Header, Text, MediaQuery, Burger, useMantineTheme, Group, Avatar, UnstyledButton, Box } from '@mantine/core';
import { IconDashboard, IconCoin, IconChartPie, IconReportMoney, IconSettings, IconLogout } from '@tabler/icons-react';
import Dashboard from './components/Dashboard';
import BudgetPlanner from './components/BudgetPlanner';
import Investments from './components/Investments';
import Forecasting from './components/Forecasting';

function App() {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [active, setActive] = useState('dashboard');

  const NavbarLink = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => {
    return (
      <UnstyledButton
        onClick={onClick}
        sx={(theme) => ({
          display: 'block',
          width: '100%',
          padding: theme.spacing.xs,
          borderRadius: theme.radius.sm,
          color: active ? theme.colors.indigo[7] : theme.colors.gray[7],
          backgroundColor: active ? theme.colors.indigo[0] : 'transparent',
          '&:hover': {
            backgroundColor: theme.colors.gray[0],
          },
        })}
      >
        <Group>
          {icon}
          <Text size="sm" weight={500}>{label}</Text>
        </Group>
      </UnstyledButton>
    );
  };

  const renderContent = () => {
    switch (active) {
      case 'dashboard':
        return <Dashboard />;
      case 'budget':
        return <BudgetPlanner />;
      case 'investments':
        return <Investments />;
      case 'forecasting':
        return <Forecasting />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppShell
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={
        <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 200, lg: 250 }}>
          <Navbar.Section mt="xs">
            <Box
              sx={{
                paddingBottom: theme.spacing.sm,
                borderBottom: `1px solid ${theme.colors.gray[2]}`,
                marginBottom: theme.spacing.sm,
              }}
            >
              <Group>
                <Avatar src={null} color="indigo" radius="xl">JD</Avatar>
                <Box sx={{ flex: 1 }}>
                  <Text size="sm" weight={500}>John Doe</Text>
                  <Text color="dimmed" size="xs">john.doe@example.com</Text>
                </Box>
              </Group>
            </Box>
          </Navbar.Section>

          <Navbar.Section grow>
            <NavbarLink
              icon={<IconDashboard size={16} />}
              label="Dashboard"
              active={active === 'dashboard'}
              onClick={() => setActive('dashboard')}
            />
            <NavbarLink
              icon={<IconCoin size={16} />}
              label="Budget Planner"
              active={active === 'budget'}
              onClick={() => setActive('budget')}
            />
            <NavbarLink
              icon={<IconChartPie size={16} />}
              label="Investments"
              active={active === 'investments'}
              onClick={() => setActive('investments')}
            />
            <NavbarLink
              icon={<IconReportMoney size={16} />}
              label="Forecasting"
              active={active === 'forecasting'}
              onClick={() => setActive('forecasting')}
            />
          </Navbar.Section>

          <Navbar.Section>
            <NavbarLink
              icon={<IconSettings size={16} />}
              label="Settings"
              active={active === 'settings'}
              onClick={() => {}}
            />
            <NavbarLink
              icon={<IconLogout size={16} />}
              label="Logout"
              active={false}
              onClick={() => {}}
            />
          </Navbar.Section>
        </Navbar>
      }
      header={
        <Header height={60} p="md">
          <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                mr="xl"
              />
            </MediaQuery>

            <Group>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="#4F46E5"/>
                <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24C20.4183 24 24 20.4183 24 16C24 11.5817 20.4183 8 16 8ZM16 10C19.3137 10 22 12.6863 22 16C22 19.3137 19.3137 22 16 22C12.6863 22 10 19.3137 10 16C10 12.6863 12.6863 10 16 10ZM16 12C14.8954 12 14 12.8954 14 14V18C14 19.1046 14.8954 20 16 20C17.1046 20 18 19.1046 18 18V14C18 12.8954 17.1046 12 16 12Z" fill="white"/>
              </svg>
              <Text weight={700} size="lg">FinTrack</Text>
            </Group>
          </div>
        </Header>
      }
      styles={(theme) => ({
        main: { backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0] },
      })}
    >
      {renderContent()}
    </AppShell>
  );
}

export default App;
