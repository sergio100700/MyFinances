/**
 * Store de Inversiones con Supabase
 * Reemplaza inversiones.store.ts para usar persistencia en la nube
 */

import type {
    InversionesState,
    Cartera,
    Activo,
    Escenario,
    SeguimientoCartera,
    ActivoValorActual,
    MesCalculado,
} from './inversiones.types';

import {
    // Carteras
    loadCarteras,
    addCartera,
    updateCartera,
    deleteCartera,
    // Activos
    loadActivos,
    addActivo,
    updateActivo,
    deleteActivo,
    // Escenarios
    loadEscenarios,
    addEscenario,
    updateEscenario,
    deleteEscenario,
    // Seguimientos
    loadSeguimientos,
    saveSeguimientoCartera,
    deleteSeguimientoCartera,
    // Valores actuales
    loadActivosValoresActuales,
    saveActivoValorActual,
    deleteActivoValorActual,
} from '../../lib/storage';

import { CalculadoraInversiones } from './inversiones.store';

type Listener = (state: InversionesState) => void;

export class InversionesStoreSupabase {
    private state: InversionesState = {
        activos: [],
        carteras: [],
        escenarios: [],
        seguimientos: [],
        activosValoresActuales: [],
        mesActual: new Date().toISOString().slice(0, 7),
    };

    private listeners: Listener[] = [];
    private loading = false;

    constructor() {
        this.loadAllData();
    }

    private async loadAllData() {
        if (this.loading) return;
        this.loading = true;

        try {
            const [carteras, activos, escenarios, seguimientos, valoresActuales] = await Promise.all([
                loadCarteras(),
                loadActivos(),
                loadEscenarios(),
                loadSeguimientos(),
                loadActivosValoresActuales(),
            ]);

            this.state = {
                carteras,
                activos,
                escenarios,
                seguimientos,
                activosValoresActuales: valoresActuales,
                mesActual: new Date().toISOString().slice(0, 7),
            };

            this.notifyListeners();
        } catch (error) {
            console.error('Error loading inversiones data:', error);
        } finally {
            this.loading = false;
        }
    }

    getState(): InversionesState {
        return { ...this.state };
    }

    subscribe(listener: Listener): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    private notifyListeners(): void {
        this.listeners.forEach((listener) => listener(this.getState()));
    }

    // CARTERAS
    async agregarCartera(nombre: string, descripcion?: string): Promise<void> {
        try {
            const fecha = new Date().toISOString().split('T')[0];
            const nuevaCartera = await addCartera({ nombre, descripcion, fecha });
            this.state.carteras.push(nuevaCartera);
            this.notifyListeners();
        } catch (error) {
            console.error('Error agregando cartera:', error);
            throw error;
        }
    }

    async actualizarCartera(id: string, nombre: string, descripcion?: string): Promise<void> {
        try {
            const carteraActualizada = await updateCartera(id, { nombre, descripcion });
            const index = this.state.carteras.findIndex((c) => c.id === id);
            if (index !== -1) {
                this.state.carteras[index] = carteraActualizada;
                this.notifyListeners();
            }
        } catch (error) {
            console.error('Error actualizando cartera:', error);
            throw error;
        }
    }

    async eliminarCartera(id: string): Promise<void> {
        try {
            await deleteCartera(id);
            this.state.carteras = this.state.carteras.filter((c) => c.id !== id);
            this.state.activos = this.state.activos.filter((a) => a.carteraId !== id);
            this.state.seguimientos = this.state.seguimientos.filter((s) => s.carteraId !== id);
            this.notifyListeners();
        } catch (error) {
            console.error('Error eliminando cartera:', error);
            throw error;
        }
    }

    // ACTIVOS
    async agregarActivo(
        nombre: string,
        tipo: 'fondo' | 'etf' | 'accion' | 'otro',
        capitalInicial: number,
        carteraId: string
    ): Promise<void> {
        try {
            const fecha = new Date().toISOString().split('T')[0];
            const nuevoActivo = await addActivo({
                nombre,
                tipo,
                capitalInicial,
                carteraId,
                fecha,
            });
            this.state.activos.push(nuevoActivo);
            this.notifyListeners();
        } catch (error) {
            console.error('Error agregando activo:', error);
            throw error;
        }
    }

    async eliminarActivo(id: string): Promise<void> {
        try {
            await deleteActivo(id);
            this.state.activos = this.state.activos.filter((a) => a.id !== id);
            this.notifyListeners();
        } catch (error) {
            console.error('Error eliminando activo:', error);
            throw error;
        }
    }

    obtenerActivosPorCartera(carteraId: string): Activo[] {
        return this.state.activos.filter((a) => a.carteraId === carteraId);
    }

    // ESCENARIOS
    async agregarEscenario(nombre: string, rentabilidadAnual: number): Promise<void> {
        try {
            const nuevoEscenario = await addEscenario({ nombre, rentabilidadAnual });
            this.state.escenarios.push(nuevoEscenario);
            this.notifyListeners();
        } catch (error) {
            console.error('Error agregando escenario:', error);
            throw error;
        }
    }

    async actualizarEscenario(id: string, nombre: string, rentabilidadAnual: number): Promise<void> {
        try {
            const escenarioActualizado = await updateEscenario(id, { nombre, rentabilidadAnual });
            const index = this.state.escenarios.findIndex((e) => e.id === id);
            if (index !== -1) {
                this.state.escenarios[index] = escenarioActualizado;
                this.notifyListeners();
            }
        } catch (error) {
            console.error('Error actualizando escenario:', error);
            throw error;
        }
    }

    async eliminarEscenario(id: string): Promise<void> {
        try {
            await deleteEscenario(id);
            this.state.escenarios = this.state.escenarios.filter((e) => e.id !== id);
            this.notifyListeners();
        } catch (error) {
            console.error('Error eliminando escenario:', error);
            throw error;
        }
    }

    // SEGUIMIENTOS
    async guardarSeguimiento(seguimiento: SeguimientoCartera): Promise<void> {
        try {
            const seguimientoGuardado = await saveSeguimientoCartera(seguimiento);
            const index = this.state.seguimientos.findIndex((s) => s.carteraId === seguimiento.carteraId);
            if (index !== -1) {
                this.state.seguimientos[index] = seguimientoGuardado;
            } else {
                this.state.seguimientos.push(seguimientoGuardado);
            }
            this.notifyListeners();
        } catch (error) {
            console.error('Error guardando seguimiento:', error);
            throw error;
        }
    }

    async eliminarSeguimiento(carteraId: string): Promise<void> {
        try {
            await deleteSeguimientoCartera(carteraId);
            this.state.seguimientos = this.state.seguimientos.filter((s) => s.carteraId !== carteraId);
            this.notifyListeners();
        } catch (error) {
            console.error('Error eliminando seguimiento:', error);
            throw error;
        }
    }

    obtenerSeguimiento(carteraId: string): SeguimientoCartera | undefined {
        return this.state.seguimientos.find((s) => s.carteraId === carteraId);
    }

    // VALORES ACTUALES
    async actualizarValorActual(
        activoId: string,
        activoNombre: string,
        cantidadActual: number,
        valorActual: number
    ): Promise<void> {
        try {
            const fecha = new Date().toISOString().split('T')[0];
            const valorGuardado = await saveActivoValorActual({
                activoId,
                nombre: activoNombre,
                cantidadActual,
                valorActual,
                fecha,
            });

            const index = this.state.activosValoresActuales.findIndex((a) => a.activoId === activoId);
            if (index !== -1) {
                this.state.activosValoresActuales[index] = valorGuardado;
            } else {
                this.state.activosValoresActuales.push(valorGuardado);
            }
            this.notifyListeners();
        } catch (error) {
            console.error('Error actualizando valor actual:', error);
            throw error;
        }
    }

    async eliminarValorActual(activoId: string): Promise<void> {
        try {
            await deleteActivoValorActual(activoId);
            this.state.activosValoresActuales = this.state.activosValoresActuales.filter(
                (a) => a.activoId !== activoId
            );
            this.notifyListeners();
        } catch (error) {
            console.error('Error eliminando valor actual:', error);
            throw error;
        }
    }

    obtenerValoresActuales(): ActivoValorActual[] {
        return [...this.state.activosValoresActuales];
    }

    // MÉTODOS DE CÁLCULO (reutilizan CalculadoraInversiones)
    calcularMeses(seguimiento: SeguimientoCartera, escenario: Escenario, capitalInicial: number): MesCalculado[] {
        return CalculadoraInversiones.calcularMeses(seguimiento, escenario, capitalInicial);
    }

    calcularCapitalTotal(activos: Activo[]): number {
        return activos.reduce((sum, a) => sum + a.capitalInicial, 0);
    }

    // Método para refrescar datos desde Supabase
    async refresh(): Promise<void> {
        await this.loadAllData();
    }
}

// Instancia global singleton
let inversionesStoreSupabase: InversionesStoreSupabase | null = null;

export function getInversionesStore(): InversionesStoreSupabase {
    if (!inversionesStoreSupabase) {
        inversionesStoreSupabase = new InversionesStoreSupabase();
    }
    return inversionesStoreSupabase;
}
