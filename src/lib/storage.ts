import { FinanceData, Transaction, Investment, Property, BudgetCategory, Contribution } from '../types';
import { supabase } from './supabaseClient';

const defaultData: FinanceData = {
  transactions: [],
  investments: [],
  properties: [],
  budgets: [],
};

export interface Settings {
  currency: 'USD' | 'EUR' | 'GBP' | 'ARS' | 'MXN' | 'COP';
  currencySymbol: string;
}

const defaultSettings: Settings = {
  currency: 'USD',
  currencySymbol: '$',
};

const currencySymbols: Record<Settings['currency'], string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  ARS: '$',
  MXN: '$',
  COP: '$',
};

let settingsCache: Settings = defaultSettings;
let settingsLoaded = false;

const toNumber = (value: unknown, fallback = 0): number => {
  if (value === null || value === undefined || value === '') return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const getUserId = async (): Promise<string> => {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error('Usuario no autenticado en Supabase.');
  }
  return data.user.id;
};

export const getSettingsCache = (): Settings => settingsCache;

export const loadSettings = async (): Promise<Settings> => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(`Error cargando ajustes: ${error.message}`);
  }

  if (!data) {
    const insert = await supabase
      .from('settings')
      .insert({
        user_id: userId,
        currency: defaultSettings.currency,
        currency_symbol: defaultSettings.currencySymbol,
      })
      .select('*')
      .single();

    if (insert.error || !insert.data) {
      throw new Error(`Error creando ajustes: ${insert.error?.message ?? 'desconocido'}`);
    }

    settingsCache = {
      currency: insert.data.currency,
      currencySymbol: insert.data.currency_symbol,
    };
  } else {
    settingsCache = {
      currency: data.currency,
      currencySymbol: data.currency_symbol,
    };
  }

  settingsLoaded = true;
  return settingsCache;
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('settings')
    .upsert({
      user_id: userId,
      currency: settings.currency,
      currency_symbol: settings.currencySymbol,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) {
    throw new Error(`Error guardando ajustes: ${error.message}`);
  }

  settingsCache = settings;
  settingsLoaded = true;
};

export const updateCurrency = async (currency: Settings['currency']): Promise<void> => {
  const settings = settingsLoaded ? settingsCache : defaultSettings;
  const updated: Settings = {
    ...settings,
    currency,
    currencySymbol: currencySymbols[currency],
  };
  await saveSettings(updated);
};

const mapTransaction = (row: any): Transaction => ({
  id: row.id,
  date: row.date,
  category: row.category,
  description: row.description,
  amount: toNumber(row.amount),
  type: row.type,
});

const mapContribution = (row: any): Contribution => ({
  id: row.id,
  date: row.date,
  amount: toNumber(row.amount),
  shares: toNumber(row.shares),
  pricePerShare: toNumber(row.price_per_share),
});

const mapInvestment = (row: any): Investment => ({
  id: row.id,
  name: row.name,
  isin: row.isin,
  shares: toNumber(row.shares),
  purchasePrice: toNumber(row.purchase_price),
  amount: toNumber(row.amount),
  currentValue: toNumber(row.current_value),
  currentPrice: row.current_price === null ? undefined : toNumber(row.current_price),
  valuationMode: row.valuation_mode,
  purchaseDate: row.purchase_date,
  type: row.type,
  savingsRate: row.savings_rate === null ? undefined : toNumber(row.savings_rate),
  savingsLastUpdate: row.savings_last_update ?? undefined,
  contributions: Array.isArray(row.contributions) ? row.contributions.map(mapContribution) : [],
});

const mapProperty = (row: any): Property => ({
  id: row.id,
  name: row.name,
  value: toNumber(row.value),
  mortgage: toNumber(row.mortgage),
  mortgagePayment: toNumber(row.mortgage_payment),
  monthlyRent: toNumber(row.monthly_rent),
  annualCosts: toNumber(row.annual_costs),
  purchaseDate: row.purchase_date,
  appreciation: toNumber(row.appreciation),
  occupancy: toNumber(row.occupancy),
});

const mapBudget = (row: any): BudgetCategory => ({
  id: row.id,
  category: row.category,
  budgeted: toNumber(row.budgeted),
  month: row.month ?? undefined,
  period: row.period,
  periodKey: row.period_key,
  isRecurring: row.is_recurring ?? false,
  startDate: row.start_date ?? undefined,
});

export const loadData = async (): Promise<FinanceData> => {
  const userId = await getUserId();

  const [transactionsRes, investmentsRes, propertiesRes, budgetsRes] = await Promise.all([
    supabase.from('transactions').select('*').eq('user_id', userId),
    supabase.from('investments').select('*, contributions(*)').eq('user_id', userId),
    supabase.from('properties').select('*').eq('user_id', userId),
    supabase.from('budgets').select('*').eq('user_id', userId),
  ]);

  if (transactionsRes.error) throw new Error(transactionsRes.error.message);
  if (investmentsRes.error) throw new Error(investmentsRes.error.message);
  if (propertiesRes.error) throw new Error(propertiesRes.error.message);
  if (budgetsRes.error) throw new Error(budgetsRes.error.message);

  return {
    transactions: (transactionsRes.data ?? []).map(mapTransaction),
    investments: (investmentsRes.data ?? []).map(mapInvestment),
    properties: (propertiesRes.data ?? []).map(mapProperty),
    budgets: (budgetsRes.data ?? []).map(mapBudget),
  };
};

// Transactions
export const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      date: transaction.date,
      category: transaction.category,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Error al crear transacción');
  return mapTransaction(data);
};

export const deleteTransaction = async (id: string) => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
};

// Investments
export const addInvestment = async (investment: Omit<Investment, 'id'>) => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('investments')
    .insert({
      user_id: userId,
      name: investment.name,
      isin: investment.isin,
      shares: investment.shares,
      purchase_price: investment.purchasePrice,
      amount: investment.amount,
      current_value: investment.currentValue,
      current_price: investment.currentPrice ?? null,
      valuation_mode: investment.valuationMode ?? 'auto',
      purchase_date: investment.purchaseDate,
      type: investment.type,
      savings_rate: investment.savingsRate ?? null,
      savings_last_update: investment.savingsLastUpdate ?? null,
    })
    .select('*, contributions(*)')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Error al crear inversión');
  return mapInvestment(data);
};

export const deleteInvestment = async (id: string) => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('investments')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
};

const mapInvestmentUpdates = (updates: Partial<Investment>) => {
  const mapped: Record<string, unknown> = {};
  if (updates.name !== undefined) mapped.name = updates.name;
  if (updates.isin !== undefined) mapped.isin = updates.isin;
  if (updates.shares !== undefined) mapped.shares = updates.shares;
  if (updates.purchasePrice !== undefined) mapped.purchase_price = updates.purchasePrice;
  if (updates.amount !== undefined) mapped.amount = updates.amount;
  if (updates.currentValue !== undefined) mapped.current_value = updates.currentValue;
  if (updates.currentPrice !== undefined) mapped.current_price = updates.currentPrice ?? null;
  if (updates.valuationMode !== undefined) mapped.valuation_mode = updates.valuationMode;
  if (updates.purchaseDate !== undefined) mapped.purchase_date = updates.purchaseDate;
  if (updates.type !== undefined) mapped.type = updates.type;
  if (updates.savingsRate !== undefined) mapped.savings_rate = updates.savingsRate ?? null;
  if (updates.savingsLastUpdate !== undefined) mapped.savings_last_update = updates.savingsLastUpdate ?? null;
  return mapped;
};

export const updateInvestment = async (id: string, updates: Partial<Investment>) => {
  const userId = await getUserId();
  const mapped = mapInvestmentUpdates(updates);
  if (Object.keys(mapped).length === 0) return null;

  const { data, error } = await supabase
    .from('investments')
    .update(mapped)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*, contributions(*)')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Error al actualizar inversión');
  return mapInvestment(data);
};

// Properties
export const addProperty = async (property: Omit<Property, 'id'>) => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('properties')
    .insert({
      user_id: userId,
      name: property.name,
      value: property.value,
      mortgage: property.mortgage,
      mortgage_payment: property.mortgagePayment,
      monthly_rent: property.monthlyRent,
      annual_costs: property.annualCosts,
      purchase_date: property.purchaseDate,
      appreciation: property.appreciation,
      occupancy: property.occupancy,
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Error al crear propiedad');
  return mapProperty(data);
};

export const deleteProperty = async (id: string) => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
};

// Budgets
export const addBudget = async (budget: Omit<BudgetCategory, 'id'>) => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('budgets')
    .insert({
      user_id: userId,
      category: budget.category,
      budgeted: budget.budgeted,
      month: budget.month ?? null,
      period: budget.period ?? 'monthly',
      period_key: budget.periodKey ?? budget.month ?? '',
      is_recurring: budget.isRecurring ?? false,
      start_date: budget.startDate ?? null,
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Error al crear presupuesto');
  return mapBudget(data);
};

export const deleteBudget = async (id: string) => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw new Error(error.message);
};

const mapBudgetUpdates = (updates: Partial<BudgetCategory>) => {
  const mapped: Record<string, unknown> = {};
  if (updates.category !== undefined) mapped.category = updates.category;
  if (updates.budgeted !== undefined) mapped.budgeted = updates.budgeted;
  if (updates.month !== undefined) mapped.month = updates.month ?? null;
  if (updates.period !== undefined) mapped.period = updates.period;
  if (updates.periodKey !== undefined) mapped.period_key = updates.periodKey;
  if (updates.isRecurring !== undefined) mapped.is_recurring = updates.isRecurring;
  if (updates.startDate !== undefined) mapped.start_date = updates.startDate ?? null;
  return mapped;
};

export const updateBudget = async (id: string, updates: Partial<BudgetCategory>) => {
  const userId = await getUserId();
  const mapped = mapBudgetUpdates(updates);
  if (Object.keys(mapped).length === 0) return null;

  const { data, error } = await supabase
    .from('budgets')
    .update(mapped)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Error al actualizar presupuesto');
  return mapBudget(data);
};

export const addContribution = async (investmentId: string, contribution: Omit<Contribution, 'id'>) => {
  const { data, error } = await supabase
    .from('contributions')
    .insert({
      investment_id: investmentId,
      date: contribution.date,
      amount: contribution.amount,
      shares: contribution.shares,
      price_per_share: contribution.pricePerShare,
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Error al crear aportación');
  return mapContribution(data);
};

export const deleteContribution = async (id: string) => {
  const { error } = await supabase
    .from('contributions')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
};

// Calculations
export const getTotalAssets = (data: FinanceData): number => {
  const investmentsTotal = data.investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const propertiesTotal = data.properties.reduce((sum, prop) => sum + (prop.value - prop.mortgage), 0);
  return investmentsTotal + propertiesTotal;
};

export const getYTDReturn = (data: FinanceData): number => {
  const investments = data.investments.reduce((sum, inv) => sum + (inv.currentValue - inv.amount), 0);
  return investments;
};

export const getMonthlyIncome = (data: FinanceData): number => {
  return data.properties.reduce((sum, prop) => sum + prop.monthlyRent * ((prop.occupancy ?? 100) / 100), 0);
};

export const getMonthlyExpenses = (data: FinanceData, month: string): number => {
  return data.transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(month))
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getMonthlyBudget = (data: FinanceData, month: string): number => {
  return data.budgets
    .filter(b => b.month === month)
    .reduce((sum, b) => sum + b.budgeted, 0);
};

// Importación y Exportación de Datos
export const exportAllData = async (): Promise<void> => {
  try {
    const data = await loadData();
    const settings = settingsLoaded ? settingsCache : await loadSettings();
    
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data,
      settings,
    };
    
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cartera-financiera-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('No se pudo exportar los datos');
  }
};

export const importAllData = async (file: File): Promise<void> => {
  const userId = await getUserId();
  const text = await file.text();
  const importData = JSON.parse(text);

  if (!importData.data || !importData.settings) {
    throw new Error('Formato de archivo inválido');
  }

  const { transactions, investments, properties, budgets } = importData.data as FinanceData;

  await supabase.from('transactions').delete().eq('user_id', userId);
  await supabase.from('investments').delete().eq('user_id', userId);
  await supabase.from('properties').delete().eq('user_id', userId);
  await supabase.from('budgets').delete().eq('user_id', userId);

  if (transactions.length > 0) {
    await supabase.from('transactions').insert(
      transactions.map(t => ({
        user_id: userId,
        date: t.date,
        category: t.category,
        description: t.description,
        amount: t.amount,
        type: t.type,
      }))
    );
  }

  if (properties.length > 0) {
    await supabase.from('properties').insert(
      properties.map(p => ({
        user_id: userId,
        name: p.name,
        value: p.value,
        mortgage: p.mortgage,
        mortgage_payment: p.mortgagePayment,
        monthly_rent: p.monthlyRent,
        annual_costs: p.annualCosts,
        purchase_date: p.purchaseDate,
        appreciation: p.appreciation,
        occupancy: p.occupancy,
      }))
    );
  }

  if (budgets.length > 0) {
    await supabase.from('budgets').insert(
      budgets.map(b => ({
        user_id: userId,
        category: b.category,
        budgeted: b.budgeted,
        month: b.month ?? null,
        period: b.period ?? 'monthly',
        period_key: b.periodKey ?? b.month ?? '',
        is_recurring: b.isRecurring ?? false,
        start_date: b.startDate ?? null,
      }))
    );
  }

  if (investments.length > 0) {
    for (const inv of investments) {
      const insertInvestment = await supabase
        .from('investments')
        .insert({
          user_id: userId,
          name: inv.name,
          isin: inv.isin,
          shares: inv.shares,
          purchase_price: inv.purchasePrice,
          amount: inv.amount,
          current_value: inv.currentValue,
          current_price: inv.currentPrice ?? null,
          valuation_mode: inv.valuationMode ?? 'auto',
          purchase_date: inv.purchaseDate,
          type: inv.type,
          savings_rate: inv.savingsRate ?? null,
          savings_last_update: inv.savingsLastUpdate ?? null,
        })
        .select('id')
        .single();

      if (insertInvestment.error || !insertInvestment.data) {
        throw new Error(insertInvestment.error?.message ?? 'Error importando inversiones');
      }

      const investmentId = insertInvestment.data.id;
      const contributions = inv.contributions ?? [];
      if (contributions.length > 0) {
        await supabase.from('contributions').insert(
          contributions.map(c => ({
            investment_id: investmentId,
            date: c.date,
            amount: c.amount,
            shares: c.shares,
            price_per_share: c.pricePerShare,
          }))
        );
      }
    }
  }

  await updateCurrency(importData.settings.currency);
};
