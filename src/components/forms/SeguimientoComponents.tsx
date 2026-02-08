import React, { useState } from 'react';
import type { Escenario, MesCalculado } from '../../features/inversiones/inversiones.types';

interface SeguimientoFormProps {
    carteraId: string;
    onSubmit: (
        capitalInicial: number,
        aportacionMensual: number,
        mesInicio: string,
        mesInicioAportaciones: string,
        mesFin?: string
    ) => void;
    isLoading?: boolean;
}

export const SeguimientoForm: React.FC<SeguimientoFormProps> = ({
    onSubmit,
    isLoading,
}) => {
    const [capitalInicial, setCapitalInicial] = useState('0');
    const [aportacionMensual, setAportacionMensual] = useState('500');
    const [mesInicio, setMesInicio] = useState(new Date().toISOString().slice(0, 7));
    const [mesInicioAportaciones, setMesInicioAportaciones] = useState(
        new Date().toISOString().slice(0, 7)
    );
    const [mesFin, setMesFin] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(
            parseFloat(capitalInicial),
            parseFloat(aportacionMensual),
            mesInicio,
            mesInicioAportaciones,
            mesFin || undefined
        );
        setCapitalInicial('0');
        setAportacionMensual('500');
    };

    return (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
            <h4>Nuevo Seguimiento</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <label>
                    Capital Inicial (€):
                    <input
                        type="number"
                        step="0.01"
                        value={capitalInicial}
                        onChange={(e) => setCapitalInicial(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Aportación Mensual (€):
                    <input
                        type="number"
                        step="0.01"
                        value={aportacionMensual}
                        onChange={(e) => setAportacionMensual(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Mes Inicio Seguimiento:
                    <input
                        type="month"
                        value={mesInicio}
                        onChange={(e) => setMesInicio(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Mes Inicio Aportaciones:
                    <input
                        type="month"
                        value={mesInicioAportaciones}
                        onChange={(e) => setMesInicioAportaciones(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Mes Fin (proyección):
                    <input
                        type="month"
                        value={mesFin}
                        onChange={(e) => setMesFin(e.target.value)}
                        placeholder="Opcional"
                    />
                </label>
            </div>
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Creando...' : 'Crear Seguimiento'}
            </button>
        </form>
    );
};

interface ValorRealFormProps {
    mes: string;
    capitalAportado: number;
    onSubmit: (mes: string, valorReal: number) => void;
    onDelete?: (mes: string) => void;
    valorActual?: number;
}

export const ValorRealForm: React.FC<ValorRealFormProps> = ({
    mes,
    capitalAportado,
    onSubmit,
    onDelete,
    valorActual,
}) => {
    const [valor, setValor] = useState(valorActual?.toString() || capitalAportado.toString());
    const rentabilidadCalculada = parseFloat(valor) - capitalAportado;
    const porcentajeCalculado = capitalAportado > 0
        ? (rentabilidadCalculada / capitalAportado) * 100
        : 0;

    const handleSubmit = () => {
        onSubmit(mes, parseFloat(valor));
    };

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto auto auto',
                gap: '0.5rem',
                alignItems: 'center',
                padding: '0.5rem',
                background: '#f9f9f9',
                borderRadius: '4px',
                marginBottom: '0.5rem',
            }}
        >
            <span style={{ fontWeight: 'bold', minWidth: '80px' }}>{mes}</span>
            <div>
                <input
                    type="number"
                    step="0.01"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="Valor real/actual"
                    style={{ width: '100%' }}
                />
                <small style={{ color: '#666' }}>Aportado: €{capitalAportado.toFixed(2)}</small>
            </div>
            <div style={{ textAlign: 'right', minWidth: '120px' }}>
                <div style={{ fontWeight: 'bold', color: rentabilidadCalculada >= 0 ? '#2e7d32' : '#d32f2f' }}>
                    €{rentabilidadCalculada.toFixed(2)}
                </div>
                <small style={{ color: '#666' }}>
                    {porcentajeCalculado.toFixed(2)}%
                </small>
            </div>
            <button onClick={handleSubmit} style={{ padding: '0.25rem 0.75rem' }}>
                Guardar
            </button>
            {onDelete && (
                <button
                    onClick={() => onDelete(mes)}
                    style={{
                        padding: '0.25rem 0.5rem',
                        color: '#d32f2f',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    ✕
                </button>
            )}
        </div>
    );
};

interface TablaMensualProps {
    mesesBase: MesCalculado[];
    escenarios: Escenario[];
    resultadosPorEscenario: Map<string, MesCalculado[]>;
    mostrarReal?: boolean;
    valoresReales?: Record<string, number>;
    onSetValorReal?: (mes: string, valorReal: number) => void;
    onDeleteValorReal?: (mes: string) => void;
    aportacionesExtra?: Record<string, number>;
    onSetAportacionExtra?: (mes: string, monto: number) => void;
    onDeleteAportacionExtra?: (mes: string) => void;
}

export const TablaMensual: React.FC<TablaMensualProps> = ({
    mesesBase,
    escenarios,
    resultadosPorEscenario,
    mostrarReal = false,
    valoresReales,
    onSetValorReal,
    onDeleteValorReal,
    aportacionesExtra,
    onSetAportacionExtra,
    onDeleteAportacionExtra,
}) => {
    const formatearMoneda = (valor: number) => `€${valor.toFixed(2)}`;
    const formatearPorcentaje = (valor: number, base: number) =>
        base > 0 ? `${((valor / base) * 100).toFixed(2)}%` : '0.00%';
    const mostrarColumnaReal = mostrarReal || !!onSetValorReal;

    return (
        <div style={{ marginTop: '1.5rem', overflowX: 'auto' }}>
            <h4>Seguimiento - Aportaciones + Escenarios</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #ddd', background: '#f5f5f5' }}>
                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Mes</th>
                        <th style={{ textAlign: 'right', padding: '0.5rem' }}>Aportación</th>
                        <th style={{ textAlign: 'right', padding: '0.5rem' }}>Extra</th>
                        <th style={{ textAlign: 'right', padding: '0.5rem' }}>Total Aportado</th>
                        {escenarios.map((escenario) => (
                            <th key={escenario.id} style={{ textAlign: 'right', padding: '0.5rem' }}>
                                {escenario.nombre} ({escenario.rentabilidadAnual}%)
                            </th>
                        ))}
                        {mostrarColumnaReal && (
                            <>
                                <th style={{ textAlign: 'right', padding: '0.5rem' }}>Valor Real</th>
                                <th style={{ textAlign: 'right', padding: '0.5rem' }}>Rendimiento Real</th>
                            </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {mesesBase.map((mes, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{mes.mes}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                {formatearMoneda(mes.aportacionMes)}
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={
                                            aportacionesExtra && aportacionesExtra[mes.mes] !== undefined
                                                ? aportacionesExtra[mes.mes]
                                                : ''
                                        }
                                        onChange={(e) => {
                                            const valor = parseFloat(e.target.value);
                                            if (!Number.isNaN(valor) && onSetAportacionExtra) {
                                                onSetAportacionExtra(mes.mes, valor);
                                            }
                                        }}
                                        placeholder="Extra"
                                        style={{ width: '90px' }}
                                    />
                                    {onDeleteAportacionExtra && aportacionesExtra && aportacionesExtra[mes.mes] !== undefined && (
                                        <button
                                            onClick={() => onDeleteAportacionExtra(mes.mes)}
                                            style={{
                                                color: '#d32f2f',
                                                background: 'none',
                                                border: 'none',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                {formatearMoneda(mes.capitalAportado)}
                            </td>
                            {escenarios.map((escenario) => {
                                const serie = resultadosPorEscenario.get(escenario.id) || [];
                                const mesEscenario = serie[idx];
                                return (
                                    <td
                                        key={escenario.id}
                                        style={{
                                            padding: '0.5rem',
                                            textAlign: 'right',
                                            fontWeight: 'bold',
                                            color: '#1976d2',
                                        }}
                                    >
                                        {mesEscenario
                                            ? formatearMoneda(mesEscenario.capitalConInteres)
                                            : '—'}
                                    </td>
                                );
                            })}
                            {mostrarColumnaReal && (
                                <>
                                    <td
                                        style={{
                                            padding: '0.5rem',
                                            textAlign: 'right',
                                            fontWeight: 'bold',
                                            color: mes.valorReal ? '#ff9800' : '#999',
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={
                                                    valoresReales && valoresReales[mes.mes] !== undefined
                                                        ? valoresReales[mes.mes]
                                                        : ''
                                                }
                                                onChange={(e) => {
                                                    const valor = parseFloat(e.target.value);
                                                    if (!Number.isNaN(valor) && onSetValorReal) {
                                                        onSetValorReal(mes.mes, valor);
                                                    }
                                                }}
                                                placeholder="Valor real"
                                                style={{ width: '120px' }}
                                            />
                                            {onDeleteValorReal && valoresReales && valoresReales[mes.mes] !== undefined && (
                                                <button
                                                    onClick={() => onDeleteValorReal(mes.mes)}
                                                    style={{
                                                        color: '#d32f2f',
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td
                                        style={{
                                            padding: '0.5rem',
                                            textAlign: 'right',
                                            fontWeight: 'bold',
                                            color:
                                                mes.rentabilidadReal && mes.rentabilidadReal > 0
                                                    ? '#2e7d32'
                                                    : mes.rentabilidadReal && mes.rentabilidadReal < 0
                                                      ? '#d32f2f'
                                                      : '#999',
                                        }}
                                    >
                                        {mes.rentabilidadReal ? (
                                            <div>
                                                <div>{formatearMoneda(mes.rentabilidadReal)}</div>
                                                <small style={{ color: '#666' }}>
                                                    {formatearPorcentaje(mes.rentabilidadReal, mes.capitalAportado)}
                                                </small>
                                            </div>
                                        ) : (
                                            '—'
                                        )}
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
