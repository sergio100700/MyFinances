# Migración a Supabase - Instrucciones

## 📋 Pasos Completados

✅ Instalado `@supabase/supabase-js`
✅ Creado cliente de Supabase (`src/lib/supabaseClient.ts`)
✅ Refactorizado `src/lib/storage.ts` para usar Supabase
✅ Actualizado componentes para cargar datos de forma asíncrona

## 🚀 Configuración de Supabase

### 1. Crear cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Regístrate/inicia sesión
3. Crea un nuevo proyecto
4. Espera a que se inicialice (1-2 minutos)

### 2. Ejecutar SQL en Supabase

1. En tu proyecto Supabase, ve a **SQL Editor** (menú lateral)
2. Haz clic en **New query**
3. Copia y pega el SQL completo que te proporcioné anteriormente
4. Ejecuta el script (botón `RUN` o `Ctrl+Enter`)

### 3. Configurar Variables de Entorno

1. En tu proyecto Supabase, ve a **Project Settings** > **API**
2. Copia los valores:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

3. Crea un archivo `.env` en la raíz del proyecto `my-finance-web/`:

```bash
VITE_SUPABASE_URL=https://tuproyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 4. Configurar Autenticación (Auth)

#### Opción A: Email/Password (Recomendado para empezar)

1. En Supabase, ve a **Authentication** > **Providers**
2. Habilita **Email** provider
3. Deshabilita "Confirm email" para testing (puedes habilitarlo después)

#### Opción B: OAuth (Google, GitHub, etc.)

1. Ve a **Authentication** > **Providers**
2. Selecciona el proveedor (ej: Google)
3. Sigue las instrucciones para configurar OAuth

## 🔐 Implementar Autenticación en la App

Necesitas agregar una pantalla de login. Aquí un ejemplo básico:

### Crear componente de Login

```tsx
// src/components/auth/Login.tsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Revisa tu email para confirmar tu cuenta');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
      <h1>{isSignUp ? 'Registrarse' : 'Iniciar Sesión'}</h1>
      <form onSubmit={handleAuth}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '0.75rem', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {loading ? 'Cargando...' : isSignUp ? 'Registrarse' : 'Iniciar Sesión'}
        </button>
      </form>
      <button
        onClick={() => setIsSignUp(!isSignUp)}
        style={{ marginTop: '1rem', background: 'none', border: 'none', color: '#667eea', cursor: 'pointer' }}
      >
        {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
      </button>
    </div>
  );
};
```

### Modificar App.tsx para manejar autenticación

```tsx
// src/app.tsx
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
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Cargando...</div>;
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
```

### Agregar botón de Logout

En `AppShell.tsx`, agregar:

```tsx
const handleLogout = async () => {
    await supabase.auth.signOut();
};

// Añadir botón junto al de configuración:
<button onClick={handleLogout} style={{...}}>🚪 Salir</button>
```

## 🧪 Testing Local

1. Inicia el servidor de desarrollo:
```bash
npm run dev
```

2. Abre `http://localhost:5173` (o el puerto que use Vite)
3. Regístrate con un email
4. Inicia sesión
5. Prueba crear datos (inversiones, propiedades, presupuestos)
6. Verifica en Supabase > **Table Editor** que los datos se guardan

## 📊 Migrar Datos de localStorage

Si ya tienes datos en localStorage, exporta primero:

1. Ve a Configuración > Exportar Datos
2. Guarda el archivo JSON
3. Después de login en Supabase, importa desde Configuración > Importar Datos

## 🚀 Deploy en Render

### 1. Conectar Repositorio

1. Sube tu código a GitHub/GitLab
2. Ve a [render.com](https://render.com)
3. Crea cuenta y vincula tu repo

### 2. Crear Web Service

1. Nuevo **Static Site**
2. Selecciona tu repositorio
3. Configuración:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

### 3. Agregar Variables de Entorno en Render

En la configuración del servicio, agrega:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 4. Deploy

1. Haz clic en **Create Static Site**
2. Render construirá y desplegará automáticamente
3. Obtendrás una URL como `https://tu-app.onrender.com`

## 🔒 Seguridad

- ✅ RLS (Row Level Security) está habilitado
- ✅ Solo cada usuario puede ver/editar sus propios datos
- ✅ Las credenciales están en variables de entorno (nunca en el código)
- ⚠️ Nunca subas `.env` a Git (ya está en `.gitignore`)

## 📝 Notas Importantes

1. **localStorage ya NO se usa**: Todos los datos están en Supabase
2. **Requiere internet**: La app necesita conexión para funcionar
3. **Gratis hasta 500MB/mes**: Plan gratuito de Supabase
4. **Auth obligatorio**: Los usuarios deben registrarse/iniciar sesión

## ❓ Problemas Comunes

### "Usuario no autenticado"
- Verifica que hayas implementado el login
- Asegúrate de estar logueado en la app

### "Missing env vars"
- Revisa que `.env` exista y tenga las variables correctas
- Reinicia el servidor de desarrollo después de crear `.env`

### "Error: relation does not exist"
- Ejecuta el script SQL completo en Supabase
- Verifica que las tablas se hayan creado en Table Editor

### Deploy en Render no funciona
- Verifica que las variables de entorno estén configuradas en Render
- Revisa los logs del build en Render Dashboard
