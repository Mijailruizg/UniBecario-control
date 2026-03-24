import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { isValidInstitutionalEmail } from '../../lib/auth';

export const RegisterRequest = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [carrera, setCarrera] = useState('');
  const [semestre, setSemestre] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidInstitutionalEmail(email)) {
      setError('Debes utilizar un correo institucional válido (scz.nombre.apellido@unifranz.edu.bo).');
      return;
    }

    setLoading(true);

    // 1. Crear el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre
        }
      }
    });

    if (authError) {
      setError(authError.message || 'Error al registrar el usuario.');
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Insertar en tabla usuarios (si no lo hace un trigger en Supabase)
      const { error: dbError } = await supabase.from('usuarios').insert({
        id: authData.user.id,
        correo: email,
        nombre,
        carrera,
        semestre,
        rol: 'becario',
        estado: 'pendiente'
      });

      if (dbError) {
        // En un entorno real idealmente manejamos un fallback o verificamos si ya existe por el trigger
        console.error(dbError);
      }

      // 3. Crear solicitud
      await supabase.from('solicitudes').insert({
        usuario_id: authData.user.id,
        estado: 'pendiente'
      });
      
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 text-center shadow-xl dark:bg-gray-800">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">Solicitud Enviada</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Tu solicitud para acceder al sistema ha sido registrada. Un administrador revisará tu cuenta pronto.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 w-full rounded-md bg-primary-600 px-4 py-2 font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
            <UserPlus className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h2 className="mt-6 text-2xl font-extrabold text-gray-900 dark:text-white">
            Solicitar Acceso
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Llena el formulario para registrarte como becario
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/50">
            <div className="flex items-center gap-3 text-sm text-red-800 dark:text-red-200">
              <AlertCircle className="h-5 w-5 text-red-400 dark:text-red-300" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
            <input type="text" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={nombre} onChange={e => setNombre(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo Institucional</label>
            <input type="email" required placeholder="scz.nombre.apellido@unifranz.edu.bo" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white placeholder-gray-400" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña</label>
            <input type="password" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Carrera</label>
              <input type="text" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={carrera} onChange={e => setCarrera(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Semestre</label>
              <input type="text" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" placeholder="Ej: 5to" value={semestre} onChange={e => setSemestre(e.target.value)} />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          ¿Ya tienes cuenta?{' '}
          <button onClick={() => navigate('/login')} className="font-medium text-primary-600 hover:text-primary-500">
            Iniciar Sesión
          </button>
        </p>
      </div>
    </div>
  );
};
