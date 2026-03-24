import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';

export const PendingApproval = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    navigate('/login');
  };

  const isRejected = user?.estado === 'rechazado';

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 text-center shadow-xl dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isRejected ? 'bg-red-100 dark:bg-red-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
          <Clock className={`h-8 w-8 ${isRejected ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
        </div>
        
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          {isRejected ? 'Solicitud Rechazada' : 'Cuenta Pendiente'}
        </h2>
        
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {isRejected 
            ? 'Lamentablemente tu solicitud ha sido rechazada por un administrador. Comunícate con bienestar estudiantil para más información.'
            : 'Tu cuenta ha sido creada y está a la espera de aprobación por parte de un administrador. Revisa más tarde.'}
        </p>

        <button
          onClick={handleLogout}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-md bg-gray-100 px-4 py-2 font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};
