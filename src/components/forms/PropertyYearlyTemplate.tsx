import React, { useState, useEffect } from 'react';
import { Property, PropertyYearlyTemplate, PropertyTemplateIncome, PropertyTemplateExpense } from '../../types';
import { 
  loadPropertyYearlyTemplate, 
  savePropertyYearlyTemplate, 
  applyYearlyTemplateToPeriod,
} from '../../lib/storage';
import { formatCurrency } from '../../lib/format';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface PropertyYearlyTemplateProps {
  property: Property;
  year: number;
  onSuccess?: () => void;
  onAfterApply?: () => void;
}

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const PropertyYearlyTemplateComponent: React.FC<PropertyYearlyTemplateProps> = ({
  property,
  year,
  onSuccess,
  onAfterApply,
}) => {
  const [template, setTemplate] = useState<PropertyYearlyTemplate | null>(null);
  const [showTemplate, setShowTemplate] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const [incomeFormData, setIncomeFormData] = useState({
    concept: '',
    amount: '',
    repeatingMonths: Array(12).fill(false),
  });

  const [expenseFormData, setExpenseFormData] = useState({
    concept: '',
    amount: '',
    repeatingMonths: Array(12).fill(false),
  });

  const [applyPeriod, setApplyPeriod] = useState({ start: 1, end: 12, year });

  const loadTemplate = async () => {
    try {
      const loaded = await loadPropertyYearlyTemplate(property.id, year);
      setTemplate(loaded || {
        id: generateId(),
        propertyId: property.id,
        year,
        incomes: [],
        expenses: [],
      } as PropertyYearlyTemplate);
    } catch (error) {
      console.error('Error loading template:', error);
    }
  };

  useEffect(() => {
    loadTemplate();
  }, [property.id, year]);

  const handleAddIncomeTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeFormData.concept.trim() || !incomeFormData.amount) return;

    if (!template) return;

    const selectedMonths = incomeFormData.repeatingMonths
      .map((checked, idx) => (checked ? idx + 1 : null))
      .filter((m) => m !== null) as number[];

    if (selectedMonths.length === 0) {
      alert('Selecciona al menos un mes');
      return;
    }

    const newIncome: PropertyTemplateIncome = {
      id: generateId(),
      concept: incomeFormData.concept,
      amount: Number(incomeFormData.amount),
      repeatingMonths: selectedMonths,
    };

    const updated = {
      ...template,
      incomes: [...template.incomes, newIncome],
    };

    try {
      await savePropertyYearlyTemplate(updated);
      setTemplate(updated);
      setIncomeFormData({
        concept: '',
        amount: '',
        repeatingMonths: Array(12).fill(false),
      });
      setShowIncomeForm(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error adding income template:', error);
    }
  };

  const handleAddExpenseTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseFormData.concept.trim() || !expenseFormData.amount) return;

    if (!template) return;

    const selectedMonths = expenseFormData.repeatingMonths
      .map((checked, idx) => (checked ? idx + 1 : null))
      .filter((m) => m !== null) as number[];

    if (selectedMonths.length === 0) {
      alert('Selecciona al menos un mes');
      return;
    }

    const newExpense: PropertyTemplateExpense = {
      id: generateId(),
      concept: expenseFormData.concept,
      amount: Number(expenseFormData.amount),
      repeatingMonths: selectedMonths,
    };

    const updated = {
      ...template,
      expenses: [...template.expenses, newExpense],
    };

    try {
      await savePropertyYearlyTemplate(updated);
      setTemplate(updated);
      setExpenseFormData({
        concept: '',
        amount: '',
        repeatingMonths: Array(12).fill(false),
      });
      setShowExpenseForm(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error adding expense template:', error);
    }
  };

  const handleDeleteIncome = async (incomeId: string) => {
    if (!template || !confirm('¿Eliminar este ingreso de la plantilla?')) return;

    const updated = {
      ...template,
      incomes: template.incomes.filter((i) => i.id !== incomeId),
    };

    try {
      await savePropertyYearlyTemplate(updated);
      setTemplate(updated);
      onSuccess?.();
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!template || !confirm('¿Eliminar este gasto de la plantilla?')) return;

    const updated = {
      ...template,
      expenses: template.expenses.filter((e) => e.id !== expenseId),
    };

    try {
      await savePropertyYearlyTemplate(updated);
      setTemplate(updated);
      onSuccess?.();
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleApplyTemplate = async () => {
    if (!template) return;

    const confirmed = confirm(
      `¿Aplicar plantilla a ${months[applyPeriod.start - 1]} - ${months[applyPeriod.end - 1]} de ${applyPeriod.year}?\n\nSe crearán los registros correspondientes.`
    );

    if (!confirmed) return;

    try {
      await applyYearlyTemplateToPeriod(
        property.id,
        template,
        applyPeriod.start,
        applyPeriod.end,
        applyPeriod.year
      );
      alert('Plantilla aplicada correctamente');
      onAfterApply?.();
      onSuccess?.();
    } catch (error) {
      console.error('Error applying template:', error);
      alert('Error al aplicar plantilla');
    }
  };

  if (!template) return <div>Cargando plantilla...</div>;

  return (
    <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
      <details
        open={showTemplate}
        onToggle={(e) => setShowTemplate((e.currentTarget as HTMLDetailsElement).open)}
        style={{
          background: '#f5f5f5',
          borderRadius: '6px',
          border: '1px solid #e0e0e0',
          padding: '0.5rem 0.75rem',
        }}
      >
        <summary
          style={{
            listStyle: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
            padding: '0.5rem 0.25rem',
            fontWeight: 700,
            color: '#333',
          }}
        >
          <span>📋 Plantilla Anual {year} - {property.name}</span>
          <span style={{ fontSize: '0.9rem', color: '#667eea' }}>{showTemplate ? '▾' : '▸'}</span>
        </summary>

        <div style={{ background: '#f5f5f5', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
          {/* Sección de Ingresos */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>💰 Ingresos Recurrentes</h3>
              <button
                onClick={() => setShowIncomeForm(!showIncomeForm)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#84fab0',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                {showIncomeForm ? 'Cancelar' : '+ Agregar'}
              </button>
            </div>

            {showIncomeForm && (
              <form
                onSubmit={handleAddIncomeTemplate}
                style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                  border: '1px solid #ddd',
                }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                    Concepto
                  </label>
                  <input
                    type="text"
                    value={incomeFormData.concept}
                    onChange={(e) => setIncomeFormData({ ...incomeFormData, concept: e.target.value })}
                    placeholder="Alquiler, Extra, etc."
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                    Cantidad
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={incomeFormData.amount}
                    onChange={(e) => setIncomeFormData({ ...incomeFormData, amount: e.target.value })}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Meses en los que se repite:
                  </label>
                  <button
                    type="button"
                    onClick={() => setIncomeFormData({
                      ...incomeFormData,
                      repeatingMonths: Array(12).fill(true)
                    })}
                    style={{
                      marginBottom: '0.5rem',
                      padding: '0.25rem 0.75rem',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Seleccionar todos
                  </button>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {months.map((monthName, idx) => (
                      <label key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={incomeFormData.repeatingMonths[idx]}
                          onChange={(e) => {
                            const updated = [...incomeFormData.repeatingMonths];
                            updated[idx] = e.target.checked;
                            setIncomeFormData({ ...incomeFormData, repeatingMonths: updated });
                          }}
                          style={{ marginRight: '0.5rem' }}
                        />
                        {monthName.slice(0, 3)}
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Guardar Ingreso
                </button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {template.incomes.length === 0 ? (
                <p style={{ color: '#999', fontStyle: 'italic' }}>Sin ingresos en la plantilla</p>
              ) : (
                template.incomes.map((income) => (
                  <div
                    key={income.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: 'white',
                      border: '1px solid #84fab0',
                      borderRadius: '4px',
                    }}
                  >
                    <div>
                      <strong>{income.concept}</strong>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                        {income.repeatingMonths.map((m) => months[m - 1].slice(0, 3)).join(', ')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <strong>{formatCurrency(income.amount)}</strong>
                      <button
                        onClick={() => handleDeleteIncome(income.id)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#ff6b6b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sección de Gastos */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>💸 Gastos Recurrentes</h3>
              <button
                onClick={() => setShowExpenseForm(!showExpenseForm)}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#fa709a',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                {showExpenseForm ? 'Cancelar' : '+ Agregar'}
              </button>
            </div>

            {showExpenseForm && (
              <form
                onSubmit={handleAddExpenseTemplate}
                style={{
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '4px',
                  marginBottom: '1rem',
                  border: '1px solid #ddd',
                }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                    Concepto
                  </label>
                  <input
                    type="text"
                    value={expenseFormData.concept}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, concept: e.target.value })}
                    placeholder="Hipoteca, Comunidad, IBI, Basura, etc."
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>
                    Cantidad
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseFormData.amount}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                    placeholder="0.00"
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Meses en los que se repite:
                  </label>
                  <button
                    type="button"
                    onClick={() => setExpenseFormData({
                      ...expenseFormData,
                      repeatingMonths: Array(12).fill(true)
                    })}
                    style={{
                      marginBottom: '0.5rem',
                      padding: '0.25rem 0.75rem',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                    }}
                  >
                    Seleccionar todos
                  </button>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    {months.map((monthName, idx) => (
                      <label key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                          type="checkbox"
                          checked={expenseFormData.repeatingMonths[idx]}
                          onChange={(e) => {
                            const updated = [...expenseFormData.repeatingMonths];
                            updated[idx] = e.target.checked;
                            setExpenseFormData({ ...expenseFormData, repeatingMonths: updated });
                          }}
                          style={{ marginRight: '0.5rem' }}
                        />
                        {monthName.slice(0, 3)}
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Guardar Gasto
                </button>
              </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {template.expenses.length === 0 ? (
                <p style={{ color: '#999', fontStyle: 'italic' }}>Sin gastos en la plantilla</p>
              ) : (
                template.expenses.map((expense) => (
                  <div
                    key={expense.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      background: 'white',
                      border: '1px solid #fa709a',
                      borderRadius: '4px',
                    }}
                  >
                    <div>
                      <strong>{expense.concept}</strong>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#666' }}>
                        {expense.repeatingMonths.map((m) => months[m - 1].slice(0, 3)).join(', ')}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <strong>{formatCurrency(expense.amount)}</strong>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: '#ff6b6b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Aplicar Plantilla */}
          {(template.incomes.length > 0 || template.expenses.length > 0) && (
            <div style={{
              background: 'white',
              padding: '1rem',
              borderRadius: '4px',
              border: '2px solid #667eea',
            }}>
              <h3>📤 Aplicar Plantilla a Meses</h3>
              <p style={{ marginTop: 0, color: '#666', fontSize: '0.9rem' }}>
                Selecciona el período para crear automáticamente todos los registros mensuales
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    Desde:
                  </label>
                  <select
                    value={applyPeriod.start}
                    onChange={(e) => setApplyPeriod({ ...applyPeriod, start: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                    }}
                  >
                    {months.map((m, idx) => (
                      <option key={idx} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    Hasta:
                  </label>
                  <select
                    value={applyPeriod.end}
                    onChange={(e) => setApplyPeriod({ ...applyPeriod, end: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                    }}
                  >
                    {months.map((m, idx) => (
                      <option key={idx} value={idx + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    Año:
                  </label>
                  <input
                    type="number"
                    value={applyPeriod.year}
                    onChange={(e) => setApplyPeriod({ ...applyPeriod, year: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #ccc',
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleApplyTemplate}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                }}
              >
                ✨ Aplicar Plantilla
              </button>
            </div>
          )}
        </div>
      </details>
    </div>
  );
};
