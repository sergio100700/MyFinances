export interface Transaction {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
}

export interface Contribution {
  id: string;
  date: string;
  amount: number; // Amount invested in this contribution
  shares: number; // Number of shares/units acquired
  pricePerShare: number; // Price per share at contribution
}

export interface Investment {
  id: string;
  name: string;
  isin: string; // ISIN code for Yahoo Finance lookup
  shares: number; // Number of shares/units owned
  purchasePrice: number; // Price per share at purchase (or average price)
  amount: number; // Total invested (shares * purchasePrice)
  currentValue: number; // Current market value (updated from Yahoo Finance)
  currentPrice?: number; // Current price per share
  valuationMode?: 'auto' | 'manual'; // auto uses ISIN price, manual uses user values
  purchaseDate: string;
  type: 'stocks' | 'etf' | 'funds' | 'crypto' | 'bonds' | 'savings' | 'other';
  contributions?: Contribution[]; // Aportaciones mensuales/semanales/extras
  savingsRate?: number; // Annual rate in % (manual)
  savingsLastUpdate?: string; // Date when interest was last applied
}

export interface Property {
  id: string;
  name: string;
  value: number;
  mortgage: number;
  mortgagePayment: number;
  monthlyRent: number;
  annualCosts: number;
  purchaseDate: string;
  appreciation: number;
  occupancy: number;
}

export interface BudgetCategory {
  id: string;
  category: string;
  budgeted: number;
  month?: string; // YYYY-MM (legacy mensual)
  period?: 'monthly' | 'annual';
  periodKey?: string; // YYYY-MM for monthly, YYYY for annual
  isRecurring?: boolean; // Si es recurrente
  startDate?: string; // Fecha de inicio de la recurrencia (YYYY-MM)
}

export interface FinanceData {
  transactions: Transaction[];
  investments: Investment[];
  properties: Property[];
  budgets: BudgetCategory[];
}