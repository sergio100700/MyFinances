import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });
        if (error) throw error;
        alert('✓ Cuenta creada. Si tienes confirmación de email habilitada, revisa tu bandeja de entrada.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      setError(error.message || 'Error al autenticar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '1rem',
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
      }}>
        <h1 style={{ margin: '0 0 0.5rem 0', textAlign: 'center', color: '#667eea' }}>
          💰 Mi Cartera Financiera
        </h1>
        <p style={{ margin: '0 0 2rem 0', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
          {isSignUp ? 'Crea tu cuenta para comenzar' : 'Inicia sesión para continuar'}
        </p>
        
        {error && (
          <div style={{
            padding: '0.75rem',
            background: '#ffebee',
            border: '1px solid #ef5350',
            borderRadius: '6px',
            color: '#d32f2f',
            marginBottom: '1rem',
            fontSize: '0.9rem',
          }}>
            ✗ {error}
          </div>
        )}
        
        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                fontFamily: 'inherit',
              }}
            />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#333' }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '1rem',
                fontFamily: 'inherit',
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: loading ? '#95a5a6' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s ease',
            }}
          >
            {loading ? 'Cargando...' : isSignUp ? '✓ Crear Cuenta' : '→ Iniciar Sesión'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              fontSize: '0.95rem',
              textDecoration: 'underline',
            }}
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
        
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: '#f0f4ff',
          borderRadius: '6px',
          fontSize: '0.85rem',
          color: '#666',
        }}>
          <strong>ℹ️ Nota:</strong> Tus datos se guardan de forma segura en Supabase.
          Cada usuario solo puede acceder a su propia información.
        </div>
      </div>
    </div>
  );
};
