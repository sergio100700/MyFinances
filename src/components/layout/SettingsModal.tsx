import React, { useEffect, useState } from 'react';
import { loadSettings, updateCurrency, Settings, exportAllData, importAllData, getSettingsCache } from '../../lib/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<Settings['currency']>(getSettingsCache().currency);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const currencies: Array<{ code: Settings['currency']; name: string }> = [
    { code: 'USD', name: 'Dólar Estadounidense (USD)' },
    { code: 'EUR', name: 'Euro (EUR)' },
    { code: 'GBP', name: 'Libra Esterlina (GBP)' },
    { code: 'ARS', name: 'Peso Argentino (ARS)' },
    { code: 'MXN', name: 'Peso Mexicano (MXN)' },
    { code: 'COP', name: 'Peso Colombiano (COP)' },
  ];

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoadingSettings(true);
      try {
        const settings = await loadSettings();
        setSelectedCurrency(settings.currency);
      } catch (error) {
        console.error('Error cargando ajustes:', error);
      } finally {
        setLoadingSettings(false);
      }
    };

    load();
  }, [isOpen]);

  const handleSave = async () => {
    await updateCurrency(selectedCurrency);
    window.location.reload();
  };

  const handleExport = async () => {
    try {
      await exportAllData();
      alert('✓ Datos exportados correctamente');
    } catch (error) {
      alert('✗ Error al exportar los datos');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    try {
      await importAllData(file);
      setImportSuccess(true);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Error desconocido');
    }

    // Limpiar el input
    event.target.value = '';
  };

  if (!isOpen) return null;

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
          maxWidth: '500px',
          background: 'white',
          padding: '2rem',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>⚙️ Ajustes</h2>
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

        <div>
          <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
            💱 Selecciona tu Divisa
          </label>

          {loadingSettings && (
            <p style={{ margin: 0, color: '#999', fontSize: '0.9rem' }}>Cargando ajustes...</p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
            {currencies.map((curr) => (
              <label
                key={curr.code}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem',
                  background: selectedCurrency === curr.code ? '#f0f4ff' : '#f9f9f9',
                  border: selectedCurrency === curr.code ? '2px solid #667eea' : '1px solid #ddd',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <input
                  type="radio"
                  name="currency"
                  value={curr.code}
                  checked={selectedCurrency === curr.code}
                  onChange={(e) => setSelectedCurrency(e.target.value as Settings['currency'])}
                  style={{
                    marginRight: '0.75rem',
                    cursor: 'pointer',
                    width: '18px',
                    height: '18px',
                  }}
                />
                <span style={{ fontWeight: selectedCurrency === curr.code ? 'bold' : 'normal' }}>
                  {curr.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
          <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
            💾 Respalda tus Datos
          </label>
          
          {importError && (
            <div style={{
              padding: '0.75rem',
              background: '#ffebee',
              border: '1px solid #ef5350',
              borderRadius: '4px',
              color: '#d32f2f',
              marginBottom: '1rem',
              fontSize: '0.9rem',
            }}>
              ✗ {importError}
            </div>
          )}
          
          {importSuccess && (
            <div style={{
              padding: '0.75rem',
              background: '#e8f5e9',
              border: '1px solid #4caf50',
              borderRadius: '4px',
              color: '#2e7d32',
              marginBottom: '1rem',
              fontSize: '0.9rem',
            }}>
              ✓ Datos importados correctamente. Recargando...
            </div>
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              onClick={handleExport}
              style={{
                padding: '0.75rem',
                background: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.95rem',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#45a049';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#4caf50';
              }}
            >
              📥 Exportar
            </button>
            
            <label style={{
              padding: '0.75rem',
              background: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              display: 'block',
            }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#0b7dda';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2196f3';
              }}
            >
              📤 Importar
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                style={{
                  display: 'none',
                }}
              />
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: '0.75rem',
              background: '#ddd',
              color: '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
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
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};
