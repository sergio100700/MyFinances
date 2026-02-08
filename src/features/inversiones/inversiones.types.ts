// ACTIVOS
export interface Activo {
    id: string;
    nombre: string;
    tipo: 'fondo' | 'etf' | 'accion' | 'otro';
    capitalInicial: number;
    fecha: string; // YYYY-MM-DD
    carteraId: string;
}

// CARTERAS / GRUPOS
export interface Cartera {
    id: string;
    nombre: string;
    descripcion?: string;
    fecha: string; // YYYY-MM-DD
}

// ESCENARIOS
export interface Escenario {
    id: string;
    nombre: string;
    rentabilidadAnual: number; // % (ej: 5.5 para 5.5%)
}

// APORTACIONES MENSUALES
export interface Aportacion {
    mes: string; // YYYY-MM
    monto: number;
}

// REGISTRO REAL MENSUAL
export interface RegistroReal {
    mes: string; // YYYY-MM
    valorReal: number; // Valor real/actual de la inversión
    rentabilidadReal?: number; // Se calcula automáticamente
}

// SEGUIMIENTO MENSUAL DE UNA CARTERA
export interface SeguimientoCartera {
    id: string;
    carteraId: string;
    capitalInicial: number; // Capital inicial de la cartera
    aportacionMensualBase: number;
    aportacionesAdicionales: Aportacion[]; // Aportaciones en meses específicos
    registrosReales: RegistroReal[]; // Valores reales mensuales
    mesInicio: string; // YYYY-MM (inicio del seguimiento)
    mesInicioAportaciones: string; // YYYY-MM (desde cuándo se aporta)
    mesFin?: string; // YYYY-MM (hasta qué mes se proyecta)
    mesActual?: string; // YYYY-MM (mes hasta el que se calcula si no hay mesFin)
}

// VALOR ACTUAL DE UN ACTIVO (para gráfico de participación)
export interface ActivoValorActual {
    id: string;
    activoId: string;
    nombre: string;
    cantidadActual: number; // Cantidad/unidades actuales
    valorActual: number; // Valor total actual (cantidad × precio unitario)
    fecha: string; // YYYY-MM-DD
}

// CÁLCULO MENSUAL (resultado)
export interface MesCalculado {
    mes: string; // YYYY-MM
    aportacionMes: number;
    capitalAportado: number; // acumulado
    capitalConInteres: number;
    rentabilidadMes: number;
    valorReal?: number; // Valor real si existe
    rentabilidadReal?: number; // Rentabilidad real calculada
}

// ESTADO GLOBAL
export interface InversionesState {
    activos: Activo[];
    carteras: Cartera[];
    escenarios: Escenario[];
    seguimientos: SeguimientoCartera[];
    activosValoresActuales: ActivoValorActual[]; // Valores actuales de activos para gráfico
    mesActual: string; // YYYY-MM
}

// PORTFOLIO SIMPLE (para compatibilidad con portfolio.store)
export interface Investment {
    id: string;
    name: string;
    amountInvested: number;
    currentValue: number;
    dateAcquired: Date;
}
