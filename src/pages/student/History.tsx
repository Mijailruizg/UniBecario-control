import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { Download, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const StudentHistory = () => {
  const { user } = useAuthStore();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      if (user.id.startsWith('mock-')) {
        const past = JSON.parse(localStorage.getItem('mockHistory') || '[]');
        if (past.length === 0) {
          const dummy = [{
            id: 'dummy-1', fecha: '2026-03-20', hora_inicio: '08:00:00', hora_fin: '12:00:00',
            total_horas: 4.0, actividad: 'Revisión y orden de inventario inicial.'
          }];
          setHistory(dummy);
        } else {
          setHistory(past);
        }
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('registros_horas')
        .select('*')
        .eq('usuario_id', user.id)
        .order('fecha', { ascending: false })
        .order('hora_inicio', { ascending: false });

      if (data) setHistory(data);
      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  if (loading) return <div>Cargando historial...</div>;

  const handleExportExcel = () => {
    if (history.length === 0) return;
    
    const formattedData = history.map(r => {
      const h = r.total_horas ? Math.floor(r.total_horas) : 0;
      const m = r.total_horas ? Math.round((r.total_horas % 1) * 60) : 0;
      return {
        'Fecha': format(new Date(r.fecha), 'dd/MM/yyyy'),
        'Entrada': r.hora_inicio?.slice(0, 5) || '-',
        'Salida': r.hora_fin ? r.hora_fin.slice(0, 5) : 'En curso',
        'Total Horas Trabajadas': r.total_horas ? `${h}h ${m}m` : '-',
        'Actividad Realizada': r.actividad || '-'
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mi_Historial");
    XLSX.writeFile(workbook, `Historial_${user?.nombre?.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
  };

  const handleDeleteRecord = async (id: string, horas: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este registro? Las horas se restarán de tu progreso.')) return;
    
    if (user?.id.startsWith('mock-')) {
       // Eliminar del localStorage
       const currentHistory = JSON.parse(localStorage.getItem('mockHistory') || '[]');
       const newHistory = currentHistory.filter((r: any) => r.id !== id);
       localStorage.setItem('mockHistory', JSON.stringify(newHistory));
       
       // Si era un user dummy hardcodeado:
       if (id.startsWith('dummy-')) {
         setHistory(history.filter(r => r.id !== id));
       } else {
         setHistory(newHistory);
       }
       
       // Restar horas del dashboard global
       let currentMockTotal = parseFloat(localStorage.getItem('mockTotalHoras') || '120.5');
       currentMockTotal = Math.max(0, currentMockTotal - (horas || 0));
       localStorage.setItem('mockTotalHoras', currentMockTotal.toString());
       return;
    }

    const { error } = await supabase.from('registros_horas').delete().eq('id', id);
    if (!error) {
       setHistory(prev => prev.filter(r => r.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-2">
        <h1 className="text-2xl font-bold dark:text-white">Historial de Registros</h1>
        <Button onClick={handleExportExcel} disabled={history.length === 0}>
          <Download className="w-4 h-4 mr-2" /> Exportar a Excel
        </Button>
      </div>      
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase text-gray-700 dark:text-gray-300 border-b dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 font-semibold">Fecha</th>
                <th className="px-6 py-4 font-semibold">Entrada</th>
                <th className="px-6 py-4 font-semibold">Salida</th>
                <th className="px-6 py-4 font-semibold">Total Horas</th>
                <th className="px-6 py-4 font-semibold w-1/3">Actividad</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No hay registros de horas.
                  </td>
                </tr>
              ) : (
                history.map((record) => (
                  <tr key={record.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {format(new Date(record.fecha), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hora_inicio?.slice(0, 5)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.hora_fin ? record.hora_fin.slice(0, 5) : <span className="text-yellow-500 text-xs font-semibold">En curso</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-primary-600 dark:text-primary-400">
                      {record.total_horas ? `${Math.floor(record.total_horas)}h ${Math.round((record.total_horas % 1) * 60)}m` : '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {record.actividad || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                         onClick={() => handleDeleteRecord(record.id, record.total_horas)}
                         className="text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg transition-colors"
                         title="Eliminar registro"
                      >
                         <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
