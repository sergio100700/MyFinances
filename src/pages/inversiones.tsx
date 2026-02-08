import React, { useState, useEffect } from 'react';
import { CarteraForm, CarteraList, CarteraDistribucion } from '../components/forms/CarteraComponents';
import { EscenarioForm, EscenarioList } from '../components/forms/EscenarioComponents';
import { ActivoForm, ActivoList } from '../components/forms/ActivoComponents';
import { SeguimientoForm, TablaMensual } from '../components/forms/SeguimientoComponents';
import { ActivoParticipacion } from '../components/forms/ActivoSeguimientoComponents';
import { getInversionesStore } from '../features/inversiones/inversiones.store.supabase';
import type { Cartera, MesCalculado } from '../features/inversiones/inversiones.types';

const Inversiones: React.FC = () => {
    const store = getInversionesStore();
    const [state, setState] = useState(store.getState());
    const [selectedCartera, setSelectedCartera] = useState<Cartera | null>(null);
    const [view, setView] = useState<'carteras' | 'escenarios' | 'detail'>('carteras');
    const [editingSeguimientoId, setEditingSeguimientoId] = useState<string | null>(null);
    const [editAportacionMensual, setEditAportacionMensual] = useState('');
    const [editMesInicio, setEditMesInicio] = useState('');
    const [editMesInicioAportaciones, setEditMesInicioAportaciones] = useState('');
    const [editMesFin, setEditMesFin] = useState('');

    // Suscribirse a cambios del store
    useEffect(() => {
        const unsubscribe = store.subscribe((newState) => {
            setState(newState);
        });
        return unsubscribe;
    }, [store]);

    const handleAgregarCartera = (nombre: string, descripcion?: string) => {
        store.agregarCartera(nombre, descripcion);
    };

    const handleEliminarCartera = (id: string) => {
        if (confirm('¿Eliminar esta cartera y todos sus datos?')) {
            store.eliminarCartera(id);
            if (selectedCartera?.id === id) {
                setSelectedCartera(null);
                setView('carteras');
            }
        }
    };

    const handleAgregarEscenario = (nombre: string, rentabilidad: number) => {
        store.agregarEscenario(nombre, rentabilidad);
    };

    const handleActualizarEscenario = (id: string, nombre: string, rentabilidad: number) => {
        store.actualizarEscenario(id, nombre, rentabilidad);
    };

    const handleEliminarEscenario = (id: string) => {
        if (confirm('¿Eliminar este escenario?')) {
            store.eliminarEscenario(id);
        }
    };

    const handleAgregarActivo = (nombre: string, tipo: 'fondo' | 'etf' | 'accion' | 'otro') => {
        if (selectedCartera) {
            store.agregarActivo(nombre, tipo, 1000, selectedCartera.id);
        }
    };

    const handleEliminarActivo = (id: string) => {
        store.eliminarActivo(id);
    };

    const handleActualizarValorActual = (activoId: string, valorActual: number) => {
        const activo = state.activos.find(a => a.id === activoId);
        if (activo) {
            store.agregarOActualizarValorActual(activoId, activo.nombre, 0, valorActual);
        }
    };

    const handleAgregarSeguimiento = (
        capitalInicial: number,
        aportacionMensual: number,
        mesInicio: string,
        mesInicioAportaciones: string,
        mesFin?: string
    ) => {
        if (selectedCartera) {
            store.agregarSeguimiento(
                selectedCartera.id,
                capitalInicial,
                aportacionMensual,
                mesInicio,
                mesInicioAportaciones,
                mesFin
            );
        }
    };

    const handleAgregarValorReal = (seguimientoId: string, mes: string, valorReal: number) => {
        store.agregarOActualizarRegistroReal(seguimientoId, mes, valorReal);
    };

    const handleEliminarValorReal = (seguimientoId: string, mes: string) => {
        store.eliminarRegistroReal(seguimientoId, mes);
    };

    const handleEliminarSeguimiento = (seguimientoId: string) => {
        if (confirm('¿Eliminar este seguimiento?')) {
            store.eliminarSeguimiento(seguimientoId);
            if (editingSeguimientoId === seguimientoId) {
                setEditingSeguimientoId(null);
            }
        }
    };

    const handleEditarSeguimiento = (seguimientoId: string) => {
        const seguimiento = store.obtenerSeguimiento(seguimientoId);
        if (!seguimiento) return;
        setEditingSeguimientoId(seguimientoId);
        setEditAportacionMensual(seguimiento.aportacionMensualBase.toString());
        setEditMesInicio(seguimiento.mesInicio);
        setEditMesInicioAportaciones(seguimiento.mesInicioAportaciones);
        setEditMesFin(seguimiento.mesFin || '');
    };

    const handleGuardarSeguimiento = (seguimientoId: string) => {
        const seguimiento = store.obtenerSeguimiento(seguimientoId);
        store.actualizarSeguimiento(
            seguimientoId,
            seguimiento?.capitalInicial || 0,
            parseFloat(editAportacionMensual || '0'),
            editMesInicio,
            editMesInicioAportaciones,
            editMesFin || undefined
        );
        setEditingSeguimientoId(null);
    };

    const handleSetAportacionExtra = (seguimientoId: string, mes: string, monto: number) => {
        store.setAportacionAdicional(seguimientoId, mes, monto);
    };

    const handleEliminarAportacionExtra = (seguimientoId: string, mes: string) => {
        store.eliminarAportacionAdicional(seguimientoId, mes);
    };

    const activos = selectedCartera ? store.obtenerActivosPorCartera(selectedCartera.id) : [];
    const seguimientos = selectedCartera ? store.obtenerSeguimientosPorCartera(selectedCartera.id) : [];

    // Calcular todos los seguimientos
    const calculosSeguimientos: {
        seguimientoId: string;
        mesesBase: MesCalculado[];
        resultadosPorEscenario: Map<string, MesCalculado[]>;
    }[] = [];

    for (const seguimiento of seguimientos) {
        const calculos = store.calcularSeguimiento(seguimiento.id);
        const primerEscenarioId = state.escenarios[0]?.id;
        const mesesBase = primerEscenarioId ? calculos.get(primerEscenarioId) || [] : [];
        calculosSeguimientos.push({
            seguimientoId: seguimiento.id,
            mesesBase,
            resultadosPorEscenario: calculos,
        });
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            <h1>💼 Seguimiento de Inversiones</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
                Gestiona tus carteras, activos y escenarios de inversión con cálculos de interés compuesto.
            </p>

            {/* NAVEGACIÓN */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #ddd', paddingBottom: '1rem' }}>
                <button
                    onClick={() => {
                        setView('carteras');
                        setSelectedCartera(null);
                    }}
                    style={{
                        padding: '0.5rem 1rem',
                        background: view === 'carteras' ? '#1976d2' : '#f0f0f0',
                        color: view === 'carteras' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                    }}
                >
                    📊 Carteras
                </button>
                <button
                    onClick={() => setView('escenarios')}
                    style={{
                        padding: '0.5rem 1rem',
                        background: view === 'escenarios' ? '#1976d2' : '#f0f0f0',
                        color: view === 'escenarios' ? 'white' : 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                    }}
                >
                    📈 Escenarios
                </button>
                {selectedCartera && (
                    <button
                        onClick={() => setView('detail')}
                        style={{
                            padding: '0.5rem 1rem',
                            background: view === 'detail' ? '#1976d2' : '#f0f0f0',
                            color: view === 'detail' ? 'white' : 'black',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                        }}
                    >
                        🎯 {selectedCartera.nombre}
                    </button>
                )}
            </div>

            {/* VISTA: CARTERAS */}
            {view === 'carteras' && (
                <div>
                    <CarteraForm onSubmit={handleAgregarCartera} />
                    
                    {/* Calcular valores de carteras */}
                    {state.carteras.length > 0 && (
                        (() => {
                            const valoresCartera: Record<string, number> = {};
                            state.carteras.forEach(cartera => {
                                const activosCartera = state.activos.filter(a => a.carteraId === cartera.id);
                                const valor = activosCartera.reduce((sum, activo) => {
                                    const valorActual = state.activosValoresActuales.find(v => v.activoId === activo.id)?.valorActual ?? activo.capitalInicial;
                                    return sum + valorActual;
                                }, 0);
                                valoresCartera[cartera.id] = valor;
                            });

                            return (
                                <>
                                    <CarteraList
                                        carteras={state.carteras}
                                        valoresCartera={valoresCartera}
                                        onSelect={(cartera) => {
                                            setSelectedCartera(cartera);
                                            setView('detail');
                                        }}
                                        onDelete={handleEliminarCartera}
                                    />
                                    <CarteraDistribucion 
                                        carteras={state.carteras}
                                        valoresCartera={valoresCartera}
                                    />
                                </>
                            );
                        })()
                    )}
                </div>
            )}

            {/* VISTA: ESCENARIOS */}
            {view === 'escenarios' && (
                <div>
                    <EscenarioForm onSubmit={handleAgregarEscenario} />
                    <EscenarioList
                        escenarios={state.escenarios}
                        onUpdate={handleActualizarEscenario}
                        onDelete={handleEliminarEscenario}
                    />
                </div>
            )}

            {/* VISTA: DETALLE DE CARTERA */}
            {view === 'detail' && selectedCartera && (
                <div>
                    <h2>{selectedCartera.nombre}</h2>
                    {selectedCartera.descripcion && (
                        <p style={{ color: '#666', marginBottom: '1rem' }}>{selectedCartera.descripcion}</p>
                    )}

                    {/* ACTIVOS */}
                    <section style={{ marginBottom: '2rem', borderTop: '2px solid #eee', paddingTop: '1rem' }}>
                        <h3>🏦 Activos</h3>
                        <ActivoForm
                            carteraId={selectedCartera.id}
                            onSubmit={handleAgregarActivo}
                        />
                        <ActivoList 
                            activos={activos}
                            valoresActuales={Object.fromEntries(
                                state.activosValoresActuales.map(a => [a.activoId, a.valorActual])
                            )}
                            onDelete={handleEliminarActivo}
                            onActualizarValor={handleActualizarValorActual}
                        />
                        
                        {/* Gráfico de Distribución */}
                        {activos.length > 0 && (
                            <ActivoParticipacion 
                                activosValores={activos.map(a => ({
                                    id: a.id,
                                    activoId: a.id,
                                    nombre: a.nombre,
                                    cantidadActual: 0,
                                    valorActual: state.activosValoresActuales.find(v => v.activoId === a.id)?.valorActual ?? a.capitalInicial,
                                    fecha: new Date().toISOString().split('T')[0]
                                }))}
                            />
                        )}
                    </section>

                    {/* SEGUIMIENTOS */}
                    <section style={{ marginBottom: '2rem', borderTop: '2px solid #eee', paddingTop: '1rem' }}>
                        <h3>📅 Seguimientos por Escenario</h3>
                        <SeguimientoForm
                            carteraId={selectedCartera.id}
                            onSubmit={handleAgregarSeguimiento}
                        />

                        {calculosSeguimientos.length === 0 ? (
                            <p style={{ color: '#666', background: '#f5f5f5', padding: '1rem', borderRadius: '4px' }}>
                                No hay seguimientos. Crea uno nuevo para comenzar a hacer seguimiento.
                            </p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                                {calculosSeguimientos.map((calculo) => {
                                    const seguimiento = store.obtenerSeguimiento(calculo.seguimientoId);
                                    if (!seguimiento) return null;
                                    const valoresReales = seguimiento
                                        ? store.obtenerRegistrosReales(seguimiento.id)
                                        : [];
                                    const ultimoMes = calculo.mesesBase[calculo.mesesBase.length - 1];

                                    return (
                                        <div
                                            key={calculo.seguimientoId}
                                            style={{
                                                border: '1px solid #e0e0e0',
                                                borderRadius: '4px',
                                                padding: '1rem',
                                                background: '#fafafa',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    marginBottom: '1rem',
                                                }}
                                            >
                                                <h4 style={{ margin: 0 }}>Seguimiento</h4>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button
                                                        onClick={() => handleEditarSeguimiento(seguimiento.id)}
                                                        style={{ padding: '0.25rem 0.75rem' }}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleEliminarSeguimiento(seguimiento.id)}
                                                        style={{
                                                            padding: '0.25rem 0.75rem',
                                                            color: '#d32f2f',
                                                            background: 'none',
                                                            border: '1px solid #d32f2f',
                                                            borderRadius: '4px',
                                                        }}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>

                                            {editingSeguimientoId === seguimiento.id && (
                                                <div
                                                    style={{
                                                        marginBottom: '1rem',
                                                        padding: '1rem',
                                                        background: 'white',
                                                        borderRadius: '4px',
                                                        border: '1px solid #e0e0e0',
                                                    }}
                                                >
                                                    <h5 style={{ marginTop: 0 }}>Editar seguimiento</h5>
                                                    <div
                                                        style={{
                                                            display: 'grid',
                                                            gridTemplateColumns: '1fr 1fr 1fr 1fr',
                                                            gap: '0.5rem',
                                                            marginBottom: '0.5rem',
                                                        }}
                                                    >
                                                        <label>
                                                            Aportación mensual (€):
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                value={editAportacionMensual}
                                                                onChange={(e) => setEditAportacionMensual(e.target.value)}
                                                                required
                                                            />
                                                        </label>
                                                        <label>
                                                            Mes inicio seguimiento:
                                                            <input
                                                                type="month"
                                                                value={editMesInicio}
                                                                onChange={(e) => setEditMesInicio(e.target.value)}
                                                                required
                                                            />
                                                        </label>
                                                        <label>
                                                            Mes inicio aportaciones:
                                                            <input
                                                                type="month"
                                                                value={editMesInicioAportaciones}
                                                                onChange={(e) => setEditMesInicioAportaciones(e.target.value)}
                                                                required
                                                            />
                                                        </label>
                                                        <label>
                                                            Mes fin (proyección):
                                                            <input
                                                                type="month"
                                                                value={editMesFin}
                                                                onChange={(e) => setEditMesFin(e.target.value)}
                                                            />
                                                        </label>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button
                                                            onClick={() => handleGuardarSeguimiento(seguimiento.id)}
                                                            style={{ padding: '0.25rem 0.75rem' }}
                                                        >
                                                            Guardar
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingSeguimientoId(null)}
                                                            style={{ padding: '0.25rem 0.75rem' }}
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* TABLA PRINCIPAL */}
                                            <TablaMensual
                                                mesesBase={calculo.mesesBase}
                                                escenarios={state.escenarios}
                                                resultadosPorEscenario={calculo.resultadosPorEscenario}
                                                mostrarReal={valoresReales.length > 0}
                                                valoresReales={valoresReales.reduce<Record<string, number>>((acc, r) => {
                                                    acc[r.mes] = r.valorReal;
                                                    return acc;
                                                }, {})}
                                                onSetValorReal={(m, vr) => handleAgregarValorReal(seguimiento.id, m, vr)}
                                                onDeleteValorReal={(m) => handleEliminarValorReal(seguimiento.id, m)}
                                                aportacionesExtra={seguimiento?.aportacionesAdicionales.reduce<Record<string, number>>(
                                                    (acc, a) => {
                                                        acc[a.mes] = a.monto;
                                                        return acc;
                                                    },
                                                    {}
                                                )}
                                                onSetAportacionExtra={(m, monto) => handleSetAportacionExtra(seguimiento.id, m, monto)}
                                                onDeleteAportacionExtra={(m) => handleEliminarAportacionExtra(seguimiento.id, m)}
                                            />

                                            {/* RESUMEN */}
                                            {ultimoMes && (
                                                <div
                                                    style={{
                                                        marginTop: '1rem',
                                                        padding: '1rem',
                                                        background: 'white',
                                                        borderRadius: '4px',
                                                        display: 'grid',
                                                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                        gap: '1rem',
                                                    }}
                                                >
                                                    <div>
                                                        <p style={{ color: '#666', fontSize: '0.9rem' }}>Total Aportado</p>
                                                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1976d2' }}>
                                                            €{ultimoMes.capitalAportado.toFixed(2)}
                                                        </p>
                                                    </div>
                                                    {state.escenarios.map((escenario) => {
                                                        const serie = calculo.resultadosPorEscenario.get(escenario.id) || [];
                                                        const ultimoEsc = serie[serie.length - 1];
                                                        if (!ultimoEsc) return null;
                                                        return (
                                                            <div key={escenario.id}>
                                                                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                                                                    {escenario.nombre} (proyección)
                                                                </p>
                                                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2e7d32' }}>
                                                                    €{ultimoEsc.capitalConInteres.toFixed(2)}
                                                                </p>
                                                                <p
                                                                    style={{
                                                                        fontSize: '0.9rem',
                                                                        color:
                                                                            ultimoEsc.rentabilidadMes > 0
                                                                                ? '#2e7d32'
                                                                                : '#d32f2f',
                                                                    }}
                                                                >
                                                                    Rendimiento: €{ultimoEsc.rentabilidadMes.toFixed(2)}
                                                                </p>
                                                            </div>
                                                        );
                                                    })}
                                                    {ultimoMes.valorReal && (
                                                        <>
                                                            <div>
                                                                <p style={{ color: '#666', fontSize: '0.9rem' }}>Valor Real Actual</p>
                                                                <p
                                                                    style={{
                                                                        fontSize: '1.2rem',
                                                                        fontWeight: 'bold',
                                                                        color: '#ff9800',
                                                                    }}
                                                                >
                                                                    €{ultimoMes.valorReal.toFixed(2)}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <p style={{ color: '#666', fontSize: '0.9rem' }}>Rendimiento Real</p>
                                                                <p
                                                                    style={{
                                                                        fontSize: '1.2rem',
                                                                        fontWeight: 'bold',
                                                                        color:
                                                                            ultimoMes.rentabilidadReal && ultimoMes.rentabilidadReal > 0
                                                                                ? '#2e7d32'
                                                                                : ultimoMes.rentabilidadReal && ultimoMes.rentabilidadReal < 0
                                                                                  ? '#d32f2f'
                                                                                  : '#666',
                                                                    }}
                                                                >
                                                                    €{ultimoMes.rentabilidadReal?.toFixed(2) || '0.00'}
                                                                </p>
                                                                <p style={{ margin: 0, color: '#666', fontSize: '0.85rem' }}>
                                                                    {ultimoMes.rentabilidadReal !== undefined
                                                                        ? `${((ultimoMes.rentabilidadReal / Math.max(ultimoMes.capitalAportado, 1)) * 100).toFixed(2)}%`
                                                                        : '0.00%'}
                                                                </p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    );
};

export default Inversiones;
