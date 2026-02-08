import React, { useState } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import type { ActivoValorActual } from '../../features/inversiones/inversiones.types';

interface ActivoSeguimientoFormProps {
    activoId: string;
    activoNombre: string;
    onSubmit: (valorActual: number) => void;
    isLoading?: boolean;
}

export const ActivoSeguimientoForm: React.FC<ActivoSeguimientoFormProps> = ({
    activoNombre,
    onSubmit,
    isLoading,
}) => {
    const [valorActual, setValorActual] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (valorActual) {
            onSubmit(parseFloat(valorActual));
            setValorActual('');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
            <h4>Actualizar Valor - {activoNombre}</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <label>
                    Valor Total Actual (€):
                    <input
                        type="number"
                        step="0.01"
                        value={valorActual}
                        onChange={(e) => setValorActual(e.target.value)}
                        placeholder="ej: 15000"
                        required
                    />
                </label>
            </div>
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : 'Guardar Valor'}
            </button>
        </form>
    );
};

interface ActivoParticipacionProps {
    activosValores: ActivoValorActual[];
    onAgregarValor?: (activoId: string, cantidadActual: number, valorActual: number) => void;
}

const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
    '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0',
];

export const ActivoParticipacion: React.FC<ActivoParticipacionProps> = ({
    activosValores,
}) => {
    if (activosValores.length === 0) {
        return (
            <div style={{ textAlign: 'center', color: '#999', padding: '2rem', background: '#f9f9f9', borderRadius: '4px', marginTop: '1.5rem' }}>
                <p>Actualiza los capitales actuales de tus activos para ver el gráfico de distribución.</p>
            </div>
        );
    }

    const totalValor = activosValores.reduce((sum, a) => sum + a.valorActual, 0);
    const chartData = activosValores.map((activo) => ({
        name: activo.nombre,
        value: activo.valorActual,
        percentage: totalValor > 0 ? ((activo.valorActual / totalValor) * 100).toFixed(2) : '0.00',
    }));

    return (
        <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '4px' }}>
            <h3>📊 Distribución de Activos</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                {/* Gráfico */}
                <div>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percentage }) => `${name}: ${percentage}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value: number) => `€${value.toFixed(2)}`}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Tabla de detalles */}
                <div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #ddd', background: '#fff' }}>
                                <th style={{ textAlign: 'left', padding: '0.5rem' }}>Activo</th>
                                <th style={{ textAlign: 'right', padding: '0.5rem' }}>Valor</th>
                                <th style={{ textAlign: 'right', padding: '0.5rem' }}>%</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activosValores.map((activo) => (
                                <tr key={activo.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{activo.nombre}</td>
                                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#1976d2', fontWeight: 'bold' }}>
                                        €{activo.valorActual.toFixed(2)}
                                    </td>
                                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#2e7d32', fontWeight: 'bold' }}>
                                        {totalValor > 0
                                            ? ((activo.valorActual / totalValor) * 100).toFixed(2)
                                            : '0.00'}
                                        %
                                    </td>
                                </tr>
                            ))}
                            <tr style={{ borderTop: '2px solid #ddd', background: '#fff', fontWeight: 'bold' }}>
                                <td style={{ padding: '0.5rem' }}>TOTAL</td>
                                <td style={{ padding: '0.5rem', textAlign: 'right', color: '#1976d2' }}>
                                    €{totalValor.toFixed(2)}
                                </td>
                                <td style={{ padding: '0.5rem', textAlign: 'right' }}>100.00%</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
