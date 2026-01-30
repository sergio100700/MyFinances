import React, { useEffect, useState } from 'react';
import { addBudget, loadData, deleteBudget, updateBudget } from '../../lib/storage';
import { getCurrencySymbol, formatCurrency } from '../../lib/format';
import { BudgetCategory, FinanceData } from '../../types';

interface BudgetFormProps {
  onSuccess?: () => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ onSuccess }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [data, setData] = useState<FinanceData>({
    transactions: [],
    investments: [],
    properties: [],
    budgets: [],
  });
  const [editBudgetData, setEditBudgetData] = useState({
    category: 'Alimentación',
    budgeted: 0,
  });
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentYear = new Date().getFullYear().toString();
  const [formData, setFormData] = useState({
    category: 'Alimentación',
    budgeted: 0,
    period: 'monthly' as 'monthly' | 'annual',
    month: currentMonth,
    year: currentYear,
    isRecurring: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await loadData();
        setData(result);
      } catch (error) {
        console.error('Error cargando datos:', error);
      }
    };

    fetchData();
  }, [refreshKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const periodKey = formData.period === 'monthly' ? formData.month : formData.year;
    
    try {
      if (formData.isRecurring && formData.period === 'monthly') {
        // Si es recurrente y mensual, crear presupuestos para todos los meses del año
        const [year] = formData.month.split('-');
        const startMonth = parseInt(formData.month.split('-')[1]);
        
        for (let month = startMonth; month <= 12; month++) {
          const monthStr = month.toString().padStart(2, '0');
          const monthKey = `${year}-${monthStr}`;
          
          await addBudget({
            category: formData.category,
            budgeted: formData.budgeted,
            period: 'monthly',
            periodKey: monthKey,
            month: monthKey,
            isRecurring: true,
            startDate: formData.month,
          });
        }
      } else {
        // Para presupuestos no recurrentes o anuales
        await addBudget({
          category: formData.category,
          budgeted: formData.budgeted,
          period: formData.period,
          periodKey,
          month: formData.period === 'monthly' ? formData.month : undefined,
          isRecurring: formData.period === 'annual' && formData.isRecurring ? true : false,
          startDate: formData.period === 'annual' && formData.isRecurring ? `${formData.year}-01` : undefined,
        });
      }
    } catch (error) {
      console.error('Error guardando presupuesto:', error);
      return;
    }
    
    setFormData({
      category: 'Alimentación',
      budgeted: 0,
      period: 'monthly',
      month: currentMonth,
      year: currentYear,
      isRecurring: false,
    });
    setShowForm(false);
    setRefreshKey(prev => prev + 1);
    onSuccess?.();
  };
  const getBudgetPeriod = (budget: BudgetCategory) => budget.period ?? 'monthly';
  const getBudgetKey = (budget: BudgetCategory) => budget.periodKey ?? budget.month ?? '';

  const thisMonthBudgets = data.budgets.filter(
    b => getBudgetPeriod(b) === 'monthly' && getBudgetKey(b) === currentMonth
  );
  const thisYearBudgets = data.budgets.filter(
    b => getBudgetPeriod(b) === 'annual' && getBudgetKey(b) === currentYear
  );

  // Presupuestos mensuales recurrentes del año actual
  const recurringMonthlyBudgets = data.budgets.filter(
    b => getBudgetPeriod(b) === 'monthly' && b.isRecurring && getBudgetKey(b).startsWith(currentYear)
  );

  // Agrupar presupuestos recurrentes por categoría y calcular suma anual
  const recurringBudgetsByCategory = recurringMonthlyBudgets.reduce((acc, budget) => {
    const existing = acc.find(b => b.category === budget.category);
    if (existing) {
      existing.monthlyAmount = budget.budgeted;
      existing.annualAmount = budget.budgeted * 12;
    } else {
      acc.push({
        category: budget.category,
        monthlyAmount: budget.budgeted,
        annualAmount: budget.budgeted * 12,
        startDate: budget.startDate,
      });
    }
    return acc;
  }, [] as Array<{ category: string; monthlyAmount: number; annualAmount: number; startDate?: string }>);

  const thisMonthBudgetTotal = thisMonthBudgets.reduce((sum, b) => sum + b.budgeted, 0);
  const thisYearBudgetTotal = thisYearBudgets.reduce((sum, b) => sum + b.budgeted, 0);
  const recurringBudgetAnnualTotal = recurringBudgetsByCategory.reduce((sum, b) => sum + b.annualAmount, 0);

  const startEdit = (budget: BudgetCategory) => {
    setEditingBudgetId(budget.id);
    setEditBudgetData({
      category: budget.category,
      budgeted: budget.budgeted,
    });
  };

  const cancelEdit = () => {
    setEditingBudgetId(null);
  };

  const saveEdit = async (id: string) => {
    try {
      await updateBudget(id, {
        category: editBudgetData.category,
        budgeted: editBudgetData.budgeted,
      });
      setEditingBudgetId(null);
      setRefreshKey(prev => prev + 1);
      onSuccess?.();
    } catch (error) {
      console.error('Error actualizando presupuesto:', error);
    }
  };

  return (
    <div>
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: '0.75rem 1.5rem',
          background: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginBottom: '1rem',
        }}
      >
        {showForm ? '✕ Cancelar' : '+ Agregar Presupuesto'}
      </button>

      {showForm && (
        <div className="card" style={{ background: '#f9f9f9', marginBottom: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Periodicidad
                  <span
                    title="Puedes crear presupuestos mensuales o anuales."
                    style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                  >
                    ⓘ
                  </span>
                </label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value as 'monthly' | 'annual' })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                  }}
                >
                  <option value="monthly">Mensual</option>
                  <option value="annual">Anual</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Categoría
                  <span
                    title="Área del gasto para organizar tu presupuesto."
                    style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                  >
                    ⓘ
                  </span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                  }}
                >
                  <option>Alimentación</option>
                  <option>Vivienda</option>
                  <option>Transporte</option>
                  <option>Entretenimiento</option>
                  <option>Servicios</option>
                  <option>Salud</option>
                  <option>Educación</option>
                  <option>Ahorros</option>
                  <option>Otro</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Presupuesto ({getCurrencySymbol()})
                  <span
                    title="Límite de gasto planificado para el mes."
                    style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                  >
                    ⓘ
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.budgeted}
                  onChange={(e) => setFormData({ ...formData, budgeted: parseFloat(e.target.value) })}
                  required
                  step="100"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              {formData.period === 'monthly' ? (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Mes
                  </label>
                  <input
                    type="month"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Año
                  </label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    required
                    min="2000"
                    max="2100"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>
              )}
              {formData.period === 'monthly' && (
                <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '0.75rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                      style={{
                        marginRight: '0.5rem',
                        cursor: 'pointer',
                        width: '1.2rem',
                        height: '1.2rem',
                      }}
                    />
                    Recurrente
                    <span
                      title="Si está marcado, este presupuesto se repetirá en todos los meses del año seleccionado a partir del mes especificado."
                      style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                    >
                      ⓘ
                    </span>
                  </label>
                </div>
              )}
            </div>

            {formData.isRecurring && formData.period === 'monthly' && (
              <div style={{ padding: '0.75rem', background: '#e3f2fd', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.85rem', color: '#1565c0' }}>
                ✓ Se creará en todos los meses desde <strong>{new Date(formData.month + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</strong> hasta el final del año
              </div>
            )}

            <button
              type="submit"
              style={{
                padding: '0.75rem 2rem',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem',
              }}
            >
              Guardar Presupuesto
            </button>
          </form>
        </div>
      )}

      {thisMonthBudgets.length > 0 && (
        <div className="card">
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Presupuesto de {currentMonth}</h3>
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', color: 'white' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'white' }}>TOTAL PRESUPUESTO</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{formatCurrency(thisMonthBudgetTotal)}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {thisMonthBudgets.map((budget) => (
              <div key={budget.id} className="card" style={{ background: '#f9f9f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  {editingBudgetId === budget.id ? (
                    <select
                      value={editBudgetData.category}
                      onChange={(e) => setEditBudgetData({ ...editBudgetData, category: e.target.value })}
                      style={{
                        padding: '0.4rem 0.6rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontFamily: 'inherit',
                      }}
                    >
                      <option>Alimentación</option>
                      <option>Vivienda</option>
                      <option>Transporte</option>
                      <option>Entretenimiento</option>
                      <option>Servicios</option>
                      <option>Salud</option>
                      <option>Educación</option>
                      <option>Ahorros</option>
                      <option>Otro</option>
                    </select>
                  ) : (
                    <div>
                      <h4 style={{ margin: 0 }}>{budget.category}</h4>
                      {budget.isRecurring && (
                        <span style={{ fontSize: '0.75rem', color: '#667eea', fontWeight: 'bold', marginTop: '0.25rem', display: 'inline-block' }}>🔄 Recurrente</span>
                      )}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {editingBudgetId === budget.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(budget.id)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            background: '#27ae60',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{
                            padding: '0.4rem 0.8rem',
                            background: '#95a5a6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(budget)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          ✎
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await deleteBudget(budget.id);
                              setRefreshKey(prev => prev + 1);
                              onSuccess?.();
                            } catch (error) {
                              console.error('Error eliminando presupuesto:', error);
                            }
                          }}
                          style={{
                            padding: '0.4rem 0.8rem',
                            background: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          🗑
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {editingBudgetId === budget.id ? (
                  <input
                    type="number"
                    value={editBudgetData.budgeted}
                    onChange={(e) => setEditBudgetData({ ...editBudgetData, budgeted: parseFloat(e.target.value) })}
                    step="100"
                    style={{
                      width: '100%',
                      padding: '0.6rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontFamily: 'inherit',
                    }}
                  />
                ) : (
                  <p style={{ margin: '0.5rem 0 0 0', fontWeight: 'bold', color: '#667eea', fontSize: '1.3rem' }}>
                    ${budget.budgeted.toLocaleString('es-ES')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {thisYearBudgets.length > 0 && (
        <div className="card" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Presupuesto anual {currentYear}</h3>
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '8px', color: 'white' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'white' }}>TOTAL PRESUPUESTO ANUAL</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{formatCurrency(thisYearBudgetTotal)}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {thisYearBudgets.map((budget) => (
              <div key={budget.id} className="card" style={{ background: '#f9f9f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  {editingBudgetId === budget.id ? (
                    <select
                      value={editBudgetData.category}
                      onChange={(e) => setEditBudgetData({ ...editBudgetData, category: e.target.value })}
                      style={{
                        padding: '0.4rem 0.6rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontFamily: 'inherit',
                      }}
                    >
                      <option>Alimentación</option>
                      <option>Vivienda</option>
                      <option>Transporte</option>
                      <option>Entretenimiento</option>
                      <option>Servicios</option>
                      <option>Salud</option>
                      <option>Educación</option>
                      <option>Ahorros</option>
                      <option>Otro</option>
                    </select>
                  ) : (
                    <div>
                      <h4 style={{ margin: 0 }}>{budget.category}</h4>
                      {budget.isRecurring && (
                        <span style={{ fontSize: '0.75rem', color: '#667eea', fontWeight: 'bold', marginTop: '0.25rem', display: 'inline-block' }}>🔄 Recurrente</span>
                      )}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {editingBudgetId === budget.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(budget.id)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            background: '#27ae60',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{
                            padding: '0.4rem 0.8rem',
                            background: '#95a5a6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(budget)}
                          style={{
                            padding: '0.4rem 0.8rem',
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          ✎
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('¿Eliminar este presupuesto?')) {
                              try {
                                await deleteBudget(budget.id);
                                setRefreshKey(prev => prev + 1);
                                onSuccess?.();
                              } catch (error) {
                                console.error('Error eliminando presupuesto:', error);
                              }
                            }
                          }}
                          style={{
                            padding: '0.4rem 0.8rem',
                            background: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          🗑
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {editingBudgetId === budget.id ? (
                  <input
                    type="number"
                    value={editBudgetData.budgeted}
                    onChange={(e) => setEditBudgetData({ ...editBudgetData, budgeted: parseFloat(e.target.value) })}
                    step="100"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                    }}
                  />
                ) : (
                  <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>{formatCurrency(budget.budgeted)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {recurringBudgetsByCategory.length > 0 && (
        <div className="card" style={{ marginTop: '2rem', borderLeft: '4px solid #667eea' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>📅 Presupuestos Recurrentes Mensuales - Proyección Anual {currentYear}</h3>
          <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Estos presupuestos mensuales se repiten cada mes y su suma proyectada para el año es:
          </p>
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', color: 'white' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'white' }}>PROYECCIÓN ANUAL (12 MESES)</p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.8rem', fontWeight: 'bold', color: 'white' }}>{formatCurrency(recurringBudgetAnnualTotal)}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            {recurringBudgetsByCategory.map((budget, index) => (
              <div key={index} className="card" style={{ background: '#f9f9f9' }}>
                <h4 style={{ margin: '0 0 1rem 0' }}>{budget.category}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>Mensual</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold', color: '#667eea', fontSize: '1.1rem' }}>
                      {formatCurrency(budget.monthlyAmount)}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>Proyección Anual</p>
                    <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold', color: '#27ae60', fontSize: '1.1rem' }}>
                      {formatCurrency(budget.annualAmount)}
                    </p>
                  </div>
                </div>
                {budget.startDate && (
                  <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.8rem', color: '#999' }}>
                    Desde: {new Date(budget.startDate + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fff3cd', borderRadius: '6px', borderLeft: '4px solid #ffc107' }}>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#856404' }}>
              <strong>💡 Nota:</strong> Esta es una proyección anual. Los presupuestos recurrentes mensuales también aparecen en la vista mensual y pueden editarse individualmente.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
