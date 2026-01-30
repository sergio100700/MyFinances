import React, { useEffect, useState } from 'react';
import { addInvestment, loadData, getTotalAssets, getYTDReturn, getMonthlyIncome } from '../../lib/storage';
import { getCurrencySymbol } from '../../lib/format';
import { Investment } from '../../types';
import { fetchCurrentPrice, getTickerFromISIN } from '../../lib/yahooFinance';

interface InvestmentFormProps {
  onSuccess?: () => void;
}

export const InvestmentForm: React.FC<InvestmentFormProps> = ({ onSuccess }) => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    isin: '',
    priceMode: 'historical' as 'historical' | 'current',
    shares: 0,
    purchasePrice: 0,
    currentPrice: 0,
    totalInvested: 0,
    manualAmount: 0,
    manualCurrentValue: 0,
    valuationMode: 'auto' as 'auto' | 'manual',
    purchaseDate: new Date().toISOString().split('T')[0],
    type: 'stocks' as Investment['type'],
    savingsRate: 0,
  });

  const isSavings = formData.type === 'savings';

  useEffect(() => {
    if (isSavings && formData.valuationMode !== 'manual') {
      setFormData((prev) => ({ ...prev, valuationMode: 'manual' }));
    }
  }, [isSavings, formData.valuationMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      let investment: Omit<Investment, 'id'>;

      if (isSavings) {
        if (!formData.name.trim()) {
          setError('El nombre es obligatorio para la cuenta de ahorro.');
          setLoading(false);
          return;
        }

        if (Number.isNaN(formData.savingsRate)) {
          setError('La tasa de interés debe ser un número válido.');
          setLoading(false);
          return;
        }

        investment = {
          name: formData.name.trim(),
          isin: '',
          shares: 0,
          purchasePrice: 0,
          amount: formData.manualAmount,
          currentValue: formData.manualCurrentValue,
          currentPrice: undefined,
          valuationMode: 'manual',
          purchaseDate: formData.purchaseDate,
          type: 'savings',
          savingsRate: formData.savingsRate,
          savingsLastUpdate: formData.purchaseDate,
        };
      } else if (formData.valuationMode === 'manual') {
        if (!formData.name.trim()) {
          setError('El nombre es obligatorio en modo manual.');
          setLoading(false);
          return;
        }

        investment = {
          name: formData.name.trim(),
          isin: '',
          shares: 0,
          purchasePrice: 0,
          amount: formData.manualAmount,
          currentValue: formData.manualCurrentValue,
          currentPrice: undefined,
          valuationMode: 'manual',
          purchaseDate: formData.purchaseDate,
          type: formData.type,
        };
      } else {
        // Automatic mode: auto pricing or manual current price
        let currentPrice: number;
        let amount: number;
        let purchasePrice: number;

        if (formData.priceMode === 'historical') {
          // Fetch current price from Yahoo Finance
          const ticker = getTickerFromISIN(formData.isin);
          const yahooPrice = await fetchCurrentPrice(ticker);

          if (yahooPrice === null) {
            setError(`No se pudo obtener el precio actual para ${formData.isin}. Verifica el ISIN/ticker.`);
            setLoading(false);
            return;
          }

          amount = formData.shares * formData.purchasePrice;
          currentPrice = yahooPrice;
          purchasePrice = formData.purchasePrice;
        } else {
          // Current price mode: user provides current price and total invested
          currentPrice = formData.currentPrice;
          amount = formData.totalInvested;
          purchasePrice = formData.totalInvested / formData.shares; // Calculate average purchase price
        }

        const currentValue = formData.shares * currentPrice;

        investment = {
          name: formData.name || getTickerFromISIN(formData.isin),
          isin: formData.isin,
          shares: formData.shares,
          purchasePrice: purchasePrice,
          amount: amount,
          currentValue: currentValue,
          currentPrice: currentPrice,
          valuationMode: 'auto',
          purchaseDate: formData.purchaseDate,
          type: formData.type,
        };
      }
      
      await addInvestment(investment);
      
      setFormData({
        name: '',
        isin: '',
        priceMode: 'historical',
        shares: 0,
        purchasePrice: 0,
        currentPrice: 0,
        totalInvested: 0,
        manualAmount: 0,
        manualCurrentValue: 0,
        valuationMode: 'auto',
        purchaseDate: new Date().toISOString().split('T')[0],
        type: 'stocks',
        savingsRate: 0,
      });
      setShowForm(false);
      onSuccess?.();
    } catch (err) {
      setError('Error al agregar la inversión. Inténtalo de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
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
        {showForm ? '✕ Cancelar' : '+ Agregar Inversión'}
      </button>

      {showForm && (
        <div className="card" style={{ background: '#f9f9f9' }}>
          {error && (
            <div style={{ 
              padding: '1rem', 
              background: '#fee', 
              border: '1px solid #fcc', 
              borderRadius: '4px', 
              marginBottom: '1rem',
              color: '#c33'
            }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Modo de valoración
                <span
                  title="Automático usa ISIN/ticker y precio de mercado. Manual permite ingresar tu total invertido y valor actual."
                  style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                >
                  ⓘ
                </span>
              </label>
              <select
                value={formData.valuationMode}
                onChange={(e) => setFormData({ ...formData, valuationMode: e.target.value as 'auto' | 'manual' })}
                disabled={isSavings}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                }}
              >
                <option value="auto" disabled={isSavings}>Automático (ISIN/ticker)</option>
                <option value="manual">Manual (aportaciones)</option>
              </select>
            </div>

            {formData.valuationMode === 'auto' && !isSavings && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                ISIN o Ticker
                <span
                  title="Código ISIN (ej. US0378331005) o ticker de Yahoo Finance (ej. AAPL, MSFT, SPY). El sistema consultará el precio actual automáticamente."
                  style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                >
                  ⓘ
                </span>
              </label>
              <input
                type="text"
                value={formData.isin}
                onChange={(e) => setFormData({ ...formData, isin: e.target.value })}
                placeholder="US0378331005 o AAPL"
                required={formData.valuationMode === 'auto'}
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

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                {isSavings || formData.valuationMode === 'manual' ? 'Nombre (obligatorio)' : 'Nombre (opcional)'}
                <span
                  title="Nombre descriptivo del activo. Si se deja vacío, se usará el ticker."
                  style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                >
                  ⓘ
                </span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Apple Inc."
                required={isSavings || formData.valuationMode === 'manual'}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {formData.valuationMode === 'auto' && !isSavings ? (
              <>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    ¿Cómo quieres ingresar el precio?
                    <span
                      title="Histórico: precio de compra + cantidad. Actual: precio actual + monto invertido."
                      style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                    >
                      ⓘ
                    </span>
                  </label>
                  <select
                    value={formData.priceMode}
                    onChange={(e) => setFormData({ ...formData, priceMode: e.target.value as 'historical' | 'current' })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      fontFamily: 'inherit',
                    }}
                  >
                    <option value="historical">Precio de compra por acción</option>
                    <option value="current">Precio actual + total invertido</option>
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      Cantidad de Acciones
                      <span
                        title="Número de acciones o unidades que tienes."
                        style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                      >
                        ⓘ
                      </span>
                    </label>
                    <input
                      type="number"
                      value={formData.shares}
                      onChange={(e) => setFormData({ ...formData, shares: parseFloat(e.target.value) })}
                      required
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
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                      {formData.priceMode === 'historical' ? 'Precio de Compra' : 'Precio Actual'} ({getCurrencySymbol()})
                      <span
                        title={formData.priceMode === 'historical' ? 'Precio por acción al momento de la compra.' : 'Precio actual por acción.'}
                        style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                      >
                        ⓘ
                      </span>
                    </label>
                    <input
                      type="number"
                      value={formData.priceMode === 'historical' ? formData.purchasePrice : formData.currentPrice}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        [formData.priceMode === 'historical' ? 'purchasePrice' : 'currentPrice']: parseFloat(e.target.value)
                      })}
                      required
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

                {formData.priceMode === 'historical' && (
                  <div style={{ 
                    padding: '1rem', 
                    background: '#e3f2fd', 
                    borderRadius: '4px', 
                    marginBottom: '1rem',
                    fontSize: '0.9rem'
                  }}>
                    <strong>Total Invertido:</strong> {getCurrencySymbol()}{(formData.shares * formData.purchasePrice).toFixed(2)}
                  </div>
                )}

                {formData.priceMode === 'current' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Total Invertido ({getCurrencySymbol()})
                        <span
                          title="Suma total de tus aportaciones."
                          style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                        >
                          ⓘ
                        </span>
                      </label>
                      <input
                        type="number"
                        value={formData.totalInvested}
                        onChange={(e) => setFormData({ ...formData, totalInvested: parseFloat(e.target.value) })}
                        required
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
                    <div style={{ 
                      padding: '1rem', 
                      background: '#e3f2fd', 
                      borderRadius: '4px',
                      fontSize: '0.9rem'
                    }}>
                      <div><strong>Cantidad:</strong> {formData.shares.toFixed(6)}</div>
                      <div><strong>Precio actual:</strong> {getCurrencySymbol()}{formData.currentPrice.toFixed(2)}</div>
                      <div><strong>Valor actual:</strong> {getCurrencySymbol()}{(formData.shares * formData.currentPrice).toFixed(2)}</div>
                      {formData.totalInvested > 0 && (
                        <div style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>
                          <strong>Precio promedio compra:</strong> {getCurrencySymbol()}{(formData.totalInvested / formData.shares).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    {isSavings ? 'Saldo inicial / aportado' : 'Total Invertido'} ({getCurrencySymbol()})
                    <span
                      title="Suma total de tus aportaciones al fondo."
                      style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                    >
                      ⓘ
                    </span>
                  </label>
                  <input
                    type="number"
                    value={formData.manualAmount}
                    onChange={(e) => setFormData({ ...formData, manualAmount: parseFloat(e.target.value) })}
                    required
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
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    {isSavings ? 'Saldo actual' : 'Valor Actual'} ({getCurrencySymbol()})
                    <span
                      title="Valor actual total del fondo."
                      style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                    >
                      ⓘ
                    </span>
                  </label>
                  <input
                    type="number"
                    value={formData.manualCurrentValue}
                    onChange={(e) => setFormData({ ...formData, manualCurrentValue: parseFloat(e.target.value) })}
                    required
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
            )}

            {isSavings && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Rentabilidad anual (%)
                  <span
                    title="Introduce la tasa anual que aplica el banco. Puedes cambiarla más tarde si el banco actualiza el tipo."
                    style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                  >
                    ⓘ
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.savingsRate}
                  onChange={(e) => setFormData({ ...formData, savingsRate: parseFloat(e.target.value) })}
                  step="0.01"
                  min="0"
                  placeholder="% anual"
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Fecha Compra
                  <span
                    title="Fecha de compra o inicio de la inversión."
                    style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                  >
                    ⓘ
                  </span>
                </label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
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
                    title="Tipo de activo para clasificar la inversión."
                    style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                  >
                    ⓘ
                  </span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Investment['type'] })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontFamily: 'inherit',
                  }}
                >
                  <option value="stocks">Acciones</option>
                  <option value="etf">ETF</option>
                  <option value="funds">Fondos de inversión</option>
                  <option value="crypto">Cripto</option>
                  <option value="bonds">Bonos</option>
                  <option value="savings">Ahorro remunerado</option>
                  <option value="other">Otro</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 2rem',
                background: loading ? '#95a5a6' : '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '1rem',
              }}
            >
              {loading ? '⏳ Obteniendo precio...' : '💾 Guardar Inversión'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
