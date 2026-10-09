import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User } from '../../types/supabase';
import { Button } from '../../components/ui/Button';
import { Check, X, Ban, Search, UserPlus, RotateCcw } from 'lucide-react';

export const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    nombre: '', correo: '', password: '', carrera: '', 
    fecha_fin: '', area: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('usuarios').select('*').order('created_at', { ascending:false });
    if (error) alert(error.message);
    setUsers(data || []);
    setLoading(false);
  };

  const handleStatusChange = async (userId: string, targetStatus: 'activo' | 'rechazado' | 'pendiente') => {
    const { error } = await supabase.from('usuarios').update({estado:targetStatus}).eq('id',userId);
    if (error) return alert(error.message);
    await fetchUsers();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Crear credenciales desde el servidor (Supabase Auth admin) o invitar al becario.
    // No registrar contraseñas ajenas desde un navegador con clave pública.
    alert('Por seguridad, pide al becario registrarse en Solicitar acceso; después aprueba su solicitud aquí.');
    setSaving(false);
    setShowModal(false);
  };

  const handleResetHours = async (_userId: string, _userName: string) => {
    alert('Reinicio no habilitado: se requiere un procedimiento administrativo auditado que conserve el historial.');
  };

  const filteredUsers = users.filter(u => 
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-2xl font-bold dark:text-white">Gestión de Usuarios</h1>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <Button onClick={() => setShowModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" /> Añadir Usuario
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-750">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Usuario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Carrera</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Horas</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Cargando...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No se encontraron usuarios</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 dark:bg-gray-700">
                          {user.foto_perfil ? <img className="h-10 w-10 rounded-full" src={user.foto_perfil} alt="" /> : user.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.nombre}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.correo}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.carrera || '-'} <br/> <span className="text-xs text-gray-400">{user.semestre || ''}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {user.rol}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${user.estado === 'activo' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                        ${user.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                        ${user.estado === 'rechazado' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                      `}>
                        {user.estado === 'pendiente' ? 'Pendiente' : user.estado === 'activo' ? 'Activo' : 'Rechazado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.estado === 'activo' ? 'Consultar historial' : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {user.estado === 'pendiente' && (
                        <>
                          <button onClick={() => handleStatusChange(user.id, 'activo')} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300" title="Aprobar"><Check className="w-5 h-5"/></button>
                          <button onClick={() => handleStatusChange(user.id, 'rechazado')} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300" title="Rechazar"><X className="w-5 h-5"/></button>
                        </>
                      )}
                      {user.estado === 'activo' && user.rol !== 'admin' && (
                        <>
                          <button onClick={() => handleStatusChange(user.id, 'rechazado')} className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300" title="Desactivar"><Ban className="w-5 h-5"/></button>
                          <button onClick={() => handleResetHours(user.id, user.nombre)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" title="Reiniciar a 0h"><RotateCcw className="w-5 h-5"/></button>
                        </>
                      )}
                      {user.estado === 'rechazado' && (
                        <button onClick={() => handleStatusChange(user.id, 'activo')} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300" title="Reativar"><Check className="w-5 h-5"/></button>
                      )}
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold dark:text-white">Registrar Nuevo Usuario</h2>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="addUserForm" onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
                    <input type="text" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newUser.nombre} onChange={e => setNewUser({...newUser, nombre: e.target.value})} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
                    <input type="email" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="scz.nombre@unifranz.edu.bo" value={newUser.correo} onChange={e => setNewUser({...newUser, correo: e.target.value})} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contraseña Asignada</label>
                    <input type="text" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Carrera</label>
                    <input type="text" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newUser.carrera} onChange={e => setNewUser({...newUser, carrera: e.target.value})} />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Área Asignada</label>
                    <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newUser.area} onChange={e => setNewUser({...newUser, area: e.target.value})} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de Finalización de Beca</label>
                    <input type="date" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" value={newUser.fecha_fin} onChange={e => setNewUser({...newUser, fecha_fin: e.target.value})} />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800">
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button type="submit" form="addUserForm" isLoading={saving}>Registrar Estudiante</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
