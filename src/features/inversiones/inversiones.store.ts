import type {
    InversionesState,
    Cartera,
    Activo,
    Escenario,
    SeguimientoCartera,
    MesCalculado,
    RegistroReal,
    ActivoValorActual,
} from './inversiones.types';

// UTILIDADES DE CÁLCULO
export class CalculadoraInversiones {
    /**
     * Convierte rentabilidad anual a mensual
     * Formula: (1 + r_anual)^(1/12) - 1
     */
    static rentabilidadMensual(rentabilidadAnual: number): number {
        const rAnual = rentabilidadAnual / 100;
        return Math.pow(1 + rAnual, 1 / 12) - 1;
    }

    /**
     * Calcula el capital con interés compuesto mes a mes
     * Incluye datos reales si existen
     */
    static calcularMeses(
        seguimiento: SeguimientoCartera,
        escenario: Escenario,
        capitalInicial: number
    ): MesCalculado[] {
        const resultados: MesCalculado[] = [];
        const rentabilidadMensual = this.rentabilidadMensual(escenario.rentabilidadAnual);

        let capitalAportadoAcum = capitalInicial;
        let capitalConInteresAcum = capitalInicial;

        // Determinar hasta qué mes calcular (proyección)
        const mesFinal = seguimiento.mesFin || seguimiento.mesActual || new Date().toISOString().slice(0, 7);
        const inicio = this.parseYearMonth(seguimiento.mesInicio);
        const fin = this.parseYearMonth(mesFinal);
        const inicioAport = this.parseYearMonth(seguimiento.mesInicioAportaciones);

        const inicioIdx = this.toMonthIndex(inicio.year, inicio.month);
        const finIdx = this.toMonthIndex(fin.year, fin.month);
        const inicioAportIdx = this.toMonthIndex(inicioAport.year, inicioAport.month);

        for (let idx = inicioIdx; idx <= finIdx; idx += 1) {
            const { year, month } = this.fromMonthIndex(idx);
            const mesStr = this.formatYearMonth(year, month);

            // Aportación de este mes
            let aportacionMes = 0;
            if (idx >= inicioAportIdx) {
                aportacionMes = seguimiento.aportacionMensualBase;
                const aportacionAdicional = seguimiento.aportacionesAdicionales.find(
                    (a) => a.mes === mesStr
                );
                if (aportacionAdicional) {
                    aportacionMes += aportacionAdicional.monto;
                }
            }

            // Aplicar interés al capital anterior
            capitalConInteresAcum = capitalConInteresAcum * (1 + rentabilidadMensual);

            // Agregar aportación
            capitalAportadoAcum += aportacionMes;
            capitalConInteresAcum += aportacionMes;

            const rentabilidad = capitalConInteresAcum - capitalAportadoAcum;

            // Buscar valor real para este mes
            const registroReal = seguimiento.registrosReales.find((r) => r.mes === mesStr);
            
            const mesCalculado: MesCalculado = {
                mes: mesStr,
                aportacionMes,
                capitalAportado: capitalAportadoAcum,
                capitalConInteres: capitalConInteresAcum,
                rentabilidadMes: rentabilidad,
            };

            // Si existe valor real, agregarlo y calcular rentabilidad real
            if (registroReal) {
                mesCalculado.valorReal = registroReal.valorReal;
                mesCalculado.rentabilidadReal = registroReal.valorReal - capitalAportadoAcum;
            }

            resultados.push(mesCalculado);

        }

        return resultados;
    }

    private static parseYearMonth(value: string): { year: number; month: number } {
        const [y, m] = value.split('-');
        return { year: Number(y), month: Number(m) };
    }

    private static formatYearMonth(year: number, month: number): string {
        const mm = String(month).padStart(2, '0');
        return `${year}-${mm}`;
    }

    private static toMonthIndex(year: number, month: number): number {
        return year * 12 + (month - 1);
    }

    private static fromMonthIndex(idx: number): { year: number; month: number } {
        const year = Math.floor(idx / 12);
        const month = (idx % 12) + 1;
        return { year, month };
    }

    /**
     * Calcula todos los escenarios de un seguimiento
     */
    static calcularTodosEscenarios(
        seguimiento: SeguimientoCartera,
        escenarios: Escenario[],
        capitalInicial: number
    ): Map<string, MesCalculado[]> {
        const resultados = new Map<string, MesCalculado[]>();
        for (const escenario of escenarios) {
            if (escenario.id) {
                const meses = this.calcularMeses(seguimiento, escenario, capitalInicial);
                resultados.set(escenario.id, meses);
            }
        }
        return resultados;
    }
}

// STORE (Gestión de estado)
export class InversionesStore {
    private state: InversionesState;
    private listeners: Set<(state: InversionesState) => void> = new Set();

    constructor() {
        this.state = {
            activos: [],
            carteras: [],
            escenarios: [
                { id: 'conservador', nombre: 'Conservador', rentabilidadAnual: 3 },
                { id: 'optimista', nombre: 'Optimista', rentabilidadAnual: 8 },
            ],
            seguimientos: [],
            activosValoresActuales: [],
            mesActual: new Date().toISOString().slice(0, 7),
        };
    }

    getState(): InversionesState {
        return { ...this.state };
    }

    subscribe(listener: (state: InversionesState) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    private notifyListeners(): void {
        const stateCopy = { ...this.state };
        this.listeners.forEach((listener) => listener(stateCopy));
    }

    // CARTERAS
    agregarCartera(nombre: string, descripcion?: string): void {
        const cartera: Cartera = {
            id: Date.now().toString(),
            nombre,
            descripcion,
            fecha: new Date().toISOString().split('T')[0],
        };
        this.state.carteras.push(cartera);
        this.notifyListeners();
    }

    actualizarCartera(id: string, nombre: string, descripcion?: string): void {
        const cartera = this.state.carteras.find((c) => c.id === id);
        if (cartera) {
            cartera.nombre = nombre;
            cartera.descripcion = descripcion;
            this.notifyListeners();
        }
    }

    eliminarCartera(id: string): void {
        this.state.carteras = this.state.carteras.filter((c) => c.id !== id);
        this.state.activos = this.state.activos.filter((a) => a.carteraId !== id);
        this.state.seguimientos = this.state.seguimientos.filter((s) => s.carteraId !== id);
        this.notifyListeners();
    }

    // ACTIVOS
    agregarActivo(
        nombre: string,
        tipo: 'fondo' | 'etf' | 'accion' | 'otro',
        capitalInicial: number,
        carteraId: string
    ): void {
        const activo: Activo = {
            id: Date.now().toString(),
            nombre,
            tipo,
            capitalInicial,
            carteraId,
            fecha: new Date().toISOString().split('T')[0],
        };
        this.state.activos.push(activo);
        this.notifyListeners();
    }

    eliminarActivo(id: string): void {
        this.state.activos = this.state.activos.filter((a) => a.id !== id);
        this.notifyListeners();
    }

    obtenerActivosPorCartera(carteraId: string): Activo[] {
        return this.state.activos.filter((a) => a.carteraId === carteraId);
    }

    // ESCENARIOS
    agregarEscenario(nombre: string, rentabilidadAnual: number): void {
        const escenario: Escenario = {
            id: Date.now().toString(),
            nombre,
            rentabilidadAnual,
        };
        this.state.escenarios.push(escenario);
        this.notifyListeners();
    }

    actualizarEscenario(id: string, nombre: string, rentabilidadAnual: number): void {
        const escenario = this.state.escenarios.find((e) => e.id === id);
        if (escenario) {
            escenario.nombre = nombre;
            escenario.rentabilidadAnual = rentabilidadAnual;
            this.notifyListeners();
        }
    }

    eliminarEscenario(id: string): void {
        this.state.escenarios = this.state.escenarios.filter((e) => e.id !== id);
        this.notifyListeners();
    }

    // SEGUIMIENTOS
    agregarSeguimiento(
        carteraId: string,
        capitalInicial: number,
        aportacionMensualBase: number,
        mesInicio: string,
        mesInicioAportaciones: string,
        mesFin?: string
    ): void {
        const seguimiento: SeguimientoCartera = {
            id: Date.now().toString(),
            carteraId,
            capitalInicial,
            aportacionMensualBase,
            aportacionesAdicionales: [],
            registrosReales: [],
            mesInicio,
            mesInicioAportaciones,
            mesFin,
            mesActual: this.state.mesActual,
        };
        this.state.seguimientos.push(seguimiento);
        this.notifyListeners();
    }

    actualizarSeguimiento(
        id: string,
        capitalInicial: number,
        aportacionMensualBase: number,
        mesInicio: string,
        mesInicioAportaciones: string,
        mesFin?: string,
        mesActual?: string
    ): void {
        const seguimiento = this.state.seguimientos.find((s) => s.id === id);
        if (seguimiento) {
            seguimiento.capitalInicial = capitalInicial;
            seguimiento.aportacionMensualBase = aportacionMensualBase;
            seguimiento.mesInicio = mesInicio;
            seguimiento.mesInicioAportaciones = mesInicioAportaciones;
            seguimiento.mesFin = mesFin;
            if (mesActual) seguimiento.mesActual = mesActual;
            this.notifyListeners();
        }
    }

    setAportacionAdicional(seguimientoId: string, mes: string, monto: number): void {
        const seguimiento = this.state.seguimientos.find((s) => s.id === seguimientoId);
        if (seguimiento) {
            const existente = seguimiento.aportacionesAdicionales.find((a) => a.mes === mes);
            if (existente) {
                existente.monto = monto;
            } else {
                seguimiento.aportacionesAdicionales.push({ mes, monto });
            }
            this.notifyListeners();
        }
    }

    eliminarAportacionAdicional(seguimientoId: string, mes: string): void {
        const seguimiento = this.state.seguimientos.find((s) => s.id === seguimientoId);
        if (seguimiento) {
            seguimiento.aportacionesAdicionales = seguimiento.aportacionesAdicionales.filter(
                (a) => a.mes !== mes
            );
            this.notifyListeners();
        }
    }

    // REGISTROS REALES
    agregarOActualizarRegistroReal(seguimientoId: string, mes: string, valorReal: number): void {
        const seguimiento = this.state.seguimientos.find((s) => s.id === seguimientoId);
        if (seguimiento) {
            const existente = seguimiento.registrosReales.find((r) => r.mes === mes);
            if (existente) {
                existente.valorReal = valorReal;
            } else {
                seguimiento.registrosReales.push({ mes, valorReal });
            }
            this.notifyListeners();
        }
    }

    eliminarRegistroReal(seguimientoId: string, mes: string): void {
        const seguimiento = this.state.seguimientos.find((s) => s.id === seguimientoId);
        if (seguimiento) {
            seguimiento.registrosReales = seguimiento.registrosReales.filter((r) => r.mes !== mes);
            this.notifyListeners();
        }
    }

    obtenerRegistrosReales(seguimientoId: string): RegistroReal[] {
        const seguimiento = this.state.seguimientos.find((s) => s.id === seguimientoId);
        return seguimiento?.registrosReales || [];
    }

    // CÁLCULOS
    calcularSeguimiento(seguimientoId: string): Map<string, MesCalculado[]> {
        const seguimiento = this.state.seguimientos.find((s) => s.id === seguimientoId);
        if (!seguimiento) return new Map();
        return CalculadoraInversiones.calcularTodosEscenarios(
            seguimiento,
            this.state.escenarios,
            seguimiento.capitalInicial
        );
    }

    obtenerSeguimientosPorCartera(carteraId: string): SeguimientoCartera[] {
        return this.state.seguimientos.filter((s) => s.carteraId === carteraId);
    }

    obtenerEscenario(id: string): Escenario | undefined {
        return this.state.escenarios.find((e) => e.id === id);
    }

    obtenerCartera(id: string): Cartera | undefined {
        return this.state.carteras.find((c) => c.id === id);
    }

    obtenerSeguimiento(id: string): SeguimientoCartera | undefined {
        return this.state.seguimientos.find((s) => s.id === id);
    }

    // VALORES ACTUALES DE ACTIVOS
    agregarOActualizarValorActual(
        activoId: string,
        activoNombre: string,
        cantidadActual: number,
        valorActual: number
    ): void {
        const existente = this.state.activosValoresActuales.find((a) => a.activoId === activoId);
        if (existente) {
            existente.cantidadActual = cantidadActual;
            existente.valorActual = valorActual;
            existente.fecha = new Date().toISOString().split('T')[0];
        } else {
            const nuevoValor: ActivoValorActual = {
                id: Date.now().toString(),
                activoId,
                nombre: activoNombre,
                cantidadActual,
                valorActual,
                fecha: new Date().toISOString().split('T')[0],
            };
            this.state.activosValoresActuales.push(nuevoValor);
        }
        this.notifyListeners();
    }

    eliminarValorActual(activoId: string): void {
        this.state.activosValoresActuales = this.state.activosValoresActuales.filter(
            (a) => a.activoId !== activoId
        );
        this.notifyListeners();
    }

    obtenerValoresActuales(): ActivoValorActual[] {
        return [...this.state.activosValoresActuales];
    }
}

// Instancia global singleton
export let inversionesStore: InversionesStore | null = null;

export function getInversionesStore(): InversionesStore {
    if (!inversionesStore) {
        inversionesStore = new InversionesStore();
    }
    return inversionesStore;
}
