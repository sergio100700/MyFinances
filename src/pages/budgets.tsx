import React, { useState, useEffect } from 'react';
import { loadData } from '../lib/storage';
import { formatCurrency } from '../lib/format';
import type { FinanceData } from '../types';
import { BudgetForm } from '../components/forms/BudgetForm';
import { TransactionForm } from '../components/forms/TransactionForm';

const Budgets: React.FC = () => {
    const [refresh, setRefresh] = useState(0);
    const [data, setData] = useState<FinanceData>({ transactions: [], investments: [], properties: [], budgets: [] });
    const currentMonth = new Date().toISOString().slice(0, 7);
    const currentYear = new Date().getFullYear().toString();
    const [viewPeriod, setViewPeriod] = useState<'monthly' | 'annual'>('monthly');
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const loadedData = await loadData();
                setData(loadedData);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        fetchData();
    }, [refresh]);

    const getBudgetPeriod = (budget: any) => budget.period ?? 'monthly';
    const getBudgetKey = (budget: any) => budget.periodKey ?? budget.month ?? '';

    const budgetsForView = data.budgets.filter((b) => {
        if (viewPeriod === 'monthly') {
            return getBudgetPeriod(b) === 'monthly' && getBudgetKey(b) === selectedMonth;
        }
        return getBudgetPeriod(b) === 'annual' && getBudgetKey(b) === selectedYear;
    });

    const transactionsForView = data.transactions.filter((t) => {
        if (t.type !== 'expense') return false;
        if (viewPeriod === 'monthly') return t.date.startsWith(selectedMonth);
        return t.date.startsWith(selectedYear);
    });

    // Calcular gastos por categoría
    const expensesByCategory = transactionsForView.reduce((acc, trans) => {
        acc[trans.category] = (acc[trans.category] || 0) + trans.amount;
        return acc;
    }, {} as Record<string, number>);

    const getProgressColor = (spent: number, budgeted: number) => {
        const percentage = (spent / budgeted) * 100;
        if (percentage > 90) return '#e74c3c';
        if (percentage > 75) return '#f39c12';
        return '#27ae60';
    };

    return (
        <div>
            <h1>💵 Presupuestos</h1>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                <select
                    value={viewPeriod}
                    onChange={(e) => setViewPeriod(e.target.value as 'monthly' | 'annual')}
                    style={{
                        padding: '0.5rem 0.75rem',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontFamily: 'inherit',
                    }}
                >
                    <option value="monthly">Mensual</option>
                    <option value="annual">Anual</option>
                </select>
                {viewPeriod === 'monthly' ? (
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        style={{
                            padding: '0.5rem 0.75rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontFamily: 'inherit',
                        }}
                    />
                ) : (
                    <input
                        type="number"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        min="2000"
                        max="2100"
                        style={{
                            padding: '0.5rem 0.75rem',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontFamily: 'inherit',
                        }}
                    />
                )}
            </div>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#666' }}>
                Presupuesto {viewPeriod === 'monthly' ? `de ${selectedMonth}` : `anual ${selectedYear}`}: <strong style={{ color: '#667eea', fontSize: '1.3rem' }}>
                    {formatCurrency(budgetsForView.reduce((sum, b) => sum + b.budgeted, 0))}
                </strong>
            </p>

            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                <div>
                    <h3 style={{ marginTop: 0 }}>Mis Presupuestos</h3>
                    <BudgetForm onSuccess={() => setRefresh(prev => prev + 1)} />
                </div>
                <div>
                    <h3 style={{ marginTop: 0 }}>Mis Transacciones</h3>
                    <TransactionForm onSuccess={() => setRefresh(prev => prev + 1)} />
                </div>
            </div>

            {budgetsForView.length > 0 && (
                <div className="card">
                    <h2>Desglose de Gastos vs Presupuesto</h2>
                    {budgetsForView.map((budget) => {
                        const spent = expensesByCategory[budget.category] || 0;
                        const percentage = Math.min((spent / budget.budgeted) * 100, 100);
                        const remaining = Math.max(budget.budgeted - spent, 0);

                        return (
                            <div key={budget.id} style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                    <div>
                                        <h4 style={{ margin: 0, marginBottom: '0.25rem' }}>{budget.category}</h4>
                                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                                            {formatCurrency(spent)} / {formatCurrency(budget.budgeted)}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: 0, fontWeight: 'bold', color: remaining > 0 ? '#27ae60' : '#e74c3c' }}>
                                            {remaining > 0 ? '+' : ''}{formatCurrency(remaining)}
                                        </p>
                                        <p style={{ margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                                            {percentage.toFixed(0)}%
                                        </p>
                                    </div>
                                </div>
                                <div style={{ height: '10px', background: '#e0e0e0', borderRadius: '5px', overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            height: '100%',
                                            width: `${percentage}%`,
                                            background: getProgressColor(spent, budget.budgeted),
                                            transition: 'width 0.3s ease',
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {budgetsForView.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: '#999', fontSize: '1.1rem' }}>No hay presupuestos registrados para este periodo. ¡Crea uno!</p>
                </div>
            )}
        </div>
    );
};

export default Budgets;