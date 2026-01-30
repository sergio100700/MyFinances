import React, { useState, useEffect, useRef } from 'react';
import { loadData, getTotalAssets, getYTDReturn, getMonthlyIncome } from '../lib/storage';
import { formatCurrency } from '../lib/format';
import type { FinanceData } from '../types';

const Dashboard: React.FC = () => {
    const [data, setData] = useState<FinanceData>({ transactions: [], investments: [], properties: [], budgets: [] });
    const loadedRef = useRef(false);

    useEffect(() => {
        if (loadedRef.current) return; // Evitar doble ejecución en Strict Mode
        loadedRef.current = true;

        const fetchData = async () => {
            try {
                const loadedData = await loadData();
                setData(loadedData);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        fetchData();
    }, []);



    const totalAssets = getTotalAssets(data);
    const ytdReturn = getYTDReturn(data);
    const monthlyIncome = getMonthlyIncome(data);
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyExpenses = data.transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
        .reduce((sum, t) => sum + t.amount, 0);

    const stats = [
        { label: 'Patrimonio Total', value: formatCurrency(totalAssets), change: totalAssets > 0 ? '+5.2%' : 'Sin datos' },
        { label: 'Rendimiento YTD', value: ytdReturn >= 0 ? `+${formatCurrency(ytdReturn)}` : `-${formatCurrency(Math.abs(ytdReturn))}`, change: ytdReturn >= 0 ? '+7.1%' : '-2.1%' },
        { label: 'Ingresos Mensuales', value: formatCurrency(monthlyIncome), change: monthlyIncome > 0 ? 'Activos' : 'Sin propiedades' },
        { label: 'Gastos Este Mes', value: formatCurrency(monthlyExpenses), change: 'Monitorear' },
    ];

    return (
        <div>
            <h1>📊 Dashboard</h1>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#666' }}>
                Bienvenido a tu panel financiero. Aquí verás un resumen de tu situación económica.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {stats.map((stat, i) => (
                    <div key={i} className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', textAlign: 'center' }}>
                        <h3 style={{ color: 'white', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</h3>
                        <p style={{ fontSize: '2.2rem', fontWeight: '700', margin: '0.5rem 0', color: 'white' }}>{stat.value}</p>
                        <p style={{ fontSize: '0.95rem', margin: 0, color: 'white' }}>{stat.change}</p>
                    </div>
                ))}
            </div>

            <div className="card">
                <h2>Distribución de Activos</h2>
                <p>Inversiones: {data.investments.length} | Propiedades: {data.properties.length} | Transacciones: {data.transactions.length}</p>
            </div>

            <div className="card">
                <h2>Alertas Financieras</h2>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>✓ {data.investments.length > 0 ? `Tienes ${data.investments.length} inversiones activas` : 'Agrega tus primeras inversiones'}</li>
                    <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>✓ {data.properties.length > 0 ? `Ingresos inmobiliarios: ${formatCurrency(monthlyIncome)}` : 'Registra tus propiedades'}</li>
                    <li style={{ padding: '0.5rem 0' }}>✓ Gastos del mes: {formatCurrency(monthlyExpenses)}</li>
                </ul>
            </div>
        </div>
    );
};

export default Dashboard;