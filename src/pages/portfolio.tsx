import React, { useState, useEffect } from 'react';
import { loadData, deleteInvestment, updateInvestment } from '../lib/storage';
import { formatCurrency } from '../lib/format';
import type { FinanceData, Investment } from '../types';
import { InvestmentForm } from '../components/forms/InvestmentForm';
import { ContributionManager } from '../components/forms/ContributionManager';
import { PortfolioChart } from '../components/charts/PortfolioChart';
import { fetchMultiplePrices } from '../lib/yahooFinance';

const Portfolio: React.FC = () => {
    const [refresh, setRefresh] = useState(0);
    const [updating, setUpdating] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [contributionManagerOpen, setContributionManagerOpen] = useState<string | null>(null);
    const [data, setData] = useState<FinanceData>({ transactions: [], investments: [], properties: [], budgets: [] });
    const [editData, setEditData] = useState({
        name: '',
        isin: '',
        shares: 0,
        purchasePrice: 0,
        amount: 0,
        currentValue: 0,
        savingsRate: 0,
        valuationMode: 'auto' as 'auto' | 'manual',
    });

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

    const getDaysBetween = (fromDate: string, toDate: string) => {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
        const diffMs = to.getTime() - from.getTime();
        return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    };

    // Update prices on component mount and when refresh changes
    useEffect(() => {
        const updatePrices = async () => {
            if (data.investments.length === 0) return;
            
            setUpdating(true);
            try {
                const autoInvestments = data.investments.filter(
                    inv => inv.valuationMode !== 'manual' && inv.type !== 'savings'
                );
                const isins = autoInvestments.map(inv => inv.isin);
                const priceMap = await fetchMultiplePrices(isins);
                
                // Update each investment with new price
                const updates: Promise<Investment | null>[] = [];
                
                data.investments.forEach(inv => {
                    if (inv.valuationMode === 'manual' || inv.type === 'savings') return;
                    const newPrice = priceMap.get(inv.isin);
                    if (newPrice !== null && newPrice !== undefined && newPrice !== inv.currentPrice) {
                        updates.push(
                            updateInvestment(inv.id, {
                                currentPrice: newPrice,
                                currentValue: inv.shares * newPrice,
                            })
                        );
                    }
                });

                const savingsInvestments = data.investments.filter(inv => inv.type === 'savings');
                if (savingsInvestments.length > 0) {
                    const today = new Date().toISOString().split('T')[0];

                    savingsInvestments.forEach(inv => {
                        const rate = inv.savingsRate ?? 0;
                        const lastUpdate = inv.savingsLastUpdate ?? inv.purchaseDate ?? today;
                        const days = getDaysBetween(lastUpdate, today);

                        if (rate > 0 && days > 0) {
                            const interest = inv.currentValue * (rate / 100) * (days / 365);
                            updates.push(
                                updateInvestment(inv.id, {
                                    currentValue: inv.currentValue + interest,
                                    savingsLastUpdate: today,
                                })
                            );
                        }
                    });
                }
                
                if (updates.length > 0) {
                    await Promise.all(updates);
                    setRefresh(prev => prev + 1);
                }
            } catch (error) {
                console.error('Error updating prices:', error);
            } finally {
                setUpdating(false);
            }
        };
        
        updatePrices();
    }, [refresh]);
    
    const handleRefreshPrices = async () => {
        setRefresh(prev => prev + 1);
    };

    const startEdit = (invId: string) => {
        const inv = data.investments.find(i => i.id === invId);
        if (!inv) return;
        setEditingId(invId);
        setEditData({
            name: inv.name,
            isin: inv.isin,
            shares: inv.shares,
            purchasePrice: inv.purchasePrice,
            amount: inv.amount,
            currentValue: inv.currentValue,
            savingsRate: inv.savingsRate ?? 0,
            valuationMode: inv.valuationMode ?? 'auto',
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const saveEdit = async (invId: string) => {
        const inv = data.investments.find(i => i.id === invId);
        if (!inv) return;

        if (inv.type === 'savings') {
            const today = new Date().toISOString().split('T')[0];
            const rateChanged = editData.savingsRate !== (inv.savingsRate ?? 0);

            await updateInvestment(invId, {
                name: editData.name || inv.name,
                isin: '',
                shares: 0,
                purchasePrice: 0,
                amount: editData.amount,
                currentValue: editData.currentValue,
                currentPrice: undefined,
                valuationMode: 'manual',
                savingsRate: editData.savingsRate,
                savingsLastUpdate: rateChanged ? today : inv.savingsLastUpdate,
            });
        } else if (editData.valuationMode === 'manual') {
            await updateInvestment(invId, {
                name: editData.name || inv.name,
                isin: editData.isin,
                shares: 0,
                purchasePrice: 0,
                amount: editData.amount,
                currentValue: editData.currentValue,
                currentPrice: undefined,
                valuationMode: 'manual',
            });
        } else {
            const amount = editData.shares * editData.purchasePrice;
            const currentValue = inv.currentPrice ? editData.shares * inv.currentPrice : inv.currentValue;

            await updateInvestment(invId, {
                name: editData.name || inv.name,
                isin: editData.isin,
                shares: editData.shares,
                purchasePrice: editData.purchasePrice,
                amount,
                currentValue,
                valuationMode: 'auto',
            });
        }

        setEditingId(null);
        setRefresh(prev => prev + 1);
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Eliminar esta inversión?')) {
            await deleteInvestment(id);
            setRefresh(prev => prev + 1);
        }
    };

    const totalInvested = data.investments.reduce((sum, inv) => sum + inv.amount, 0);
    const totalValue = data.investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalReturn = totalValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? ((totalReturn / totalInvested) * 100).toFixed(1) : '0';

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h1>📈 Cartera de Inversiones {updating && <span style={{ fontSize: '0.8rem', color: '#667eea' }}>⏳ Actualizando...</span>}</h1>
                <button
                    onClick={handleRefreshPrices}
                    disabled={updating}
                    style={{
                        padding: '0.5rem 1rem',
                        background: updating ? '#95a5a6' : '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: updating ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                    }}
                >
                    🔄 Actualizar Precios
                </button>
            </div>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#666' }}>
                Rendimiento total: <strong style={{ color: '#667eea', fontSize: '1.3rem' }}>
                    {totalReturn >= 0 ? '+' : ''}{returnPercentage}% ({totalReturn >= 0 ? '+' : ''}{formatCurrency(totalReturn)})
                </strong>
            </p>

            <InvestmentForm onSuccess={() => setRefresh(prev => prev + 1)} />

            {data.investments.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: '#999', fontSize: '1.1rem' }}>No hay inversiones registradas. ¡Agrega la primera!</p>
                </div>
            ) : (
                <>
                    <div className="grid-cards grid-cards--md">
                        <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                            <h3 style={{ color: 'white', margin: 0, marginBottom: '0.5rem' }}>INVERTIDO</h3>
                            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0', color: 'white' }}>{formatCurrency(totalInvested)}</p>
                        </div>
                        <div className="card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                            <h3 style={{ color: 'white', margin: 0, marginBottom: '0.5rem' }}>VALOR ACTUAL</h3>
                            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0', color: 'white' }}>{formatCurrency(totalValue)}</p>
                        </div>
                        <div className="card" style={{ background: totalReturn >= 0 ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)', color: 'white' }}>
                            <h3 style={{ color: 'white', margin: 0, marginBottom: '0.5rem' }}>RETORNO</h3>
                            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0', color: 'white' }}>{totalReturn >= 0 ? '+' : ''}{formatCurrency(totalReturn)}</p>
                        </div>
                    </div>

                    <PortfolioChart investments={data.investments} />

                    <div className="card" style={{ marginTop: '2rem' }}>
                        <h2>Mis Inversiones</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #667eea' }}>
                                    <th style={{ textAlign: 'left', padding: '1rem', color: '#667eea' }}>Nombre / ISIN</th>
                                    <th style={{ textAlign: 'right', padding: '1rem', color: '#667eea' }}>Acciones</th>
                                    <th style={{ textAlign: 'right', padding: '1rem', color: '#667eea' }}>Precio Compra</th>
                                    <th style={{ textAlign: 'right', padding: '1rem', color: '#667eea' }}>Precio Actual</th>
                                    <th style={{ textAlign: 'right', padding: '1rem', color: '#667eea' }}>Invertido</th>
                                    <th style={{ textAlign: 'right', padding: '1rem', color: '#667eea' }}>Valor Actual</th>
                                    <th style={{ textAlign: 'right', padding: '1rem', color: '#667eea' }}>Retorno</th>
                                    <th style={{ textAlign: 'center', padding: '1rem', color: '#667eea' }}>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.investments.map((inv) => {
                                    const gain = inv.currentValue - inv.amount;
                                    const gainPct = inv.amount > 0 ? ((gain / inv.amount) * 100).toFixed(1) : '0.0';
                                    return (
                                        <tr key={inv.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '1rem' }}>
                                                {editingId === inv.id ? (
                                                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                                                        <input
                                                            type="text"
                                                            value={editData.name}
                                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                                            placeholder="Nombre"
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.4rem',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '4px',
                                                                fontFamily: 'inherit',
                                                            }}
                                                        />
                                                        <input
                                                            type="text"
                                                            value={editData.isin}
                                                            onChange={(e) => setEditData({ ...editData, isin: e.target.value })}
                                                            placeholder="ISIN o Ticker"
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.4rem',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '4px',
                                                                fontFamily: 'inherit',
                                                            }}
                                                        />
                                                        {inv.type === 'savings' && (
                                                            <input
                                                                type="number"
                                                                value={editData.savingsRate}
                                                                onChange={(e) => setEditData({ ...editData, savingsRate: parseFloat(e.target.value) })}
                                                                placeholder="% anual"
                                                                step="0.01"
                                                                min="0"
                                                                style={{
                                                                    width: '100%',
                                                                    padding: '0.4rem',
                                                                    border: '1px solid #ddd',
                                                                    borderRadius: '4px',
                                                                    fontFamily: 'inherit',
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <strong>{inv.name}</strong>
                                                        <br />
                                                        <small style={{ color: '#666' }}>
                                                            {inv.type === 'savings'
                                                                ? `Ahorro remunerado ${inv.savingsRate !== undefined ? `· ${inv.savingsRate.toFixed(2)}%` : ''}`
                                                                : inv.valuationMode === 'manual'
                                                                    ? 'Manual'
                                                                    : inv.isin}
                                                        </small>
                                                    </>
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right', padding: '1rem' }}>
                                                {editingId === inv.id ? (
                                                    editData.valuationMode === 'manual' ? (
                                                        '-'
                                                    ) : (
                                                        <input
                                                            type="number"
                                                            value={editData.shares}
                                                            onChange={(e) => setEditData({ ...editData, shares: parseFloat(e.target.value) })}
                                                            step="0.000001"
                                                            min="0"
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.4rem',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '4px',
                                                                fontFamily: 'inherit',
                                                                textAlign: 'right',
                                                            }}
                                                        />
                                                    )
                                                ) : (
                                                    inv.valuationMode === 'manual' ? '-' : inv.shares.toFixed(6)
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right', padding: '1rem' }}>
                                                {editingId === inv.id ? (
                                                    editData.valuationMode === 'manual' ? (
                                                        '-'
                                                    ) : (
                                                        <input
                                                            type="number"
                                                            value={editData.purchasePrice}
                                                            onChange={(e) => setEditData({ ...editData, purchasePrice: parseFloat(e.target.value) })}
                                                            step="0.01"
                                                            min="0"
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.4rem',
                                                                border: '1px solid #ddd',
                                                                borderRadius: '4px',
                                                                fontFamily: 'inherit',
                                                                textAlign: 'right',
                                                            }}
                                                        />
                                                    )
                                                ) : (
                                                    inv.valuationMode === 'manual' ? '-' : formatCurrency(inv.purchasePrice)
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right', padding: '1rem', fontWeight: 'bold' }}>
                                                {inv.valuationMode === 'manual' ? '-' : (inv.currentPrice ? formatCurrency(inv.currentPrice) : '-')}
                                            </td>
                                            <td style={{ textAlign: 'right', padding: '1rem' }}>
                                                {editingId === inv.id && editData.valuationMode === 'manual' ? (
                                                    <input
                                                        type="number"
                                                        value={editData.amount}
                                                        onChange={(e) => setEditData({ ...editData, amount: parseFloat(e.target.value) })}
                                                        step="0.01"
                                                        min="0"
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.4rem',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            fontFamily: 'inherit',
                                                            textAlign: 'right',
                                                        }}
                                                    />
                                                ) : (
                                                    formatCurrency(inv.amount)
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right', padding: '1rem', fontWeight: 'bold' }}>
                                                {editingId === inv.id && editData.valuationMode === 'manual' ? (
                                                    <input
                                                        type="number"
                                                        value={editData.currentValue}
                                                        onChange={(e) => setEditData({ ...editData, currentValue: parseFloat(e.target.value) })}
                                                        step="0.01"
                                                        min="0"
                                                        style={{
                                                            width: '100%',
                                                            padding: '0.4rem',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            fontFamily: 'inherit',
                                                            textAlign: 'right',
                                                        }}
                                                    />
                                                ) : (
                                                    formatCurrency(inv.currentValue)
                                                )}
                                            </td>
                                            <td style={{ textAlign: 'right', padding: '1rem', color: gain >= 0 ? '#27ae60' : '#e74c3c', fontWeight: 'bold' }}>
                                                {gain >= 0 ? '+' : ''}{gainPct}% ({gain >= 0 ? '+' : ''}{formatCurrency(gain)})
                                            </td>
                                            <td style={{ textAlign: 'center', padding: '1rem' }}>
                                                {editingId === inv.id ? (
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                        <button
                                                            onClick={() => saveEdit(inv.id)}
                                                            style={{
                                                                padding: '0.5rem 0.8rem',
                                                                background: '#27ae60',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            style={{
                                                                padding: '0.5rem 0.8rem',
                                                                background: '#95a5a6',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                                                        <button
                                                            onClick={() => setContributionManagerOpen(inv.id)}
                                                            title="Agregar aportaciones mensuales, semanales o extras"
                                                            style={{
                                                                padding: '0.5rem 0.8rem',
                                                                background: '#2196f3',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                                fontSize: '0.9rem',
                                                            }}
                                                        >
                                                            📊
                                                        </button>
                                                        <button
                                                            onClick={() => startEdit(inv.id)}
                                                            style={{
                                                                padding: '0.5rem 0.8rem',
                                                                background: '#667eea',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            ✎
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(inv.id)}
                                                            style={{
                                                                padding: '0.5rem 0.8rem',
                                                                background: '#e74c3c',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '4px',
                                                                cursor: 'pointer',
                                                            }}
                                                        >
                                                            🗑
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {contributionManagerOpen && (
                <ContributionManager
                    investment={data.investments.find(inv => inv.id === contributionManagerOpen)!}
                    onClose={() => setContributionManagerOpen(null)}
                    onUpdate={() => {
                        setContributionManagerOpen(null);
                        setRefresh(prev => prev + 1);
                    }}
                />
            )}
        </div>
    );
};

export default Portfolio;