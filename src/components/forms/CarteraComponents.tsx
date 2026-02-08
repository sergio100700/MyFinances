import React, { useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import type { Cartera } from '../../features/inversiones/inversiones.types';

interface CarteraFormProps {
    onSubmit: (nombre: string, descripcion?: string) => void;
    isLoading?: boolean;
}

export const CarteraForm: React.FC<CarteraFormProps> = ({ onSubmit, isLoading }) => {
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nombre.trim()) {
            onSubmit(nombre, descripcion || undefined);
            setNombre('');
            setDescripcion('');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
            <h3>Nueva Cartera</h3>
            <div style={{ marginBottom: '0.5rem' }}>
                <label>
                    Nombre:
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="ej: Indexada largo plazo"
                        required
                    />
                </label>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
                <label>
                    Descripción:
                    <textarea
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Descripción opcional"
                        rows={2}
                    />
                </label>
            </div>
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Agregando...' : 'Agregar Cartera'}
            </button>
        </form>
    );
};

interface CarteraListProps {
    carteras: Cartera[];
    valoresCartera?: Record<string, number>; // carteraId -> valor total
    onSelect: (cartera: Cartera) => void;
    onDelete: (id: string) => void;
}

export const CarteraList: React.FC<CarteraListProps> = ({ carteras, valoresCartera = {}, onSelect, onDelete }) => {
    return (
        <div style={{ marginBottom: '2rem' }}>
            <h3>Carteras ({carteras.length})</h3>
            {carteras.length === 0 ? (
                <p>No hay carteras. Crea una nueva para comenzar.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                    {carteras.map((cartera) => {
                        const valor = valoresCartera[cartera.id] ?? 0;
                        return (
                            <div
                                key={cartera.id}
                                style={{
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '4px',
                                    padding: '1rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                                }}
                                onClick={() => onSelect(cartera)}
                            >
                                <h4>{cartera.nombre}</h4>
                                <div style={{ marginBottom: '0.75rem', fontSize: '1.2rem', fontWeight: 'bold', color: '#1976d2' }}>
                                    €{valor.toFixed(2)}
                                </div>
                                {cartera.descripcion && <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{cartera.descripcion}</p>}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(cartera.id);
                                    }}
                                    style={{ color: '#d32f2f', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

interface CarteraDistribucionProps {
    carteras: Cartera[];
    valoresCartera?: Record<string, number>; // carteraId -> valor total
}

const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
    '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0',
];

export const CarteraDistribucion: React.FC<CarteraDistribucionProps> = ({ carteras, valoresCartera = {} }) => {
    // Preparar datos para el gráfico
    const data = carteras
        .map((cartera) => ({
            name: cartera.nombre,
            value: valoresCartera[cartera.id] ?? 0,
        }))
        .filter((item) => item.value > 0);

    if (data.length === 0) {
        return <p>No hay carteras con valores para mostrar.</p>;
    }

    const totalValor = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div style={{ marginBottom: '2rem' }}>
            <h3>Distribución de Carteras</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            formatter={(value: any) => `€${(value as number).toFixed(2)}`}
                            labelFormatter={(name) => `Cartera: ${name}`}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>

                <div style={{ overflowX: 'auto' }}>
                    <h4>Participación</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Cartera</th>
                                <th style={{ textAlign: 'right', padding: '0.5rem' }}>Valor</th>
                                <th style={{ textAlign: 'right', padding: '0.5rem' }}>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => {
                                const percentage = (item.value / totalValor) * 100;
                                return (
                                    <tr key={item.name} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <td style={{ padding: '0.5rem' }}>
                                            <div
                                                style={{
                                                    display: 'inline-block',
                                                    width: '12px',
                                                    height: '12px',
                                                    backgroundColor: COLORS[index % COLORS.length],
                                                    borderRadius: '2px',
                                                    marginRight: '0.5rem',
                                                    verticalAlign: 'middle',
                                                }}
                                            />
                                            {item.name}
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '0.5rem', fontWeight: '500' }}>
                                            €{item.value.toFixed(2)}
                                        </td>
                                        <td style={{ textAlign: 'right', padding: '0.5rem', color: '#1976d2', fontWeight: 'bold' }}>
                                            {percentage.toFixed(1)}%
                                        </td>
                                    </tr>
                                );
                            })}
                            <tr style={{ borderTop: '2px solid #e0e0e0', fontWeight: 'bold' }}>
                                <td style={{ padding: '0.5rem' }}>Total</td>
                                <td style={{ textAlign: 'right', padding: '0.5rem' }}>€{totalValor.toFixed(2)}</td>
                                <td style={{ textAlign: 'right', padding: '0.5rem' }}>100%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
