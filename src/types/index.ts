export interface Transaction {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
}

export interface PropertyMonthlyIncome {
  id: string;
  propertyId: string;
  yearMonth: string; // YYYY-MM
  concept: string; // "Alquiler", "Extra", etc.
  amount: number;
  paid: boolean; // Si se ha recibido el pago
}

export interface PropertyMonthlyExpense {
  id: string;
  propertyId: string;
  yearMonth: string; // YYYY-MM
  concept: string; // "Comunidad", "IBI", "Basura", "Hipoteca", "Derrama", etc.
  amount: number;
  paid: boolean; // Si se ha pagado
}

export interface PropertyTemplateIncome {
  id: string;
  concept: string; // "Alquiler", "Extra", etc.
  amount: number;
  repeatingMonths: number[]; // Meses en los que se repite (1-12)
}

export interface PropertyTemplateExpense {
  id: string;
  concept: string; // "Hipoteca", "Comunidad", etc.
  amount: number;
  repeatingMonths: number[]; // Meses en los que se repite (1-12)
}

export interface PropertyYearlyTemplate {
  id: string;
  propertyId: string;
  year: number;
  incomes: PropertyTemplateIncome[];
  expenses: PropertyTemplateExpense[];
  lastApplied?: string; // YYYY-MM fecha en la que se aplicó
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
  monthlyIncomes?: PropertyMonthlyIncome[]; // Registros de ingresos mes a mes
  monthlyExpenses?: PropertyMonthlyExpense[]; // Registros de gastos mes a mes
  yearlyTemplate?: PropertyYearlyTemplate; // Plantilla anual

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
  properties: Property[];
  budgets: BudgetCategory[];
}