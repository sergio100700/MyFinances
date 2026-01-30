import React, { useState } from 'react';
import { addProperty, loadData, deleteProperty } from '../../lib/storage';
import { getCurrencySymbol } from '../../lib/format';
import { Property } from '../../types';

interface PropertyFormProps {
  onSuccess?: () => void;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({ onSuccess }) => {
  const [showForm, setShowForm] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    value: 0,
    mortgage: 0,
    mortgagePayment: 0,
    monthlyRent: 0,
    annualCosts: 0,
    purchaseDate: new Date().toISOString().split('T')[0],
    appreciation: 0,
    occupancy: 100,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addProperty(formData);
    setFormData({
      name: '',
      value: 0,
      mortgage: 0,
      mortgagePayment: 0,
      monthlyRent: 0,
      annualCosts: 0,
      purchaseDate: new Date().toISOString().split('T')[0],
      appreciation: 0,
      occupancy: 100,
    });
    setShowForm(false);
    onSuccess?.();
  };

  React.useEffect(() => {
    const fetchData = async () => {
      const data = await loadData();
      setProperties(data.properties);
    };
    fetchData();
  }, [onSuccess]);

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
        {showForm ? '✕ Cancelar' : '+ Agregar Propiedad'}
      </button>

      {showForm && (
        <div className="card" style={{ background: '#f9f9f9', marginBottom: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Nombre/Dirección
                <span
                  title="Nombre identificador del inmueble (dirección o apodo)."
                  style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                >
                  ⓘ
                </span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Valor Catastral ({getCurrencySymbol()})
                  <span
                    title="Valor estimado de mercado/actual del inmueble."
                    style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                  >
                    ⓘ
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                  required
                  step="1000"
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
                  Hipoteca ({getCurrencySymbol()})
                  <span
                    title="Saldo pendiente de la hipoteca (actualízalo cuando cambie)."
                    style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                  >
                    ⓘ
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.mortgage}
                  onChange={(e) => setFormData({ ...formData, mortgage: parseFloat(e.target.value) })}
                  step="1000"
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
                  Pago Hipoteca Mensual ({getCurrencySymbol()})
                  <span
                    title="Cuota mensual que pagas de la hipoteca (capital + intereses)."
                    style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                  >
                    ⓘ
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.mortgagePayment}
                  onChange={(e) => setFormData({ ...formData, mortgagePayment: parseFloat(e.target.value) })}
                  step="10"
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
                  Renta Mensual ({getCurrencySymbol()})
                  <span
                    title="Ingreso mensual por alquiler cuando está ocupado."
                    style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                  >
                    ⓘ
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.monthlyRent}
                  onChange={(e) => setFormData({ ...formData, monthlyRent: parseFloat(e.target.value) })}
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Fecha Compra
                  <span
                    title="Fecha en la que compraste el inmueble."
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
                  Costes Anuales (IBI, seguro, mantenimiento) ({getCurrencySymbol()})
                  <span
                    title="Suma anual de IBI, seguro, comunidad y mantenimiento."
                    style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                  >
                    ⓘ
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.annualCosts}
                  onChange={(e) => setFormData({ ...formData, annualCosts: parseFloat(e.target.value) })}
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
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Apreciación Anual (%)
                  <span
                    title="Crecimiento esperado anual del valor del inmueble."
                    style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                  >
                    ⓘ
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.appreciation}
                  onChange={(e) => setFormData({ ...formData, appreciation: parseFloat(e.target.value) })}
                  step="0.1"
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
                  Ocupación (%)
                  <span
                    title="Porcentaje del año alquilado (100% = siempre ocupado)."
                    style={{ marginLeft: '0.4rem', cursor: 'help', color: '#666', fontSize: '0.85rem' }}
                  >
                    ⓘ
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.occupancy}
                  onChange={(e) => setFormData({ ...formData, occupancy: parseFloat(e.target.value) })}
                  min="0"
                  max="100"
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
              Guardar Propiedad
            </button>
          </form>
        </div>
      )}

      {properties.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {properties.map((prop) => (
            <div key={prop.id} className="card" style={{ background: '#f9f9f9' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>{prop.name}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                <div>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>Valor</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold' }}>${prop.value.toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>Hipoteca</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold' }}>${prop.mortgage.toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>Renta/mes</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold' }}>${prop.monthlyRent}</p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>Ocupación</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold' }}>{prop.occupancy}%</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm('¿Eliminar esta propiedad?')) {
                    deleteProperty(prop.id);
                    onSuccess?.();
                  }
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  background: '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
