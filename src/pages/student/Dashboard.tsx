import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Clock, Play, Square, Activity, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export const StudentDashboard = () => {
  const { user } = useAuthStore();
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actividad, setActividad] = useState('');
  const [error, setError] = useState('');
  const [totalHours, setTotalHours] = useState(0);

  const HORAS_REQUERIDAS = 360;

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    // Get active session (today, no end time)
    const today = new Date().toISOString().split('T')[0];
    const { data: sessionData } = await supabase
      .from('registros_horas')
      .select('*')
      .eq('usuario_id', user.id)
      .eq('fecha', today)
      .is('hora_fin', null)
      .single();

    if (sessionData) {
      setActiveSession(sessionData);
    }

    // Get total hours
    const { data: hoursData } = await supabase
      .from('registros_horas')
      .select('total_horas')
      .eq('usuario_id', user.id)
      .not('total_horas', 'is', null);

    if (hoursData) {
      const sum = hoursData.reduce((acc, curr) => acc + (curr.total_horas || 0), 0);
      setTotalHours(sum);
    }

    setLoading(false);
  };

  const startShift = async () => {
    if (!user) return;
    setActionLoading(true);
    setError('');

    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;
    
    const { data, error: insertError } = await supabase
      .from('registros_horas')
      .insert({
        usuario_id: user.id,
        fecha: now.toISOString().split('T')[0],
        hora_inicio: timeString
      })
      .select()
      .single();

    if (insertError) {
      setError('Error al iniciar jornada. ' + insertError.message);
    } else {
      setActiveSession(data);
    }
    setActionLoading(false);
  };

  const endShift = async () => {
    if (!user || !activeSession) return;
    if (!actividad.trim()) {
      setError('Debes describir la actividad realizada.');
      return;
    }

    setActionLoading(true);
    setError('');

    const now = new Date();
      const timeEnd = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;
      
      const startParts = activeSession.hora_inicio.split(':');
      const startDec = parseInt(startParts[0]) + parseInt(startParts[1]) / 60;
      const endDec = now.getHours() + now.getMinutes() / 60;
      let diff = endDec - startDec;
      if (diff <= 0) diff = 0.01; // Asegurar registro mínimo al testear
      
      const totalH = parseFloat(diff.toFixed(2));

      const newRecord = {
        id: 'mock-record-' + Date.now(),
        fecha: format(now, 'yyyy-MM-dd'),
        hora_inicio: activeSession.hora_inicio,
        hora_fin: timeEnd,
        total_horas: totalH,
        actividad,
      };
      
      const past = JSON.parse(localStorage.getItem('mockHistory') || '[]');
      localStorage.setItem('mockHistory', JSON.stringify([newRecord, ...past]));

      localStorage.removeItem('mockSession');
      setActiveSession(null);
      setActividad('');
      
      const currentMockTotal = parseFloat(localStorage.getItem('mockTotalHoras') || '120.5');
      const newTotal = currentMockTotal + totalH;
      localStorage.setItem('mockTotalHoras', newTotal.toString());
      setTotalHours(newTotal);
      
      setActionLoading(false);
      return;
    }

    const now = new Date();
    const timeEnd = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`;

    // Calculate hours (simplified for demo: assuming same day cross)
    const startParts = activeSession.hora_inicio.split(':');
    const startDec = parseInt(startParts[0]) + parseInt(startParts[1]) / 60;
    const endDec = now.getHours() + now.getMinutes() / 60;
    let diff = endDec - startDec;
    if (diff < 0) diff = 0; // fallback

    const { error: updateError } = await supabase
      .from('registros_horas')
      .update({
        hora_fin: timeEnd,
        total_horas: parseFloat(diff.toFixed(2)),
        actividad
      })
      .eq('id', activeSession.id);

    if (updateError) {
      setError('Error al finalizar jornada.');
    } else {
      setActiveSession(null);
      setActividad('');
      fetchData(); // refresh total hours
    }
    
    setActionLoading(false);
  };

  if (loading) return <div>Cargando panel...</div>;

  const progress = Math.min((totalHours / HORAS_REQUERIDAS) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Mi Panel</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Fecha: {format(new Date(), 'dd/MM/yyyy')}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Progreso */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 dark:text-gray-200">Progreso de Beca</h2>
          <div className="mb-2 flex justify-between items-end">
            <span className="text-3xl font-bold text-primary-600 dark:text-primary-400">
              {Math.floor(totalHours)}h {Math.round((totalHours % 1) * 60)}m
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Meta: {HORAS_REQUERIDAS} h
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-2 overflow-hidden">
            <div 
              className="bg-primary-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-right">
            {progress.toFixed(1)}% completado
          </p>
        </div>

        {/* Info Beca */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4 dark:text-gray-200">Detalles</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Área / Jefe</p>
              <p className="text-sm font-medium dark:text-gray-300">{user?.area_jefe || 'No asignado'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Período de Beca</p>
              <p className="text-sm font-medium dark:text-gray-300">
                {user?.fecha_inicio_beca ? format(new Date(user.fecha_inicio_beca), 'dd/MM/yy') : '-'} al {user?.fecha_fin_beca ? format(new Date(user.fecha_fin_beca), 'dd/MM/yy') : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Carrera</p>
              <p className="text-sm font-medium dark:text-gray-300">{user?.carrera || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Registro de Horas */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 dark:text-gray-200 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-500" />
          Registro Diario
        </h2>
        
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 flex gap-2 items-center text-red-800 dark:bg-red-900/40 dark:text-red-300 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        {!activeSession ? (
          <div className="text-center py-8">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30 mb-4">
              <Play className="h-10 w-10 text-primary-500 pl-1" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Listo para trabajar</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">Inicia tu jornada para empezar a contar las horas.</p>
            <Button size="lg" onClick={startShift} isLoading={actionLoading}>
              <Play className="w-4 h-4 mr-2" /> Iniciar Jornada
            </Button>
          </div>
        ) : (
          <div className="py-4 space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
              <div className="flex items-center gap-3">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">Jornada Activa</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Iniciada a las {activeSession.hora_inicio.slice(0,5)}</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-400" />
                Resumen de actividades realizadas <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Describe brevemente lo que hiciste en este período..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={actividad}
                onChange={(e) => setActividad(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button variant="danger" onClick={endShift} isLoading={actionLoading}>
                <Square className="w-4 h-4 mr-2 fill-current" /> Finalizar Jornada
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
