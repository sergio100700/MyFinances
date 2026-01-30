import React, { useState } from 'react';
import { Investment, Contribution } from '../../types';
import { formatCurrency, getCurrencySymbol } from '../../lib/format';
import { addContribution, deleteContribution } from '../../lib/storage';

interface ContributionManagerProps {
  investment: Investment;
  onClose: () => void;
  onUpdate: () => void;
}

export const ContributionManager: React.FC<ContributionManagerProps> = ({
  investment,
  onClose,
  onUpdate,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    shares: 0,
    pricePerShare: 0,
  });

  const contributions = investment.contributions || [];

  const handleAddContribution = async () => {
    if (formData.amount <= 0 || formData.shares <= 0 || formData.pricePerShare <= 0) {
      alert('Por favor completa todos los campos con valores mayores a 0');
      return;
    }

    try {
      await addContribution(investment.id, {
        date: formData.date,
        amount: formData.amount,
        shares: formData.shares,
        pricePerShare: formData.pricePerShare,
      });
      
      setFormData({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        shares: 0,
        pricePerShare: 0,
      });
      setShowForm(false);
      onUpdate();
    } catch (error) {
      console.error('Error adding contribution:', error);
      alert('Error al añadir aportación');
    }
  };

  const handleDeleteContribution = async (id: string) => {
    if (!confirm('¿Eliminar esta aportación?')) return;

    try {
      await deleteContribution(id);
      onUpdate();
    } catch (error) {
      console.error('Error deleting contribution:', error);
      alert('Error al eliminar aportación');
    }
  };

  const totalContributed = contributions.reduce((sum, c) => sum + c.amount, 0);
  const totalShares = contributions.reduce((sum, c) => sum + c.shares, 0);
  const gainLoss = investment.currentValue - totalContributed;
  const gainLossPercent = totalContributed > 0 ? ((gainLoss / totalContributed) * 100).toFixed(2) : '0.00';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '90%',
          maxWidth: '700px',
          background: 'white',
          padding: '2rem',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>📊 Aportaciones - {investment.name}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#666',
            }}
          >
            ✕
          </button>
        </div>

        {/* Resumen */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            padding: '1rem',
            background: '#f0f4ff',
            borderRadius: '6px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.3rem' }}>Total Aportado</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#667eea' }}>
              {getCurrencySymbol()}{totalContributed.toFixed(2)}
            </div>
          </div>
          <div style={{
            padding: '1rem',
            background: '#f0f4ff',
            borderRadius: '6px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.3rem' }}>Valor Actual</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#667eea' }}>
              {getCurrencySymbol()}{investment.currentValue.toFixed(2)}
            </div>
          </div>
          <div style={{
            padding: '1rem',
            background: gainLoss >= 0 ? '#e8f5e9' : '#ffebee',
            borderRadius: '6px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.3rem' }}>Ganancia/Pérdida</div>
            <div style={{
              fontSize: '1.3rem',
              fontWeight: 'bold',
              color: gainLoss >= 0 ? '#2e7d32' : '#d32f2f',
            }}>
              {gainLoss >= 0 ? '+' : ''}{getCurrencySymbol()}{gainLoss.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.85rem', color: gainLoss >= 0 ? '#2e7d32' : '#d32f2f' }}>
              ({gainLoss >= 0 ? '+' : ''}{gainLossPercent}%)
            </div>
          </div>
        </div>

        {/* Lista de Aportaciones */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>📝 Historial de Aportaciones ({contributions.length})</h3>
          
          {contributions.length === 0 ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              background: '#f9f9f9',
              borderRadius: '6px',
              color: '#999',
            }}>
              No hay aportaciones registradas
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '0.75rem',
            }}>
              {contributions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((contrib) => (
                <div
                  key={contrib.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 1fr 1fr 1fr auto',
                    gap: '1rem',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: '#f9f9f9',
                    border: '1px solid #eee',
                    borderRadius: '4px',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#999' }}>Fecha</div>
                    <div style={{ fontWeight: 'bold' }}>{contrib.date}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#999' }}>Cantidad</div>
                    <div style={{ fontWeight: 'bold' }}>{contrib.shares.toFixed(6)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#999' }}>Precio/Unidad</div>
                    <div style={{ fontWeight: 'bold' }}>{getCurrencySymbol()}{contrib.pricePerShare.toFixed(2)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#999' }}>Monto</div>
                    <div style={{ fontWeight: 'bold' }}>{getCurrencySymbol()}{contrib.amount.toFixed(2)}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteContribution(contrib.id)}
                    style={{
                      padding: '0.4rem 0.6rem',
                      background: '#ffebee',
                      color: '#d32f2f',
                      border: '1px solid #ef5350',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formulario para Agregar Aportación */}
        {showForm && (
          <div style={{
            padding: '1.5rem',
            background: '#f5f7ff',
            border: '1px solid #667eea',
            borderRadius: '6px',
            marginBottom: '1.5rem',
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>➕ Nueva Aportación</h3>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem',
            }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  Fecha
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  Cantidad de Unidades
                </label>
                <input
                  type="number"
                  value={formData.shares}
                  onChange={(e) => setFormData({ ...formData, shares: parseFloat(e.target.value) })}
                  step="0.000001"
                  min="0"
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  Precio/Unidad ({getCurrencySymbol()})
                </label>
                <input
                  type="number"
                  value={formData.pricePerShare}
                  onChange={(e) => setFormData({ ...formData, pricePerShare: parseFloat(e.target.value) })}
                  step="0.01"
                  min="0"
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
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  Monto Total ({getCurrencySymbol()})
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  step="0.01"
                  min="0"
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

            {formData.shares > 0 && formData.pricePerShare > 0 && (
              <div style={{
                padding: '0.75rem',
                background: '#e3f2fd',
                borderRadius: '4px',
                marginBottom: '1rem',
                fontSize: '0.9rem',
              }}>
                <strong>Monto calculado:</strong> {getCurrencySymbol()}{(formData.shares * formData.pricePerShare).toFixed(2)}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleAddContribution}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                ✓ Agregar
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    date: new Date().toISOString().split('T')[0],
                    amount: 0,
                    shares: 0,
                    pricePerShare: 0,
                  });
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#ddd',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                }}
              >
                ✕ Cancelar
              </button>
            </div>
          </div>
        )}

        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginBottom: '1rem',
            }}
          >
            ➕ Agregar Nueva Aportación
          </button>
        )}

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};
