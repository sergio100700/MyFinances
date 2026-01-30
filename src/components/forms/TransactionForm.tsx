import React, { useState } from 'react';
import { addTransaction, loadData, deleteTransaction } from '../../lib/storage';
import { getCurrencySymbol } from '../../lib/format';
import { Transaction } from '../../types';

interface TransactionFormProps {
  onSuccess?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onSuccess }) => {
  const [showForm, setShowForm] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Alimentación',
    description: '',
    amount: 0,
    type: 'expense' as Transaction['type'],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTransaction(formData);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: 'Alimentación',
      description: '',
      amount: 0,
      type: 'expense',
    });
    setShowForm(false);
    onSuccess?.();
  };

  React.useEffect(() => {
    const fetchData = async () => {
      const data = await loadData();
      setTransactions(data.transactions);
    };
    fetchData();
  }, [onSuccess]);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));

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
        {showForm ? '✕ Cancelar' : '+ Agregar Transacción'}
      </button>

      {showForm && (
        <div className="card" style={{ background: '#f9f9f9', marginBottom: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Fecha
                  <span
                    title="Fecha en la que ocurrió la transacción."
                    style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                  >
                    ⓘ
                  </span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Tipo
                  <span
                    title="Selecciona si es ingreso o gasto."
                    style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                  >
                    ⓘ
                  </span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Transaction['type'] })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                  }}
                >
                  <option value="expense">Gasto</option>
                  <option value="income">Ingreso</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Categoría
                  <span
                    title="Clasificación para reportes y presupuesto."
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
                  <option>Otro</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Monto ({getCurrencySymbol()})
                  <span
                    title="Importe total de la transacción."
                    style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                  >
                    ⓘ
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  required
                  step="0.01"
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

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Descripción (opcional)
                <span
                  title="Nota breve para recordar el motivo."
                  style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                >
                  ⓘ
                </span>
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                }}
              />
            </div>

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
              Guardar Transacción
            </button>
          </form>
        </div>
      )}

      {thisMonthTransactions.length > 0 && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Transacciones de Este Mes</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {thisMonthTransactions.map((trans) => (
              <div
                key={trans.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem',
                  borderBottom: '1px solid #eee',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{trans.category}</p>
                  <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                    {trans.description || trans.date}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span
                    style={{
                      fontWeight: 'bold',
                      color: trans.type === 'income' ? '#27ae60' : '#e74c3c',
                    }}
                  >
                    {trans.type === 'income' ? '+' : '-'}${trans.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => {
                      deleteTransaction(trans.id);
                      onSuccess?.();
                    }}
                    style={{
                      padding: '0.4rem 0.8rem',
                      background: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
