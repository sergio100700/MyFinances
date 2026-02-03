import React, { useState, useEffect } from 'react';
import { Property, PropertyMonthlyIncome, PropertyMonthlyExpense } from '../../types';
import { 
  addPropertyMonthlyIncome, 
  addPropertyMonthlyExpense, 
  loadPropertyMonthlyRecords,
  deletePropertyMonthlyIncome,
  deletePropertyMonthlyExpense,
  updatePropertyMonthlyIncome,
  updatePropertyMonthlyExpense,
} from '../../lib/storage';
import { formatCurrency } from '../../lib/format';

interface PropertyMonthlyRecordsProps {
  property: Property;
  onSuccess?: () => void;
  refreshTrigger?: number;
}

const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const PropertyMonthlyRecords: React.FC<PropertyMonthlyRecordsProps> = ({ 
  property, 
  onSuccess,
  refreshTrigger
}) => {
  const [viewMode, setViewMode] = useState<'monthly' | 'annual'>('monthly');
  const [yearMonth, setYearMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyIncomes, setMonthlyIncomes] = useState<PropertyMonthlyIncome[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<PropertyMonthlyExpense[]>([]);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const [incomeFormData, setIncomeFormData] = useState({
    concept: '',
    amount: '',
    paid: false,
  });

  const [expenseFormData, setExpenseFormData] = useState({
    concept: '',
    amount: '',
    paid: false,
  });

  const loadRecords = async () => {
    try {
      const records = await loadPropertyMonthlyRecords(property.id);
      setMonthlyIncomes(records.incomes);
      setMonthlyExpenses(records.expenses);
    } catch (error) {
      console.error('Error loading monthly records:', error);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [property.id]);

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      loadRecords();
    }
  }, [refreshTrigger]);

  const currentMonthIncomes = monthlyIncomes.filter(i => i.yearMonth === yearMonth);
  const currentMonthExpenses = monthlyExpenses.filter(e => e.yearMonth === yearMonth);

  const totalIncome = currentMonthIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const paidIncome = currentMonthIncomes.filter(i => i.paid).reduce((sum, i) => sum + i.amount, 0);
  const paidExpenses = currentMonthExpenses.filter(e => e.paid).reduce((sum, e) => sum + e.amount, 0);

  const handleMarkAllIncomesPaid = async () => {
    const unpaid = currentMonthIncomes.filter(i => !i.paid);
    if (unpaid.length === 0) return;

    try {
      await Promise.all(
        unpaid.map((income) => updatePropertyMonthlyIncome(income.id, { paid: true }))
      );
      await loadRecords();
      onSuccess?.();
    } catch (error) {
      console.error('Error updating incomes:', error);
    }
  };

  const handleMarkAllExpensesPaid = async () => {
    const unpaid = currentMonthExpenses.filter(e => !e.paid);
    if (unpaid.length === 0) return;

    try {
      await Promise.all(
        unpaid.map((expense) => updatePropertyMonthlyExpense(expense.id, { paid: true }))
      );
      await loadRecords();
      onSuccess?.();
    } catch (error) {
      console.error('Error updating expenses:', error);
    }
  };

  const handleAddIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeFormData.concept.trim() || !incomeFormData.amount) return;

    try {
      await addPropertyMonthlyIncome({
        propertyId: property.id,
        yearMonth,
        concept: incomeFormData.concept,
        amount: Number(incomeFormData.amount),
        paid: incomeFormData.paid,
      });
      setIncomeFormData({ concept: '', amount: '', paid: false });
      await loadRecords();
      onSuccess?.();
    } catch (error) {
      console.error('Error adding income:', error);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseFormData.concept.trim() || !expenseFormData.amount) return;

    try {
      await addPropertyMonthlyExpense({
        propertyId: property.id,
        yearMonth,
        concept: expenseFormData.concept,
        amount: Number(expenseFormData.amount),
        paid: expenseFormData.paid,
      });
      setExpenseFormData({ concept: '', amount: '', paid: false });
      await loadRecords();
      onSuccess?.();
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  };

  const handleToggleIncomePaid = async (income: PropertyMonthlyIncome) => {
    try {
      await updatePropertyMonthlyIncome(income.id, { paid: !income.paid });
      await loadRecords();
      onSuccess?.();
    } catch (error) {
      console.error('Error updating income:', error);
    }
  };

  const handleToggleExpensePaid = async (expense: PropertyMonthlyExpense) => {
    try {
      await updatePropertyMonthlyExpense(expense.id, { paid: !expense.paid });
      await loadRecords();
      onSuccess?.();
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleDeleteIncome = async (incomeId: string) => {
    if (confirm('¿Eliminar este ingreso?')) {
      try {
        await deletePropertyMonthlyIncome(incomeId);
        await loadRecords();
        onSuccess?.();
      } catch (error) {
        console.error('Error deleting income:', error);
      }
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (confirm('¿Eliminar este gasto?')) {
      try {
        await deletePropertyMonthlyExpense(expenseId);
        await loadRecords();
        onSuccess?.();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>📅 Registros Mensuales - {property.name}</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setViewMode('monthly')}
            style={{
              padding: '0.5rem 1rem',
              background: viewMode === 'monthly' ? '#667eea' : '#ddd',
              color: viewMode === 'monthly' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Mes a Mes
          </button>
          <button
            onClick={() => setViewMode('annual')}
            style={{
              padding: '0.5rem 1rem',
              background: viewMode === 'annual' ? '#667eea' : '#ddd',
              color: viewMode === 'annual' ? 'white' : '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Vista Anual
          </button>
        </div>
      </div>

      {viewMode === 'monthly' && (
        <>
          <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => {
                const [year, month] = yearMonth.split('-');
                const date = new Date(Number(year), Number(month) - 1, 1);
                date.setMonth(date.getMonth() - 1);
                const newMonth = String(date.getMonth() + 1).padStart(2, '0');
                const newYear = date.getFullYear();
                setYearMonth(`${newYear}-${newMonth}`);
              }}
              style={{
                padding: '0.5rem 0.75rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1.2rem',
              }}
            >
              ◀
            </button>

            <div style={{ flex: 1 }}>
              <label htmlFor={`month-picker-${property.id}`} style={{ marginRight: '0.5rem' }}>
                Seleccionar mes:
              </label>
              <input
                id={`month-picker-${property.id}`}
                type="month"
                value={yearMonth}
                onChange={(e) => setYearMonth(e.target.value)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  fontSize: '1rem',
                }}
              />
            </div>

            <button
              onClick={() => {
                const [year, month] = yearMonth.split('-');
                const date = new Date(Number(year), Number(month) - 1, 1);
                date.setMonth(date.getMonth() + 1);
                const newMonth = String(date.getMonth() + 1).padStart(2, '0');
                const newYear = date.getFullYear();
                setYearMonth(`${newYear}-${newMonth}`);
              }}
              style={{
                padding: '0.5rem 0.75rem',
                background: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1.2rem',
              }}
            >
              ▶
            </button>
          </div>

          <div className="grid-cards grid-cards--sm" style={{ marginBottom: '1.5rem' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', color: '#333' }}>
              <h4>INGRESOS TOTALES</h4>
              <p style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{formatCurrency(totalIncome)}</p>
              <p style={{ fontSize: '0.85rem', margin: '0.25rem 0', opacity: 0.8 }}>Pagados: {formatCurrency(paidIncome)}</p>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: '#333' }}>
              <h4>GASTOS TOTALES</h4>
              <p style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0.5rem 0' }}>{formatCurrency(totalExpenses)}</p>
              <p style={{ fontSize: '0.85rem', margin: '0.25rem 0', opacity: 0.8 }}>Pagados: {formatCurrency(paidExpenses)}</p>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <h4>DIFERENCIA NETA</h4>
              <p style={{ fontSize: '1.4rem', fontWeight: 'bold', margin: '0.5rem 0', color: 'white' }}>{formatCurrency(totalIncome - totalExpenses)}</p>
            </div>
          </div>

          {/* Ingresos */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0 }}>💰 Ingresos</h3>
                <button
                  onClick={handleMarkAllIncomesPaid}
                  style={{
                    padding: '0.25rem 0.5rem',
                    background: '#84fab0',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  Marcar todos
                </button>
              </div>
              <button
                onClick={() => setShowIncomeForm(!showIncomeForm)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#84fab0',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                }}
              >
                {showIncomeForm ? 'Cancelar' : '+ Agregar Ingreso'}
              </button>
            </div>

            {showIncomeForm && (
              <form onSubmit={handleAddIncome} style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Concepto (ej: Alquiler, Extra)</label>
                  <input
                    type="text"
                    value={incomeFormData.concept}
                    onChange={(e) => setIncomeFormData({ ...incomeFormData, concept: e.target.value })}
                    placeholder="Alquiler, Extra, etc."
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Cantidad</label>
                  <input
                    type="number"
                    step="0.01"
                    value={incomeFormData.amount}
                    onChange={(e) => setIncomeFormData({ ...incomeFormData, amount: e.target.value })}
                    placeholder="0.00"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={incomeFormData.paid}
                      onChange={(e) => setIncomeFormData({ ...incomeFormData, paid: e.target.checked })}
                      style={{ marginRight: '0.5rem' }}
                    />
                    ✓ Pagado
                  </label>
                </div>
                <button type="submit" style={{ padding: '0.5rem 1rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Guardar Ingreso
                </button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {currentMonthIncomes.length === 0 ? (
                <p style={{ color: '#999', fontStyle: 'italic' }}>Sin ingresos registrados</p>
              ) : (
                currentMonthIncomes.map((income) => (
                  <div key={income.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: income.paid ? '#f0f8f4' : '#fff8f0', border: `1px solid ${income.paid ? '#84fab0' : '#ffb366'}`, borderRadius: '4px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input type="checkbox" checked={income.paid} onChange={() => handleToggleIncomePaid(income)} style={{ marginRight: '0.5rem' }} />
                        <span style={{ textDecoration: income.paid ? 'line-through' : 'none', color: income.paid ? '#999' : '#333' }}>{income.concept}</span>
                      </label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <strong style={{ minWidth: '100px', textAlign: 'right' }}>{formatCurrency(income.amount)}</strong>
                      <button
                        onClick={() => handleDeleteIncome(income.id)}
                        style={{ padding: '0.25rem 0.5rem', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Gastos */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ margin: 0 }}>💸 Gastos</h3>
                <button
                  onClick={handleMarkAllExpensesPaid}
                  style={{
                    padding: '0.25rem 0.5rem',
                    background: '#fa709a',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                  }}
                >
                  Marcar todos
                </button>
              </div>
              <button
                onClick={() => setShowExpenseForm(!showExpenseForm)}
                style={{ padding: '0.5rem 1rem', background: '#fa709a', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
              >
                {showExpenseForm ? 'Cancelar' : '+ Agregar Gasto'}
              </button>
            </div>

            {showExpenseForm && (
              <form onSubmit={handleAddExpense} style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Concepto (ej: Comunidad, IBI, Basura, Hipoteca, Derrama)</label>
                  <input
                    type="text"
                    value={expenseFormData.concept}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, concept: e.target.value })}
                    placeholder="Comunidad, IBI, Basura, Hipoteca, Derrama, etc."
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Cantidad</label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseFormData.amount}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                    placeholder="0.00"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={expenseFormData.paid}
                      onChange={(e) => setExpenseFormData({ ...expenseFormData, paid: e.target.checked })}
                      style={{ marginRight: '0.5rem' }}
                    />
                    ✓ Pagado
                  </label>
                </div>
                <button type="submit" style={{ padding: '0.5rem 1rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Guardar Gasto
                </button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {currentMonthExpenses.length === 0 ? (
                <p style={{ color: '#999', fontStyle: 'italic' }}>Sin gastos registrados</p>
              ) : (
                currentMonthExpenses.map((expense) => (
                  <div key={expense.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: expense.paid ? '#f0f4f8' : '#fff8f0', border: `1px solid ${expense.paid ? '#8fd3f4' : '#ffb366'}`, borderRadius: '4px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input type="checkbox" checked={expense.paid} onChange={() => handleToggleExpensePaid(expense)} style={{ marginRight: '0.5rem' }} />
                        <span style={{ textDecoration: expense.paid ? 'line-through' : 'none', color: expense.paid ? '#999' : '#333' }}>{expense.concept}</span>
                      </label>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <strong style={{ minWidth: '100px', textAlign: 'right' }}>{formatCurrency(expense.amount)}</strong>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        style={{ padding: '0.25rem 0.5rem', background: '#ff6b6b', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {viewMode === 'annual' && (
        <div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>Año:</label>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', fontSize: '1rem', width: '100px' }}
            />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>Mes</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>Ingresos</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>Pagados</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>Gastos</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>Pagados</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>Neto</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((monthStr, idx) => {
                  const monthKey = `${selectedYear}-${monthStr}`;
                  const mInc = monthlyIncomes.filter(i => i.yearMonth === monthKey);
                  const mExp = monthlyExpenses.filter(e => e.yearMonth === monthKey);
                  const tInc = mInc.reduce((sum: number, i: PropertyMonthlyIncome) => sum + i.amount, 0);
                  const tExp = mExp.reduce((sum: number, e: PropertyMonthlyExpense) => sum + e.amount, 0);
                  const pInc = mInc.filter(i => i.paid).reduce((sum: number, i: PropertyMonthlyIncome) => sum + i.amount, 0);
                  const pExp = mExp.filter(e => e.paid).reduce((sum: number, e: PropertyMonthlyExpense) => sum + e.amount, 0);

                  return (
                    <tr key={monthStr} style={{ borderBottom: '1px solid #eee', background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{months[idx]}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: tInc > 0 ? '#27ae60' : '#999' }}>{formatCurrency(tInc)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: pInc > 0 ? '#27ae60' : '#999' }}>{formatCurrency(pInc)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: tExp > 0 ? '#e74c3c' : '#999' }}>{formatCurrency(tExp)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', color: pExp > 0 ? '#e74c3c' : '#999' }}>{formatCurrency(pExp)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: tInc - tExp >= 0 ? '#27ae60' : '#e74c3c' }}>{formatCurrency(tInc - tExp)}</td>
                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setYearMonth(monthKey);
                            setViewMode('monthly');
                          }}
                          style={{ padding: '0.25rem 0.75rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f5f5f5', borderTop: '2px solid #ddd', fontWeight: 'bold' }}>
                  <td style={{ padding: '0.75rem' }}>TOTAL</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: '#27ae60' }}>
                    {formatCurrency(monthlyIncomes.filter((i: PropertyMonthlyIncome) => i.yearMonth.startsWith(`${selectedYear}-`)).reduce((sum: number, i: PropertyMonthlyIncome) => sum + i.amount, 0))}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: '#27ae60' }}>
                    {formatCurrency(monthlyIncomes.filter((i: PropertyMonthlyIncome) => i.yearMonth.startsWith(`${selectedYear}-`) && i.paid).reduce((sum: number, i: PropertyMonthlyIncome) => sum + i.amount, 0))}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: '#e74c3c' }}>
                    {formatCurrency(monthlyExpenses.filter((e: PropertyMonthlyExpense) => e.yearMonth.startsWith(`${selectedYear}-`)).reduce((sum: number, e: PropertyMonthlyExpense) => sum + e.amount, 0))}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: '#e74c3c' }}>
                    {formatCurrency(monthlyExpenses.filter((e: PropertyMonthlyExpense) => e.yearMonth.startsWith(`${selectedYear}-`) && e.paid).reduce((sum: number, e: PropertyMonthlyExpense) => sum + e.amount, 0))}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', color: (monthlyIncomes.filter((i: PropertyMonthlyIncome) => i.yearMonth.startsWith(`${selectedYear}-`)).reduce((sum: number, i: PropertyMonthlyIncome) => sum + i.amount, 0) - monthlyExpenses.filter((e: PropertyMonthlyExpense) => e.yearMonth.startsWith(`${selectedYear}-`)).reduce((sum: number, e: PropertyMonthlyExpense) => sum + e.amount, 0)) >= 0 ? '#27ae60' : '#e74c3c' }}>
                    {formatCurrency(monthlyIncomes.filter((i: PropertyMonthlyIncome) => i.yearMonth.startsWith(`${selectedYear}-`)).reduce((sum: number, i: PropertyMonthlyIncome) => sum + i.amount, 0) - monthlyExpenses.filter((e: PropertyMonthlyExpense) => e.yearMonth.startsWith(`${selectedYear}-`)).reduce((sum: number, e: PropertyMonthlyExpense) => sum + e.amount, 0))}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
