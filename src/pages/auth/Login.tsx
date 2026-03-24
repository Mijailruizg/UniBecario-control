import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { isValidInstitutionalEmail } from '../../lib/auth';
import { useAuthStore } from '../../store/useAuthStore';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setSession } = useAuthStore();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // --- MOCK LOGIN Bypasses Supabase for UI Demo ---
    if (
      (email === 'scz.admin.principal@unifranz.edu.bo') ||
      (email === 'scze.mijailandres.ruiz.ga@unifranz.edu.bo' && password === '69129015Mijail') || 
      (email === 'scz.mijailandres.ruiz.ga@unifranz.edu.bo' && password === '69129015Mijail')
    ) {
      const allMockUsers = JSON.parse(localStorage.getItem('mockUsersData') || '{}');
      let mockAdmin = allMockUsers[email];
      
      if (!mockAdmin) {
        mockAdmin = {
          id: 'mock-admin-' + Date.now(),
          correo: email,
          nombre: 'Mijail Andres Ruiz',
          rol: 'admin' as const,
          estado: 'activo' as const,
          fecha_inicio_beca: null,
          fecha_fin_beca: null,
          carrera: 'Ingeniería de Sistemas',
          semestre: '8vo',
          gestion: '1/2026',
          area_jefe: 'Rectorado',
          foto_perfil: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      setUser(mockAdmin);
      setSession({ user: { id: mockAdmin.id } });
      navigate('/admin/dashboard');
      return;
    }

    if (email === 'scz.becario.prueba@unifranz.edu.bo' || email === 'scze.camilanadyn.ajhuacho.co@unifranz.edu.bo') {
      const allMockUsers = JSON.parse(localStorage.getItem('mockUsersData') || '{}');
      let mockStudent = allMockUsers[email];
      
      if (!mockStudent) {
        mockStudent = {
          id: 'mock-student-' + Date.now(),
          correo: email,
          nombre: email.includes('camila') ? 'Camila Nadyn Ajhuacho' : 'Estudiante Becario',
          rol: 'becario' as const,
          estado: 'activo' as const,
          fecha_inicio_beca: '2026-03-01',
          fecha_fin_beca: '2026-07-01',
          carrera: 'Medicina',
          semestre: '5to',
          gestion: '1/2026',
          area_jefe: 'Biblioteca',
          foto_perfil: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      
      setUser(mockStudent);
      setSession({ user: { id: mockStudent.id } });
      navigate('/student/dashboard');
      return;
    }
    // ------------------------------------------------

    // ------------------------------------------------

    setLoading(true);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Credenciales incorrectas o usuario no encontrado.');
      setLoading(false);
      return;
    }

    // Verificar en la DB el estado del usuario (activo/pendiente/rechazado)
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('correo', authData.user.email)
      .single();

    setLoading(false);

    if (userError || !userData) {
      setError('Error al obtener datos del usuario.');
      return;
    }

    if (userData.estado === 'pendiente' || userData.estado === 'rechazado') {
      navigate('/pending');
      return;
    }

    if (userData.rol === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError('Error al iniciar sesión con Google.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
            <LogIn className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            UniBecarios Control
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Inicia sesión con tu correo institucional
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-300" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleEmailLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="scz.nombre.apellido@unifranz.edu.bo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Contraseña
              </label>
              <input
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-primary-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:hover:bg-primary-500"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500 dark:bg-gray-800 dark:text-gray-400">O</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuar con Google
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          ¿No tienes acceso?{' '}
          <button onClick={() => navigate('/register')} className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
            Solicitar acceso
          </button>
        </p>
      </div>
    </div>
  );
};
