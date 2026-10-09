import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    totalHoursThisMonth: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [{ data: users, error: userError }, { data: hours, error: hoursError }] = await Promise.all([
      supabase.from('usuarios').select('id,estado,rol'),
      supabase.from('registros_horas').select('fecha,total_horas')
    ]);
    if (userError || hoursError) {
      console.error(userError || hoursError);
      return;
    }
    const month = new Date().toISOString().slice(0,7);
    setStats({
      totalUsers: (users || []).length,
      activeUsers: (users || []).filter((u) => u.estado === 'activo' && u.rol === 'becario').length,
      pendingUsers: (users || []).filter((u) => u.estado === 'pendiente').length,
      totalHoursThisMonth: (hours || []).filter((h) => h.fecha?.startsWith(month))
        .reduce((sum,h) => sum + Number(h.total_horas || 0), 0)
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Panel de Administración</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Usuarios</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Becarios Activos</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/30">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Solicitudes Pendientes</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.pendingUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Horas este Mes</h3>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalHoursThisMonth.toFixed(1)}h</p>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};
