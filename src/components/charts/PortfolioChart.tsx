import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { Investment } from '../../types';
import { getCurrencySymbol } from '../../lib/format';

interface PortfolioChartProps {
    investments: Investment[];
}

const COLORS = [
    '#667eea',
    '#764ba2',
    '#4facfe',
    '#00f2fe',
    '#11998e',
    '#38ef7d',
    '#f093fb',
    '#4facfe',
    '#43e97b',
    '#fa7231',
    '#ffa502',
    '#eb3349',
];

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ investments }) => {
    // Filter out zero-value investments
    const chartData = investments
        .filter((inv) => inv.currentValue > 0)
        .map((inv) => ({
            name: inv.name,
            value: inv.currentValue,
            investment: inv,
        }));

    if (chartData.length === 0) {
        return null;
    }

    const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            const percentage = ((data.value / totalValue) * 100).toFixed(1);
            return (
                <div
                    style={{
                        background: 'white',
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    }}
                >
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{data.name}</p>
                    <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                        {percentage}% - €{data.value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderLegend = (props: any) => {
        const { payload } = props;
        const currencySymbol = getCurrencySymbol();
        
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {payload.map((entry: any, index: number) => {
                    const inv = chartData[index].investment;
                    const percentage = ((inv.currentValue / totalValue) * 100).toFixed(1);
                    const gain = inv.currentValue - inv.amount;
                    const gainPct = ((gain / inv.amount) * 100).toFixed(1);
                    
                    return (
                        <div
                            key={entry.value}
                            style={{
                                padding: '0.75rem',
                                border: `2px solid ${entry.color}`,
                                borderRadius: '4px',
                                background: '#f9f9f9',
                            }}
                        >
                            <p style={{ margin: '0 0 0.25rem 0', fontWeight: 'bold', color: entry.color }}>
                                {entry.value}
                            </p>
                            <p style={{ margin: '0.25rem 0', fontSize: '0.85rem', color: '#666' }}>
                                {percentage}% de la cartera
                            </p>
                            <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                {currencySymbol}{inv.currentValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p
                                style={{
                                    margin: '0.25rem 0',
                                    fontSize: '0.85rem',
                                    color: gain >= 0 ? '#27ae60' : '#e74c3c',
                                    fontWeight: 'bold',
                                }}
                            >
                                {gain >= 0 ? '+' : ''}{gainPct}%
                            </p>
                        </div>
                    );
                })}
                <div
                    style={{
                        padding: '0.75rem',
                        border: '2px solid #667eea',
                        borderRadius: '4px',
                        background: '#f0f4ff',
                        gridColumn: 'span 1',
                    }}
                >
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#667eea' }}>Total Cartera</p>
                    <p style={{ margin: '0.25rem 0', fontSize: '1.1rem', fontWeight: 'bold', color: '#667eea' }}>
                        {currencySymbol}{totalValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div
            className="card"
            style={{
                marginBottom: '2rem',
                padding: '1.5rem',
            }}
        >
            <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>📊 Composición de Cartera</h2>
            
            <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => {
                            const percentage = ((value / totalValue) * 100).toFixed(1);
                            return `${name} (${percentage}%)`;
                        }}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
            </ResponsiveContainer>

            <div style={{ marginTop: '2rem' }}>
                {renderLegend({
                    payload: chartData.map((item, index) => ({
                        value: item.name,
                        color: COLORS[index % COLORS.length],
                    })),
                })}
            </div>
        </div>
    );
};
