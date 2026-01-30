import React, { useState, useEffect } from 'react';
import { loadData } from '../lib/storage';
import { formatCurrency } from '../lib/format';
import type { FinanceData } from '../types';
import { PropertyForm } from '../components/forms/PropertyForm';

const RealEstate: React.FC = () => {
    const [refresh, setRefresh] = useState(0);
    const [data, setData] = useState<FinanceData>({ transactions: [], investments: [], properties: [], budgets: [] });

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

    const totalValue = data.properties.reduce((sum, p) => sum + p.value, 0);
    const totalMortgage = data.properties.reduce((sum, p) => sum + p.mortgage, 0);
    const totalEquity = totalValue - totalMortgage;
    const monthlyIncome = data.properties.reduce((sum, p) => sum + p.monthlyRent * ((p.occupancy ?? 100) / 100), 0);
    const annualMortgagePayments = data.properties.reduce((sum, p) => sum + (p.mortgagePayment ?? 0) * 12, 0);
    const annualCosts = data.properties.reduce((sum, p) => sum + (p.annualCosts ?? 0), 0);
    const annualNetCashFlow = monthlyIncome * 12 - annualMortgagePayments - annualCosts;

    return (
        <div>
            <h1>🏠 Inversiones Inmobiliarias</h1>
            <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#666' }}>
                Patrimonio inmobiliario: <strong style={{ color: '#667eea', fontSize: '1.3rem' }}>{formatCurrency(totalValue)}</strong>
            </p>

            <PropertyForm onSuccess={() => setRefresh(prev => prev + 1)} />

            {data.properties.length > 0 && (
                <>
                    <div className="grid-cards grid-cards--sm">
                        <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                            <h3 style={{ color: 'white', fontSize: '0.85rem' }}>VALOR TOTAL</h3>
                            <p style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0.5rem 0', color: 'white' }}>{formatCurrency(totalValue)}</p>
                        </div>
                        <div className="card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
                            <h3 style={{ color: 'white', fontSize: '0.85rem' }}>PATRIMONIO NETO</h3>
                            <p style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0.5rem 0', color: 'white' }}>{formatCurrency(totalEquity)}</p>
                        </div>
                        <div className="card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
                            <h3 style={{ color: 'white', fontSize: '0.85rem' }}>INGRESOS MENSUALES</h3>
                            <p style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: '0.5rem 0', color: 'white' }}>{formatCurrency(monthlyIncome)}</p>
                        </div>
                    </div>

                    <div className="card">
                        <h2>Mis Propiedades</h2>
                        <div className="grid-cards grid-cards--md">
                            {data.properties.map((prop) => {
                                const annualGrossIncome = prop.monthlyRent * ((prop.occupancy ?? 100) / 100) * 12;
                                const annualNetIncome = annualGrossIncome - (prop.mortgagePayment ?? 0) * 12 - (prop.annualCosts ?? 0);

                                return (
                                <div key={prop.id} style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '8px' }}>
                                    <h3 style={{ margin: '0 0 1rem 0' }}>{prop.name}</h3>
                                    <div className="grid-2 grid-2--tight">
                                        <div>
                                            <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>Valor Catastral</p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold' }}>{formatCurrency(prop.value)}</p>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>Hipoteca</p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold' }}>{formatCurrency(prop.mortgage)}</p>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>Pago Hipoteca Mensual</p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold' }}>{formatCurrency(prop.mortgagePayment ?? 0)}</p>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>Renta Mensual</p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold' }}>{formatCurrency(prop.monthlyRent)}</p>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>Costes Anuales</p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold' }}>{formatCurrency(prop.annualCosts ?? 0)}</p>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>Apreciación</p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold', color: '#27ae60' }}>+{prop.appreciation}%</p>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>Ocupación</p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold' }}>{prop.occupancy}%</p>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>Patrimonio</p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold' }}>{formatCurrency(prop.value - prop.mortgage)}</p>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>Flujo Neto Anual</p>
                                            <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold', color: annualNetIncome >= 0 ? '#27ae60' : '#e74c3c' }}>
                                                {formatCurrency(annualNetIncome)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="card">
                        <h2>Análisis de Rentabilidad</h2>
                        <p>ROI Promedio: <strong>{(data.properties.reduce((sum, p) => sum + p.appreciation, 0) / data.properties.length).toFixed(2)}%</strong> anual</p>
                        <p>Deuda Total: <strong>{formatCurrency(totalMortgage)}</strong> (LTV: {totalValue > 0 ? ((totalMortgage / totalValue) * 100).toFixed(2) : '0.00'}%)</p>
                        <p>Flujo Neto Anual (estimado): <strong>{formatCurrency(annualNetCashFlow)}</strong></p>
                    </div>
                </>
            )}

            {data.properties.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: '#999', fontSize: '1.1rem' }}>No hay propiedades registradas. ¡Agrega la primera!</p>
                </div>
            )}
        </div>
    );
};

export default RealEstate;