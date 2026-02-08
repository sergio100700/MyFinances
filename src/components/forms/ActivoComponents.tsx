import React, { useState } from 'react';
import type { Activo } from '../../features/inversiones/inversiones.types';

interface ActivoFormProps {
    carteraId: string;
    onSubmit: (nombre: string, tipo: 'fondo' | 'etf' | 'accion' | 'otro') => void;
    isLoading?: boolean;
}

export const ActivoForm: React.FC<ActivoFormProps> = ({ onSubmit, isLoading }) => {
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState<'fondo' | 'etf' | 'accion' | 'otro'>('fondo');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nombre.trim()) {
            onSubmit(nombre, tipo);
            setNombre('');
            setTipo('fondo');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
            <h4>Nuevo Activo</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <label>
                    Nombre:
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="ej: Vanguard FTSE"
                        required
                    />
                </label>
                <label>
                    Tipo:
                    <select value={tipo} onChange={(e) => setTipo(e.target.value as any)}>
                        <option value="fondo">Fondo</option>
                        <option value="etf">ETF</option>
                        <option value="accion">Acción</option>
                        <option value="otro">Otro</option>
                    </select>
                </label>
            </div>
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Agregando...' : 'Agregar Activo'}
            </button>
        </form>
    );
};

interface ActivoListProps {
    activos: Activo[];
    valoresActuales?: Record<string, number>; // activoId -> valorActual
    onDelete: (id: string) => void;
    onActualizarValor?: (activoId: string, valor: number) => void;
}

export const ActivoList: React.FC<ActivoListProps> = ({ activos, valoresActuales, onDelete, onActualizarValor }) => {
    const [editandoId, setEditandoId] = useState<string | null>(null);
    const [editValor, setEditValor] = useState('');

    const handleEditar = (activo: Activo) => {
        setEditandoId(activo.id);
        setEditValor((valoresActuales?.[activo.id] ?? activo.capitalInicial).toString());
    };

    const handleGuardar = (activoId: string) => {
        if (editValor && onActualizarValor) {
            onActualizarValor(activoId, parseFloat(editValor));
            setEditandoId(null);
        }
    };

    return (
        <div style={{ marginTop: '1rem' }}>
            <h4>Activos ({activos.length})</h4>
            {activos.length === 0 ? (
                <p style={{ color: '#666' }}>No hay activos en esta cartera.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #ddd', background: '#f5f5f5' }}>
                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Nombre</th>
                            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Tipo</th>
                            <th style={{ textAlign: 'right', padding: '0.5rem' }}>Valor Actual</th>
                            <th style={{ padding: '0.5rem', textAlign: 'center' }}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activos.map((activo) => {
                            const capitalActual = valoresActuales?.[activo.id] ?? activo.capitalInicial;
                            const esEditando = editandoId === activo.id;

                            return (
                                <tr key={activo.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.5rem' }}>{activo.nombre}</td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <span style={{ fontSize: '0.85rem', background: '#e3f2fd', padding: '0.25rem 0.5rem', borderRadius: '2px' }}>
                                            {activo.tipo}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                        {esEditando ? (
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editValor}
                                                onChange={(e) => setEditValor(e.target.value)}
                                                style={{ width: '120px' }}
                                            />
                                        ) : (
                                            <span
                                                style={{
                                                    color: '#1976d2',
                                                    fontWeight: 'bold',
                                                }}
                                            >
                                                €{capitalActual.toFixed(2)}
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                        {esEditando ? (
                                            <>
                                                <button
                                                    onClick={() => handleGuardar(activo.id)}
                                                    style={{
                                                        marginRight: '0.25rem',
                                                        padding: '0.25rem 0.5rem',
                                                        fontSize: '0.85rem',
                                                    }}
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={() => setEditandoId(null)}
                                                    style={{
                                                        marginRight: '0.25rem',
                                                        padding: '0.25rem 0.5rem',
                                                        fontSize: '0.85rem',
                                                        background: '#f5f5f5',
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleEditar(activo)}
                                                    style={{
                                                        marginRight: '0.25rem',
                                                        color: '#1976d2',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: '0.85rem',
                                                    }}
                                                >
                                                    ✎
                                                </button>
                                                <button
                                                    onClick={() => onDelete(activo.id)}
                                                    style={{
                                                        color: '#d32f2f',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};
