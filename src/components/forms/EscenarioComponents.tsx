import React, { useState } from 'react';
import type { Escenario } from '../../features/inversiones/inversiones.types';

interface EscenarioFormProps {
    onSubmit: (nombre: string, rentabilidad: number) => void;
    isLoading?: boolean;
}

export const EscenarioForm: React.FC<EscenarioFormProps> = ({ onSubmit, isLoading }) => {
    const [nombre, setNombre] = useState('');
    const [rentabilidad, setRentabilidad] = useState('5');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (nombre.trim()) {
            onSubmit(nombre, parseFloat(rentabilidad));
            setNombre('');
            setRentabilidad('5');
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
            <h3>Nuevo Escenario</h3>
            <div style={{ marginBottom: '0.5rem' }}>
                <label>
                    Nombre:
                    <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="ej: Moderado"
                        required
                    />
                </label>
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
                <label>
                    Rentabilidad Anual (%):
                    <input
                        type="number"
                        step="0.1"
                        value={rentabilidad}
                        onChange={(e) => setRentabilidad(e.target.value)}
                        required
                    />
                </label>
            </div>
            <button type="submit" disabled={isLoading}>
                {isLoading ? 'Agregando...' : 'Agregar Escenario'}
            </button>
        </form>
    );
};

interface EscenarioListProps {
    escenarios: Escenario[];
    onUpdate: (id: string, nombre: string, rentabilidad: number) => void;
    onDelete: (id: string) => void;
}

export const EscenarioList: React.FC<EscenarioListProps> = ({ escenarios, onUpdate, onDelete }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editNombre, setEditNombre] = useState('');
    const [editRentabilidad, setEditRentabilidad] = useState('');

    const handleEdit = (escenario: Escenario) => {
        setEditingId(escenario.id);
        setEditNombre(escenario.nombre);
        setEditRentabilidad(escenario.rentabilidadAnual.toString());
    };

    const handleSave = (id: string) => {
        onUpdate(id, editNombre, parseFloat(editRentabilidad));
        setEditingId(null);
    };

    return (
        <div style={{ marginBottom: '2rem' }}>
            <h3>Escenarios ({escenarios.length})</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid #ddd' }}>
                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Nombre</th>
                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Rentabilidad Anual</th>
                        <th style={{ padding: '0.5rem' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {escenarios.map((escenario) => (
                        <tr key={escenario.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '0.5rem' }}>
                                {editingId === escenario.id ? (
                                    <input
                                        value={editNombre}
                                        onChange={(e) => setEditNombre(e.target.value)}
                                        style={{ width: '100%' }}
                                    />
                                ) : (
                                    escenario.nombre
                                )}
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                                {editingId === escenario.id ? (
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={editRentabilidad}
                                        onChange={(e) => setEditRentabilidad(e.target.value)}
                                        style={{ width: '100px' }}
                                    />
                                ) : (
                                    `${escenario.rentabilidadAnual}%`
                                )}
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                                {editingId === escenario.id ? (
                                    <>
                                        <button onClick={() => handleSave(escenario.id)} style={{ marginRight: '0.5rem' }}>
                                            Guardar
                                        </button>
                                        <button onClick={() => setEditingId(null)}>Cancelar</button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleEdit(escenario)}
                                            style={{ marginRight: '0.5rem' }}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => onDelete(escenario.id)}
                                            style={{ color: '#d32f2f', background: 'none', border: 'none', cursor: 'pointer' }}
                                        >
                                            Eliminar
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
