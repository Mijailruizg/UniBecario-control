import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Beca } from '../../types/supabase';
import { Button } from '../../components/ui/Button';
import { Plus, Trash2, Power } from 'lucide-react';
import { format } from 'date-fns';

export const AdminScholarships = () => {
  const [becas, setBecas] = useState<Beca[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newBeca, setNewBeca] = useState({ nombre: '', fecha_inicio: '', fecha_fin: '' });

  useEffect(() => {
    fetchBecas();
  }, []);

  const fetchBecas = async () => {
    setLoading(true);
    const storedBecas = JSON.parse(localStorage.getItem('mockScholarshipsList') || '[]');
    if (storedBecas.length > 0) {
      setBecas(storedBecas);
    } else {
      setBecas([
        { id: 'mock-beca-1', nombre: 'Semestre 1/2026', fecha_inicio: '2026-03-01', fecha_fin: '2026-07-31', estado: true, created_at: new Date().toISOString() }
      ]);
    }
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const nueva = { id: 'mock-beca-' + Date.now(), ...newBeca, estado: true, created_at: new Date().toISOString() };
    const actualizadas = [nueva, ...becas];
    setBecas(actualizadas as any);
    localStorage.setItem('mockScholarshipsList', JSON.stringify(actualizadas));
    setShowModal(false);
    setNewBeca({ nombre: '', fecha_inicio: '', fecha_fin: '' });
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const actualizadas = becas.map(b => b.id === id ? { ...b, estado: !currentStatus } : b);
    setBecas(actualizadas);
    localStorage.setItem('mockScholarshipsList', JSON.stringify(actualizadas));
  };

  const deleteBeca = async (id: string) => {
    if (confirm('¿Estás seguro de eliminar este ciclo de beca?')) {
      const actualizadas = becas.filter(b => b.id !== id);
      setBecas(actualizadas);
      localStorage.setItem('mockScholarshipsList', JSON.stringify(actualizadas));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Ciclos de Becas</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" /> Crear Ciclo
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-750">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Periodo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Estado</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Cargando...</td></tr>
              ) : becas.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No hay ciclos creados</td></tr>
              ) : (
                becas.map((beca) => (
                  <tr key={beca.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {beca.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(beca.fecha_inicio), 'dd/MM/yyyy')} - {format(new Date(beca.fecha_fin), 'dd/MM/yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${beca.estado ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                        {beca.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button onClick={() => toggleStatus(beca.id, beca.estado)} className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300" title={beca.estado ? "Desactivar" : "Activar"}>
                        <Power className="w-5 h-5"/>
                      </button>
                      <button onClick={() => deleteBeca(beca.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Eliminar">
                        <Trash2 className="w-5 h-5"/>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold dark:text-white">Nuevo Ciclo de Beca</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre del Ciclo</label>
                <input type="text" required placeholder="Ej: Marzo - Junio 2026" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={newBeca.nombre} onChange={e => setNewBeca({...newBeca, nombre: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Inicio</label>
                  <input type="date" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={newBeca.fecha_inicio} onChange={e => setNewBeca({...newBeca, fecha_inicio: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Fin</label>
                  <input type="date" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white" value={newBeca.fecha_fin} onChange={e => setNewBeca({...newBeca, fecha_fin: e.target.value})} />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancelar</Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
