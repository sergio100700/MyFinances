import React, { useEffect, useState } from 'react';
import AppShell from './components/layout/app-shell';
import AppRoutes from './routes';
import { BrowserRouter } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';
import { Login } from './components/auth/Login';

const App: React.FC = () => {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '1.2rem',
            }}>
                ⏳ Cargando...
            </div>
        );
    }

    if (!session) {
        return <Login />;
    }

    return (
        <BrowserRouter>
            <AppShell>
                <AppRoutes />
            </AppShell>
        </BrowserRouter>
    );
};

export default App;