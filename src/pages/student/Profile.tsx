import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/Button';
import { Camera, Save } from 'lucide-react';

export const StudentProfile = () => {
  const { user, setUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    carrera: user?.carrera || '',
    semestre: user?.semestre || '',
    gestion: user?.gestion || '',
    area_jefe: user?.area_jefe || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMensaje('');

    // --- MOCK BYPASS Para Demostración sin DB ---
    if (user.id.startsWith('mock-')) {
      setTimeout(() => {
        const updatedUser = { ...user, ...formData };
        setUser(updatedUser);
        
        const allMockUsers = JSON.parse(localStorage.getItem('mockUsersData') || '{}');
        allMockUsers[user.correo] = updatedUser;
        localStorage.setItem('mockUsersData', JSON.stringify(allMockUsers));

        setMensaje('Perfil actualizado correctamente (Modo Demo Local).');
        setLoading(false);
      }, 500);
      return;
    }
    // -------------------------------------------

    const { data, error } = await supabase
      .from('usuarios')
      .update(formData)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      setMensaje('Error al guardar: ' + error.message);
    } else {
      setMensaje('Perfil actualizado correctamente.');
      setUser(data);
    }
    setLoading(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (user.id.startsWith('mock-')) {
           const updatedUser = { ...user, foto_perfil: base64String };
           setUser(updatedUser);

           const allMockUsers = JSON.parse(localStorage.getItem('mockUsersData') || '{}');
           allMockUsers[user.correo] = updatedUser;
           localStorage.setItem('mockUsersData', JSON.stringify(allMockUsers));

           setMensaje('Foto actualizada en local.');
        } else {
           alert('La subida requiere conexión al API.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Mi Perfil</h1>
      
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 p-6 md:p-8">
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative h-32 w-32 rounded-full border-4 border-gray-50 dark:border-gray-700 bg-gray-100 overflow-hidden shadow-inner group">
              {user?.foto_perfil ? (
                <img src={user.foto_perfil} className="h-full w-full object-cover" alt="Perfil" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-4xl text-gray-300">
                  {user?.nombre?.charAt(0)}
                </div>
              )}
              {/* Overlay for avatar upload */}
              <label htmlFor="avatarUpload" className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                 <Camera className="text-white w-6 h-6 mb-1" />
                 <span className="text-xs text-white font-medium">Cambiar</span>
                 <input type="file" id="avatarUpload" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1 w-full">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
                  <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correo (No editable)</label>
                  <input type="text" disabled value={user?.correo} className="mt-1 block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Carrera</label>
                  <input type="text" name="carrera" value={formData.carrera} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Semestre</label>
                  <input type="text" name="semestre" value={formData.semestre} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gestión</label>
                  <input type="text" name="gestion" placeholder="Ej: 1/2026" value={formData.gestion} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Área o Jefe Asignado</label>
                  <input type="text" name="area_jefe" value={formData.area_jefe} onChange={handleChange} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                </div>
              </div>

              {mensaje && (
                <div className={`p-3 rounded-md text-sm ${mensaje.includes('Error') ? 'bg-red-50 text-red-800 dark:bg-red-900/30' : 'bg-green-50 text-green-800 dark:bg-green-900/30'}`}>
                  {mensaje}
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <Button type="submit" isLoading={loading}>
                  <Save className="w-4 h-4 mr-2" /> Guardar Cambios
                </Button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
