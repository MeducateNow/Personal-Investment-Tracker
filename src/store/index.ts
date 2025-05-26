import { create } from 'zustand';
import { Transaction, Budget, Investment, ForecastScenario, FinancialSummary } from '../types';
import { addMonths, format, subMonths, parseISO, differenceInMonths } from 'date-fns';

interface FinanceState {
  transactions: Transaction[];
  budgets: Budget[];
  investments: Investment[];
  forecastScenarios: ForecastScenario[];
  summary: FinancialSummary;
  currentMonth: string;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateBudget: (budget: Budget) => void;
  addInvestment: (investment: Omit<Investment, 'id'>) => void;
  updateInvestment: (investment: Investment) => void;
  addForecastScenario: (scenario: Omit<ForecastScenario, 'id'>) => void;
  updateForecastScenario: (scenario: ForecastScenario) => void;
  deleteForecastScenario: (id: string) => void;
  setCurrentMonth: (month: string) => void;
  nextMonth: () => void;
  previousMonth: () => void;
  calculateForecast: (scenario: ForecastScenario) => { month: string; balance: number; savings: number; investments: number }[];
}

// Helper to generate unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

// Sample data
const today = new Date();
const currentMonth = format(today, 'yyyy-MM');
const lastMonth = format(subMonths(today, 1), 'yyyy-MM');

const initialTransactions: Transaction[] = [
  {
    id: generateId(),
    date: `${currentMonth}-05`,
    amount: 3500,
    category: 'Salary',
    description: 'Monthly salary',
    type: 'income',
  },
  {
    id: generateId(),
    date: `${currentMonth}-10`,
    amount: 1200,
    category: 'Rent',
    description: 'Monthly rent',
    type: 'expense',
  },
  {
    id: generateId(),
    date: `${currentMonth}-15`,
    amount: 200,
    category: 'Groceries',
    description: 'Weekly groceries',
    type: 'expense',
  },
  {
    id: generateId(),
    date: `${currentMonth}-20`,
    amount: 100,
    category: 'Utilities',
    description: 'Electricity bill',
    type: 'expense',
  },
  {
    id: generateId(),
    date: `${currentMonth}-25`,
    amount: 50,
    category: 'Subscriptions',
    description: 'Netflix',
    type: 'expense',
  },
  {
    id: generateId(),
    date: `${lastMonth}-05`,
    amount: 3500,
    category: 'Salary',
    description: 'Monthly salary',
    type: 'income',
  },
  {
    id: generateId(),
    date: `${lastMonth}-10`,
    amount: 1200,
    category: 'Rent',
    description: 'Monthly rent',
    type: 'expense',
  },
];

const initialBudgets: Budget[] = [
  {
    id: generateId(),
    category: 'Housing',
    allocated: 1500,
    spent: 1200,
    remaining: 300,
    period: currentMonth,
  },
  {
    id: generateId(),
    category: 'Food',
    allocated: 500,
    spent: 350,
    remaining: 150,
    period: currentMonth,
  },
  {
    id: generateId(),
    category: 'Transportation',
    allocated: 300,
    spent: 250,
    remaining: 50,
    period: currentMonth,
  },
  {
    id: generateId(),
    category: 'Entertainment',
    allocated: 200,
    spent: 180,
    remaining: 20,
    period: currentMonth,
  },
  {
    id: generateId(),
    category: 'Utilities',
    allocated: 250,
    spent: 220,
    remaining: 30,
    period: currentMonth,
  },
];

const generateInvestmentHistory = (months: number, initialValue: number, growthRate: number) => {
  const history = [];
  let currentValue = initialValue;
  
  for (let i = 0; i < months; i++) {
    const date = format(subMonths(new Date(), months - i - 1), 'yyyy-MM-dd');
    currentValue = currentValue * (1 + (growthRate + (Math.random() * 0.02 - 0.01)) / 12);
    history.push({
      date,
      value: Math.round(currentValue * 100) / 100,
    });
  }
  
  return history;
};

const initialInvestments: Investment[] = [
  {
    id: generateId(),
    name: 'S&P 500 ETF',
    type: 'etf',
    value: 15000,
    initialInvestment: 10000,
    returnRate: 0.08,
    purchaseDate: '2020-01-15',
    history: generateInvestmentHistory(24, 10000, 0.08),
  },
  {
    id: generateId(),
    name: 'Tech Growth Fund',
    type: 'etf',
    value: 8000,
    initialInvestment: 5000,
    returnRate: 0.12,
    purchaseDate: '2021-03-10',
    history: generateInvestmentHistory(18, 5000, 0.12),
  },
  {
    id: generateId(),
    name: 'Bitcoin',
    type: 'crypto',
    value: 3000,
    initialInvestment: 2000,
    returnRate: 0.15,
    purchaseDate: '2022-01-05',
    history: generateInvestmentHistory(12, 2000, 0.15),
  },
  {
    id: generateId(),
    name: 'Corporate Bonds',
    type: 'bond',
    value: 5000,
    initialInvestment: 5000,
    returnRate: 0.04,
    purchaseDate: '2021-06-20',
    history: generateInvestmentHistory(15, 5000, 0.04),
  },
];

const initialForecastScenarios: ForecastScenario[] = [
  {
    id: generateId(),
    name: 'Conservative',
    description: 'Low risk, steady growth',
    monthlyIncome: 4000,
    monthlyExpenses: 3000,
    savingsRate: 0.25,
    investmentReturnRate: 0.06,
    inflationRate: 0.03,
    years: 10,
  },
  {
    id: generateId(),
    name: 'Aggressive',
    description: 'Higher risk, higher potential returns',
    monthlyIncome: 4000,
    monthlyExpenses: 2800,
    savingsRate: 0.30,
    investmentReturnRate: 0.10,
    inflationRate: 0.03,
    years: 10,
  },
  {
    id: generateId(),
    name: 'Early Retirement',
    description: 'Maximize savings for early retirement',
    monthlyIncome: 5000,
    monthlyExpenses: 3000,
    savingsRate: 0.40,
    investmentReturnRate: 0.08,
    inflationRate: 0.03,
    years: 15,
  },
];

// Calculate initial summary
const calculateSummary = (
  transactions: Transaction[],
  investments: Investment[]
): FinancialSummary => {
  const currentMonthTransactions = transactions.filter(t => 
    t.date.startsWith(currentMonth)
  );
  
  const lastMonthTransactions = transactions.filter(t => 
    t.date.startsWith(lastMonth)
  );
  
  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const lastMonthExpenses = lastMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const monthlyChange = lastMonthExpenses ? 
    ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;
  
  const investmentValue = investments.reduce((sum, inv) => sum + inv.value, 0);
  const initialInvestmentValue = investments.reduce((sum, inv) => sum + inv.initialInvestment, 0);
  const investmentReturn = initialInvestmentValue ? 
    ((investmentValue - initialInvestmentValue) / initialInvestmentValue) * 100 : 0;
  
  return {
    totalIncome,
    totalExpenses,
    netWorth: investmentValue + (totalIncome - totalExpenses),
    savingsRate: totalIncome ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0,
    monthlyChange,
    investmentValue,
    investmentReturn,
  };
};

const initialSummary = calculateSummary(initialTransactions, initialInvestments);

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: initialTransactions,
  budgets: initialBudgets,
  investments: initialInvestments,
  forecastScenarios: initialForecastScenarios,
  summary: initialSummary,
  currentMonth,
  
  addTransaction: (transaction) => {
    const newTransaction = { ...transaction, id: generateId() };
    set(state => {
      const updatedTransactions = [...state.transactions, newTransaction];
      return {
        transactions: updatedTransactions,
        summary: calculateSummary(updatedTransactions, state.investments),
      };
    });
  },
  
  updateBudget: (budget) => {
    set(state => ({
      budgets: state.budgets.map(b => b.id === budget.id ? budget : b),
    }));
  },
  
  addInvestment: (investment) => {
    const newInvestment = { 
      ...investment, 
      id: generateId(),
      history: generateInvestmentHistory(
        differenceInMonths(new Date(), parseISO(investment.purchaseDate)),
        investment.initialInvestment,
        investment.returnRate
      ),
    };
    set(state => {
      const updatedInvestments = [...state.investments, newInvestment];
      return {
        investments: updatedInvestments,
        summary: calculateSummary(state.transactions, updatedInvestments),
      };
    });
  },
  
  updateInvestment: (investment) => {
    set(state => {
      const updatedInvestments = state.investments.map(inv => 
        inv.id === investment.id ? investment : inv
      );
      return {
        investments: updatedInvestments,
        summary: calculateSummary(state.transactions, updatedInvestments),
      };
    });
  },
  
  addForecastScenario: (scenario) => {
    const newScenario = { ...scenario, id: generateId() };
    set(state => ({
      forecastScenarios: [...state.forecastScenarios, newScenario],
    }));
  },
  
  updateForecastScenario: (scenario) => {
    set(state => ({
      forecastScenarios: state.forecastScenarios.map(s => 
        s.id === scenario.id ? scenario : s
      ),
    }));
  },
  
  deleteForecastScenario: (id) => {
    set(state => ({
      forecastScenarios: state.forecastScenarios.filter(s => s.id !== id),
    }));
  },
  
  setCurrentMonth: (month) => {
    set({ currentMonth: month });
  },
  
  nextMonth: () => {
    set(state => ({
      currentMonth: format(addMonths(parseISO(`${state.currentMonth}-01`), 1), 'yyyy-MM'),
    }));
  },
  
  previousMonth: () => {
    set(state => ({
      currentMonth: format(subMonths(parseISO(`${state.currentMonth}-01`), 1), 'yyyy-MM'),
    }));
  },
  
  calculateForecast: (scenario) => {
    const { 
      monthlyIncome, 
      monthlyExpenses, 
      savingsRate, 
      investmentReturnRate, 
      years 
    } = scenario;
    
    const monthlySavings = monthlyIncome * savingsRate;
    const monthlyInvestment = monthlySavings;
    const totalMonths = years * 12;
    
    let currentSavings = 0;
    let currentInvestments = get().investments.reduce((sum, inv) => sum + inv.value, 0);
    const forecastData = [];
    
    for (let i = 0; i < totalMonths; i++) {
      // Calculate month
      const date = addMonths(new Date(), i);
      const month = format(date, 'MMM yyyy');
      
      // Update values
      currentSavings += monthlySavings;
      currentInvestments *= (1 + investmentReturnRate / 12);
      currentInvestments += monthlyInvestment;
      
      // Add data point
      forecastData.push({
        month,
        balance: Math.round((monthlyIncome - monthlyExpenses) * (i + 1)),
        savings: Math.round(currentSavings),
        investments: Math.round(currentInvestments),
      });
    }
    
    return forecastData;
  },
}));
