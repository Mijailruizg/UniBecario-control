import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User } from '../../types/supabase';
import { Button } from '../../components/ui/Button';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export const AdminReports = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activo' | 'inactivo'>('todos');

  useEffect(() => {
    const localUsers = JSON.parse(localStorage.getItem('mockAdminUsersList') || '[]');
    setUsers(localUsers);
  }, []);

  const generateData = async () => {
    if (!selectedUser) {
      alert('Selecciona un usuario.');
      return null;
    }
    
    setLoading(true);
    
    const mockData = JSON.parse(localStorage.getItem('mockHistory') || '[]');
    let records = mockData;
    if (month) {
       records = mockData.filter((r: any) => r.fecha.startsWith(month));
    }
    const userData = users.find(u => u.id === selectedUser);
    
    setLoading(false);

    if (!userData) {
      alert('Error al obtener datos');
      return null;
    }

    return { records, user: userData };
  };

  const handleExportPDF = async () => {
    const data = await generateData();
    if (!data) return;
    const { records, user } = data;

    const doc = new jsPDF();

    // Título
    doc.setFontSize(18);
    doc.text('Reporte de Horas - UniBecarios', 14, 22);

    // Encabezado Datos
    doc.setFontSize(11);
    doc.text(`Nombre: ${user.nombre}`, 14, 32);
    doc.text(`Carrera: ${user.carrera || '-'}`, 14, 38);
    doc.text(`Semestre: ${user.semestre || '-'}`, 110, 38);
    doc.text(`Gestión: ${user.gestion || '-'}`, 14, 44);
    doc.text(`Área/Jefe: ${user.area_jefe || '-'}`, 110, 44);

    const tableColumn = ["Fecha", "Entrada", "Salida", "Horas", "Actividad"];
    const tableRows: string[][] = [];
    let totalAcumulado = 0;

    records.forEach(r => {
      totalAcumulado += (r.total_horas || 0);
      const rowData = [
        format(new Date(r.fecha), 'dd/MM/yyyy'),
        r.hora_inicio?.slice(0,5) || '-',
        r.hora_fin?.slice(0,5) || '-',
        r.total_horas?.toString() || '0',
        r.actividad || ''
      ];
      tableRows.push(rowData);
    });

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 52,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] }, // Primary color
    });

    // Total y Firmas
    const finalY = (doc as any).lastAutoTable.finalY || 52;
    doc.setFontSize(12);
    doc.text(`Total Horas Acumuladas: ${totalAcumulado.toFixed(2)}h`, 14, finalY + 10);

    doc.line(30, finalY + 40, 90, finalY + 40);
    doc.text("Firma del Estudiante", 40, finalY + 46);

    doc.line(120, finalY + 40, 180, finalY + 40);
    doc.text("Firma del Jefe/Encargado", 125, finalY + 46);

    doc.save(`Reporte_Horas_${user.nombre.replace(/ /g, '_')}.pdf`);
  };

  const handleExportExcel = async () => {
    const data = await generateData();
    if (!data) return;
    const { records, user } = data;

    const exportData = records.map(r => ({
      Fecha: format(new Date(r.fecha), 'dd/MM/yyyy'),
      'Hora Entrada': r.hora_inicio?.slice(0,5),
      'Hora Salida': r.hora_fin?.slice(0,5),
      'Total Horas': r.total_horas || 0,
      'Actividad': r.actividad
    }));

    exportData.push({
      Fecha: 'TOTAL',
      'Hora Entrada': '',
      'Hora Salida': '',
      'Total Horas': exportData.reduce((acc, curr) => acc + (curr['Total Horas'] as number), 0),
      'Actividad': ''
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte Horas");
    
    XLSX.writeFile(workbook, `Reporte_Horas_${user.nombre.replace(/ /g, '_')}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Generar Reportes</h1>
      
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl border border-gray-100 dark:border-gray-700 p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filtrar por Estado de Becario
            </label>
            <select
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setSelectedUser('');
              }}
            >
              <option value="todos">Todos los Estados</option>
              <option value="activo">Solo Activos</option>
              <option value="inactivo">Inactivos / Pendientes / Rechazados</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Seleccionar Becario
            </label>
            <select
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">-- Seleccione un usuario --</option>
              {users
                .filter(u => statusFilter === 'todos' ? true : statusFilter === 'activo' ? u.estado === 'activo' : u.estado !== 'activo')
                .map(u => (
                <option key={u.id} value={u.id}>{u.nombre} ({u.estado.toUpperCase()})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filtrar por Mes (Opcional)
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="pt-6 flex gap-4">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleExportPDF}
              isLoading={loading}
              disabled={!selectedUser}
            >
              <FileText className="w-4 h-4 mr-2" /> Exportar PDF
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 focus:ring-green-500"
              onClick={handleExportExcel}
              isLoading={loading}
              disabled={!selectedUser}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Exportar Excel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
