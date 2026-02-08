import { FinanceData, Transaction, Property, BudgetCategory, PropertyMonthlyIncome, PropertyMonthlyExpense, PropertyYearlyTemplate } from '../types';
import { 
  Cartera, 
  Activo, 
  Escenario, 
  SeguimientoCartera, 
  Aportacion, 
  RegistroReal, 
  ActivoValorActual,
  Investment
} from '../features/inversiones/inversiones.types';
import { supabase } from './supabaseClient';

const defaultData: FinanceData = {
  transactions: [],
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

  const [transactionsRes, propertiesRes, budgetsRes] = await Promise.all([
    supabase.from('transactions').select('*').eq('user_id', userId),
    supabase.from('properties').select('*').eq('user_id', userId),
    supabase.from('budgets').select('*').eq('user_id', userId),
  ]);

  if (transactionsRes.error) throw new Error(transactionsRes.error.message);
  if (propertiesRes.error) throw new Error(propertiesRes.error.message);
  if (budgetsRes.error) throw new Error(budgetsRes.error.message);

  return {
    transactions: (transactionsRes.data ?? []).map(mapTransaction),
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

// Calculations
export const getTotalAssets = (data: FinanceData): number => {
  const propertiesTotal = data.properties.reduce((sum, prop) => sum + (prop.value - prop.mortgage), 0);
  return propertiesTotal;
};

export const getYTDReturn = (data: FinanceData): number => {
  return 0;
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

  const { transactions, properties, budgets } = importData.data as FinanceData;

  await supabase.from('transactions').delete().eq('user_id', userId);
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

  await updateCurrency(importData.settings.currency);
};

// Property Monthly Records
export const addPropertyMonthlyIncome = async (income: Omit<PropertyMonthlyIncome, 'id'>) => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('property_monthly_incomes')
    .insert({
      user_id: userId,
      property_id: income.propertyId,
      year_month: income.yearMonth,
      concept: income.concept,
      amount: income.amount,
      paid: income.paid,
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Error al crear ingreso');
  return mapPropertyMonthlyIncome(data);
};

export const addPropertyMonthlyExpense = async (expense: Omit<PropertyMonthlyExpense, 'id'>) => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('property_monthly_expenses')
    .insert({
      user_id: userId,
      property_id: expense.propertyId,
      year_month: expense.yearMonth,
      concept: expense.concept,
      amount: expense.amount,
      paid: expense.paid,
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Error al crear gasto');
  return mapPropertyMonthlyExpense(data);
};

export const loadPropertyMonthlyRecords = async (propertyId: string) => {
  const userId = await getUserId();
  const [incomesRes, expensesRes] = await Promise.all([
    supabase
      .from('property_monthly_incomes')
      .select('*')
      .eq('user_id', userId)
      .eq('property_id', propertyId),
    supabase
      .from('property_monthly_expenses')
      .select('*')
      .eq('user_id', userId)
      .eq('property_id', propertyId),
  ]);

  if (incomesRes.error) throw new Error(incomesRes.error.message);
  if (expensesRes.error) throw new Error(expensesRes.error.message);

  return {
    incomes: (incomesRes.data ?? []).map(mapPropertyMonthlyIncome),
    expenses: (expensesRes.data ?? []).map(mapPropertyMonthlyExpense),
  };
};

export const updatePropertyMonthlyIncome = async (incomeId: string, updates: Partial<PropertyMonthlyIncome>) => {
  const userId = await getUserId();
  const updateData: any = {};
  if (updates.paid !== undefined) updateData.paid = updates.paid;
  if (updates.concept !== undefined) updateData.concept = updates.concept;
  if (updates.amount !== undefined) updateData.amount = updates.amount;

  const { error } = await supabase
    .from('property_monthly_incomes')
    .update(updateData)
    .eq('id', incomeId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
};

export const updatePropertyMonthlyExpense = async (expenseId: string, updates: Partial<PropertyMonthlyExpense>) => {
  const userId = await getUserId();
  const updateData: any = {};
  if (updates.paid !== undefined) updateData.paid = updates.paid;
  if (updates.concept !== undefined) updateData.concept = updates.concept;
  if (updates.amount !== undefined) updateData.amount = updates.amount;

  const { error } = await supabase
    .from('property_monthly_expenses')
    .update(updateData)
    .eq('id', expenseId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
};

export const deletePropertyMonthlyIncome = async (incomeId: string) => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('property_monthly_incomes')
    .delete()
    .eq('id', incomeId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
};

export const deletePropertyMonthlyExpense = async (expenseId: string) => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('property_monthly_expenses')
    .delete()
    .eq('id', expenseId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
};

const mapPropertyMonthlyIncome = (row: any): PropertyMonthlyIncome => ({
  id: row.id,
  propertyId: row.property_id,
  yearMonth: row.year_month,
  concept: row.concept,
  amount: toNumber(row.amount),
  paid: row.paid ?? false,
});

const mapPropertyMonthlyExpense = (row: any): PropertyMonthlyExpense => ({
  id: row.id,
  propertyId: row.property_id,
  yearMonth: row.year_month,
  concept: row.concept,
  amount: toNumber(row.amount),
  paid: row.paid ?? false,
});

// Property Yearly Templates
export const savePropertyYearlyTemplate = async (template: PropertyYearlyTemplate) => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('property_yearly_templates')
    .upsert(
      {
        id: template.id,
        user_id: userId,
        property_id: template.propertyId,
        year: template.year,
        incomes: template.incomes,
        expenses: template.expenses,
        last_applied: template.lastApplied ?? null,
      },
      { onConflict: 'id' }
    )
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Error saving template');
  return mapPropertyYearlyTemplate(data);
};

export const loadPropertyYearlyTemplate = async (propertyId: string, year: number) => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('property_yearly_templates')
    .select('*')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .eq('year', year)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapPropertyYearlyTemplate(data) : null;
};

export const applyYearlyTemplateToPeriod = async (
  propertyId: string,
  template: PropertyYearlyTemplate,
  startMonth: number,
  endMonth: number,
  year: number
) => {
  const userId = await getUserId();

  // Construir lista de meses en el período
  const monthsInPeriod = [];
  for (let month = startMonth; month <= endMonth; month++) {
    const monthStr = month.toString().padStart(2, '0');
    monthsInPeriod.push(`${year}-${monthStr}`);
  }

  // Cargar registros existentes en el período para preservar los pagados
  const { data: existingIncomes, error: loadIncomeError } = await supabase
    .from('property_monthly_incomes')
    .select('*')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .in('year_month', monthsInPeriod);
  
  if (loadIncomeError) throw new Error(loadIncomeError.message);

  const { data: existingExpenses, error: loadExpenseError } = await supabase
    .from('property_monthly_expenses')
    .select('*')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .in('year_month', monthsInPeriod);
  
  if (loadExpenseError) throw new Error(loadExpenseError.message);

  // Borrar SOLO ingresos que NO están marcados como pagados
  const existingIncomeIds = (existingIncomes || [])
    .filter(inc => !inc.paid)  // Solo borrar los NO pagados
    .map(inc => inc.id);
  
  if (existingIncomeIds.length > 0) {
    const { error: deleteIncomeError } = await supabase
      .from('property_monthly_incomes')
      .delete()
      .in('id', existingIncomeIds);
    
    if (deleteIncomeError) throw new Error(deleteIncomeError.message);
  }

  // Borrar SOLO gastos que NO están marcados como pagados
  const existingExpenseIds = (existingExpenses || [])
    .filter(exp => !exp.paid)  // Solo borrar los NO pagados
    .map(exp => exp.id);
  
  if (existingExpenseIds.length > 0) {
    const { error: deleteExpenseError } = await supabase
      .from('property_monthly_expenses')
      .delete()
      .in('id', existingExpenseIds);
    
    if (deleteExpenseError) throw new Error(deleteExpenseError.message);
  }

  // Agregar ingresos de plantilla (solo si no existen ya o si el existente está pagado)
  const incomesToAdd = [];
  for (let month = startMonth; month <= endMonth; month++) {
    const monthStr = month.toString().padStart(2, '0');
    for (const templateIncome of template.incomes) {
      if (templateIncome.repeatingMonths.includes(month)) {
        const yearMonth = `${year}-${monthStr}`;
        // No agregar si ya existe un ingreso pagado con el mismo concepto en este mes
        const existingPaidIncome = (existingIncomes || []).find(
          inc => inc.year_month === yearMonth && 
                 inc.concept === templateIncome.concept && 
                 inc.paid
        );
        
        if (!existingPaidIncome) {
          incomesToAdd.push({
            user_id: userId,
            property_id: propertyId,
            year_month: yearMonth,
            concept: templateIncome.concept,
            amount: templateIncome.amount,
            paid: false,
          });
        }
      }
    }
  }

  if (incomesToAdd.length > 0) {
    const { error: incomeError } = await supabase
      .from('property_monthly_incomes')
      .insert(incomesToAdd);
    if (incomeError) throw new Error(incomeError.message);
  }

  // Agregar gastos de plantilla (solo si no existen ya o si el existente está pagado)
  const expensesToAdd = [];
  for (let month = startMonth; month <= endMonth; month++) {
    const monthStr = month.toString().padStart(2, '0');
    for (const templateExpense of template.expenses) {
      if (templateExpense.repeatingMonths.includes(month)) {
        const yearMonth = `${year}-${monthStr}`;
        // No agregar si ya existe un gasto pagado con el mismo concepto en este mes
        const existingPaidExpense = (existingExpenses || []).find(
          exp => exp.year_month === yearMonth && 
                 exp.concept === templateExpense.concept && 
                 exp.paid
        );
        
        if (!existingPaidExpense) {
          expensesToAdd.push({
            user_id: userId,
            property_id: propertyId,
            year_month: yearMonth,
            concept: templateExpense.concept,
            amount: templateExpense.amount,
            paid: false,
          });
        }
      }
    }
  }

  if (expensesToAdd.length > 0) {
    const { error: expenseError } = await supabase
      .from('property_monthly_expenses')
      .insert(expensesToAdd);
    if (expenseError) throw new Error(expenseError.message);
  }

  // Actualizar last_applied
  const newLastApplied = `${year}-${endMonth.toString().padStart(2, '0')}`;
  await savePropertyYearlyTemplate({
    ...template,
    lastApplied: newLastApplied,
  });
};

const mapPropertyYearlyTemplate = (row: any): PropertyYearlyTemplate => ({
  id: row.id,
  propertyId: row.property_id,
  year: row.year,
  incomes: row.incomes ?? [],
  expenses: row.expenses ?? [],
  lastApplied: row.last_applied ?? undefined,
});
// ================================================================
// INVERSIONES - CARTERAS
// ================================================================

const mapCartera = (row: any): Cartera => ({
  id: row.id,
  nombre: row.nombre,
  descripcion: row.descripcion ?? undefined,
  fecha: row.fecha,
});

export const loadCarteras = async (): Promise<Cartera[]> => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('carteras')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapCartera);
};

export const addCartera = async (cartera: Omit<Cartera, 'id'>): Promise<Cartera> => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('carteras')
    .insert({
      user_id: userId,
      nombre: cartera.nombre,
      descripcion: cartera.descripcion ?? null,
      fecha: cartera.fecha,
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Error al crear cartera');
  return mapCartera(data);
};

export const updateCartera = async (id: string, updates: Partial<Cartera>): Promise<Cartera> => {
  const userId = await getUserId();
  const updateData: any = {};
  if (updates.nombre !== undefined) updateData.nombre = updates.nombre;
  if (updates.descripcion !== undefined) updateData.descripcion = updates.descripcion ?? null;
  if (updates.fecha !== undefined) updateData.fecha = updates.fecha;

  const { data, error } = await supabase
    .from('carteras')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Error al actualizar cartera');
  return mapCartera(data);
};

export const deleteCartera = async (id: string): Promise<void> => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('carteras')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
};

// ================================================================
// INVERSIONES - ACTIVOS
// ================================================================

const mapActivo = (row: any): Activo => ({
  id: row.id,
  nombre: row.nombre,
  tipo: row.tipo,
  capitalInicial: toNumber(row.capital_inicial),
  fecha: row.fecha,
  carteraId: row.cartera_id,
});

export const loadActivos = async (): Promise<Activo[]> => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('activos')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapActivo);
};

export const loadActivosPorCartera = async (carteraId: string): Promise<Activo[]> => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('activos')
    .select('*')
    .eq('user_id', userId)
    .eq('cartera_id', carteraId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapActivo);
};

export const addActivo = async (activo: Omit<Activo, 'id'>): Promise<Activo> => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('activos')
    .insert({
      user_id: userId,
      cartera_id: activo.carteraId,
      nombre: activo.nombre,
      tipo: activo.tipo,
      capital_inicial: activo.capitalInicial,
      fecha: activo.fecha,
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Error al crear activo');
  return mapActivo(data);
};

export const updateActivo = async (id: string, updates: Partial<Activo>): Promise<Activo> => {
  const userId = await getUserId();
  const updateData: any = {};
  if (updates.nombre !== undefined) updateData.nombre = updates.nombre;
  if (updates.tipo !== undefined) updateData.tipo = updates.tipo;
  if (updates.capitalInicial !== undefined) updateData.capital_inicial = updates.capitalInicial;
  if (updates.fecha !== undefined) updateData.fecha = updates.fecha;

  const { data, error } = await supabase
    .from('activos')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Error al actualizar activo');
  return mapActivo(data);
};

export const deleteActivo = async (id: string): Promise<void> => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('activos')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
};

// ================================================================
// INVERSIONES - ESCENARIOS
// ================================================================

const mapEscenario = (row: any): Escenario => ({
  id: row.id,
  nombre: row.nombre,
  rentabilidadAnual: toNumber(row.rentabilidad_anual),
});

export const loadEscenarios = async (): Promise<Escenario[]> => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('escenarios')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapEscenario);
};

export const addEscenario = async (escenario: Omit<Escenario, 'id'>): Promise<Escenario> => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('escenarios')
    .insert({
      user_id: userId,
      nombre: escenario.nombre,
      rentabilidad_anual: escenario.rentabilidadAnual,
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Error al crear escenario');
  return mapEscenario(data);
};

export const updateEscenario = async (id: string, updates: Partial<Escenario>): Promise<Escenario> => {
  const userId = await getUserId();
  const updateData: any = {};
  if (updates.nombre !== undefined) updateData.nombre = updates.nombre;
  if (updates.rentabilidadAnual !== undefined) updateData.rentabilidad_anual = updates.rentabilidadAnual;

  const { data, error } = await supabase
    .from('escenarios')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Error al actualizar escenario');
  return mapEscenario(data);
};

export const deleteEscenario = async (id: string): Promise<void> => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('escenarios')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
};

// ================================================================
// INVERSIONES - SEGUIMIENTOS CARTERA
// ================================================================

const mapSeguimientoCartera = (
  row: any,
  aportaciones: Aportacion[] = [],
  registros: RegistroReal[] = []
): SeguimientoCartera => ({
  id: row.id,
  carteraId: row.cartera_id,
  capitalInicial: toNumber(row.capital_inicial),
  aportacionMensualBase: toNumber(row.aportacion_mensual_base),
  aportacionesAdicionales: aportaciones,
  registrosReales: registros,
  mesInicio: row.mes_inicio,
  mesInicioAportaciones: row.mes_inicio_aportaciones,
  mesFin: row.mes_fin ?? undefined,
  mesActual: row.mes_actual ?? undefined,
});

export const loadSeguimientosPorCartera = async (carteraId: string): Promise<SeguimientoCartera | null> => {
  const userId = await getUserId();
  
  // Cargar seguimiento
  const { data: segData, error: segError } = await supabase
    .from('seguimientos_cartera')
    .select('*')
    .eq('user_id', userId)
    .eq('cartera_id', carteraId)
    .maybeSingle();

  if (segError) throw new Error(segError.message);
  if (!segData) return null;

  // Cargar aportaciones adicionales
  const { data: aportData, error: aportError } = await supabase
    .from('aportaciones_adicionales')
    .select('*')
    .eq('user_id', userId)
    .eq('seguimiento_id', segData.id);

  if (aportError) throw new Error(aportError.message);

  const aportaciones: Aportacion[] = (aportData ?? []).map(a => ({
    mes: a.mes,
    monto: toNumber(a.monto),
  }));

  // Cargar registros reales
  const { data: regData, error: regError } = await supabase
    .from('registros_reales')
    .select('*')
    .eq('user_id', userId)
    .eq('seguimiento_id', segData.id);

  if (regError) throw new Error(regError.message);

  const registros: RegistroReal[] = (regData ?? []).map(r => ({
    mes: r.mes,
    valorReal: toNumber(r.valor_real),
    rentabilidadReal: r.rentabilidad_real !== null ? toNumber(r.rentabilidad_real) : undefined,
  }));

  return mapSeguimientoCartera(segData, aportaciones, registros);
};

export const loadSeguimientos = async (): Promise<SeguimientoCartera[]> => {
  const userId = await getUserId();
  
  const { data: segData, error: segError } = await supabase
    .from('seguimientos_cartera')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (segError) throw new Error(segError.message);
  if (!segData) return [];

  // Cargar todas las aportaciones y registros
  const seguimientos: SeguimientoCartera[] = [];
  for (const seg of segData) {
    const { data: aportData } = await supabase
      .from('aportaciones_adicionales')
      .select('*')
      .eq('seguimiento_id', seg.id);

    const { data: regData } = await supabase
      .from('registros_reales')
      .select('*')
      .eq('seguimiento_id', seg.id);

    const aportaciones: Aportacion[] = (aportData ?? []).map(a => ({
      mes: a.mes,
      monto: toNumber(a.monto),
    }));

    const registros: RegistroReal[] = (regData ?? []).map(r => ({
      mes: r.mes,
      valorReal: toNumber(r.valor_real),
      rentabilidadReal: r.rentabilidad_real !== null ? toNumber(r.rentabilidad_real) : undefined,
    }));

    seguimientos.push(mapSeguimientoCartera(seg, aportaciones, registros));
  }

  return seguimientos;
};

export const saveSeguimientoCartera = async (seguimiento: SeguimientoCartera): Promise<SeguimientoCartera> => {
  const userId = await getUserId();

  // Verificar si ya existe un seguimiento para esta cartera
  const { data: existing } = await supabase
    .from('seguimientos_cartera')
    .select('id')
    .eq('user_id', userId)
    .eq('cartera_id', seguimiento.carteraId)
    .maybeSingle();

  let seguimientoId: string;

  if (existing) {
    // Actualizar seguimiento existente
    const { data, error } = await supabase
      .from('seguimientos_cartera')
      .update({
        capital_inicial: seguimiento.capitalInicial,
        aportacion_mensual_base: seguimiento.aportacionMensualBase,
        mes_inicio: seguimiento.mesInicio,
        mes_inicio_aportaciones: seguimiento.mesInicioAportaciones,
        mes_fin: seguimiento.mesFin ?? null,
        mes_actual: seguimiento.mesActual ?? null,
      })
      .eq('id', existing.id)
      .eq('user_id', userId)
      .select('*')
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Error al actualizar seguimiento');
    seguimientoId = data.id;
  } else {
    // Crear nuevo seguimiento
    const { data, error } = await supabase
      .from('seguimientos_cartera')
      .insert({
        user_id: userId,
        cartera_id: seguimiento.carteraId,
        capital_inicial: seguimiento.capitalInicial,
        aportacion_mensual_base: seguimiento.aportacionMensualBase,
        mes_inicio: seguimiento.mesInicio,
        mes_inicio_aportaciones: seguimiento.mesInicioAportaciones,
        mes_fin: seguimiento.mesFin ?? null,
        mes_actual: seguimiento.mesActual ?? null,
      })
      .select('*')
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Error al crear seguimiento');
    seguimientoId = data.id;
  }

  // Eliminar aportaciones existentes
  await supabase
    .from('aportaciones_adicionales')
    .delete()
    .eq('user_id', userId)
    .eq('seguimiento_id', seguimientoId);

  // Insertar aportaciones adicionales
  if (seguimiento.aportacionesAdicionales.length > 0) {
    const { error: aportError } = await supabase
      .from('aportaciones_adicionales')
      .insert(
        seguimiento.aportacionesAdicionales.map(a => ({
          user_id: userId,
          seguimiento_id: seguimientoId,
          mes: a.mes,
          monto: a.monto,
        }))
      );

    if (aportError) throw new Error(aportError.message);
  }

  // Eliminar registros reales existentes
  await supabase
    .from('registros_reales')
    .delete()
    .eq('user_id', userId)
    .eq('seguimiento_id', seguimientoId);

  // Insertar registros reales
  if (seguimiento.registrosReales.length > 0) {
    const { error: regError } = await supabase
      .from('registros_reales')
      .insert(
        seguimiento.registrosReales.map(r => ({
          user_id: userId,
          seguimiento_id: seguimientoId,
          mes: r.mes,
          valor_real: r.valorReal,
          rentabilidad_real: r.rentabilidadReal ?? null,
        }))
      );

    if (regError) throw new Error(regError.message);
  }

  // Retornar seguimiento actualizado
  return await loadSeguimientosPorCartera(seguimiento.carteraId) as SeguimientoCartera;
};

export const deleteSeguimientoCartera = async (carteraId: string): Promise<void> => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('seguimientos_cartera')
    .delete()
    .eq('user_id', userId)
    .eq('cartera_id', carteraId);

  if (error) throw new Error(error.message);
};

// ================================================================
// INVERSIONES - VALORES ACTUALES DE ACTIVOS
// ================================================================

const mapActivoValorActual = (row: any, activoNombre: string): ActivoValorActual => ({
  id: row.id,
  activoId: row.activo_id,
  nombre: activoNombre,
  cantidadActual: toNumber(row.cantidad_actual),
  valorActual: toNumber(row.valor_actual),
  fecha: row.fecha,
});

export const loadActivosValoresActuales = async (): Promise<ActivoValorActual[]> => {
  const userId = await getUserId();
  
  const { data, error } = await supabase
    .from('activos_valores_actuales')
    .select('*, activos(nombre)')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return (data ?? []).map(row => mapActivoValorActual(row, (row as any).activos?.nombre ?? 'Sin nombre'));
};

export const saveActivoValorActual = async (valor: Omit<ActivoValorActual, 'id'>): Promise<ActivoValorActual> => {
  const userId = await getUserId();

  // Verificar si ya existe valor para este activo
  const { data: existing } = await supabase
    .from('activos_valores_actuales')
    .select('id')
    .eq('user_id', userId)
    .eq('activo_id', valor.activoId)
    .maybeSingle();

  if (existing) {
    // Actualizar
    const { data, error } = await supabase
      .from('activos_valores_actuales')
      .update({
        cantidad_actual: valor.cantidadActual,
        valor_actual: valor.valorActual,
        fecha: valor.fecha,
      })
      .eq('id', existing.id)
      .eq('user_id', userId)
      .select('*, activos(nombre)')
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Error al actualizar valor actual');
    return mapActivoValorActual(data, (data as any).activos?.nombre ?? valor.nombre);
  } else {
    // Insertar
    const { data, error } = await supabase
      .from('activos_valores_actuales')
      .insert({
        user_id: userId,
        activo_id: valor.activoId,
        cantidad_actual: valor.cantidadActual,
        valor_actual: valor.valorActual,
        fecha: valor.fecha,
      })
      .select('*, activos(nombre)')
      .single();

    if (error || !data) throw new Error(error?.message ?? 'Error al crear valor actual');
    return mapActivoValorActual(data, (data as any).activos?.nombre ?? valor.nombre);
  }
};

export const deleteActivoValorActual = async (activoId: string): Promise<void> => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('activos_valores_actuales')
    .delete()
    .eq('user_id', userId)
    .eq('activo_id', activoId);

  if (error) throw new Error(error.message);
};

// ================================================================
// PORTFOLIO SIMPLE - INVESTMENTS
// ================================================================

const mapInvestment = (row: any): Investment => ({
  id: row.id,
  name: row.name,
  amountInvested: toNumber(row.amount_invested),
  currentValue: toNumber(row.current_value),
  dateAcquired: new Date(row.date_acquired),
});

export const loadInvestments = async (): Promise<Investment[]> => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('investments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapInvestment);
};

export const addInvestment = async (investment: Omit<Investment, 'id'>): Promise<Investment> => {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('investments')
    .insert({
      user_id: userId,
      name: investment.name,
      amount_invested: investment.amountInvested,
      current_value: investment.currentValue,
      date_acquired: investment.dateAcquired.toISOString().split('T')[0],
    })
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Error al crear inversión');
  return mapInvestment(data);
};

export const updateInvestment = async (id: string, updates: Partial<Investment>): Promise<Investment> => {
  const userId = await getUserId();
  const updateData: any = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.amountInvested !== undefined) updateData.amount_invested = updates.amountInvested;
  if (updates.currentValue !== undefined) updateData.current_value = updates.currentValue;
  if (updates.dateAcquired !== undefined) updateData.date_acquired = updates.dateAcquired.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('investments')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error || !data) throw new Error(error?.message ?? 'Error al actualizar inversión');
  return mapInvestment(data);
};

export const deleteInvestment = async (id: string): Promise<void> => {
  const userId = await getUserId();
  const { error } = await supabase
    .from('investments')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
};