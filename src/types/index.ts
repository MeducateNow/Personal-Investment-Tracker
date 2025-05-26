export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  description: string;
  type: 'income' | 'expense';
}

export interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  period: string;
}

export interface Investment {
  id: string;
  name: string;
  type: 'stock' | 'crypto' | 'etf' | 'bond' | 'real-estate';
  value: number;
  initialInvestment: number;
  returnRate: number;
  purchaseDate: string;
  history: {
    date: string;
    value: number;
  }[];
}

export interface ForecastScenario {
  id: string;
  name: string;
  description: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number;
  investmentReturnRate: number;
  inflationRate: number;
  years: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netWorth: number;
  savingsRate: number;
  monthlyChange: number;
  investmentValue: number;
  investmentReturn: number;
}
