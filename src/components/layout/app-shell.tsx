import React, { useEffect, useState } from 'react';
import Nav from './nav';
import { SettingsModal } from './SettingsModal';
import { loadSettings } from '../../lib/storage';
import { supabase } from '../../lib/supabaseClient';

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [, setSettingsReady] = useState(false);

    useEffect(() => {
        const initSettings = async () => {
            try {
                await loadSettings();
            } catch (error) {
                console.error('Error cargando ajustes:', error);
            } finally {
                setSettingsReady(true);
            }
        };

        initSettings();
    }, []);

    const handleLogout = async () => {
        if (confirm('¿Cerrar sesión?')) {
            await supabase.auth.signOut();
        }
    };

    return (
        <div className="app-shell">
            <header>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h1 style={{ margin: 0 }}>💰 Mi Cartera Financiera</h1>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setSettingsOpen(true)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                            }}
                        >
                            ⚙️
                        </button>
                        <button
                            onClick={handleLogout}
                            style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '1.2rem',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                            }}
                            title="Cerrar sesión"
                        >
                            🚪
                        </button>
                    </div>
                </div>
                <Nav />
            </header>
            <main>
                <div className="container">
                    {children}
                </div>
            </main>
            <footer>
                <p>&copy; {new Date().getFullYear()} Mi Cartera Financiera. Todos los derechos reservados.</p>
            </footer>
            <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
    );
};

export default AppShell;