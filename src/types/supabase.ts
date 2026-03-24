export type UserRole = 'admin' | 'becario';
export type UserStatus = 'pendiente' | 'activo' | 'rechazado';
export type RequestStatus = 'pendiente' | 'aprobada' | 'rechazada';

export interface User {
  id: string;
  correo: string;
  nombre: string;
  rol: UserRole;
  estado: UserStatus;
  fecha_inicio_beca: string | null;
  fecha_fin_beca: string | null;
  carrera: string | null;
  semestre: string | null;
  gestion: string | null;
  area_jefe: string | null;
  foto_perfil: string | null;
  created_at: string;
  updated_at: string;
}

export interface Beca {
  id: string;
  nombre: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: boolean;
  created_at: string;
}

export interface Solicitud {
  id: string;
  usuario_id: string;
  estado: RequestStatus;
  fecha: string;
  // Relacion
  usuario?: User;
}

export interface RegistroHoras {
  id: string;
  usuario_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string | null;
  total_horas: number | null;
  actividad: string | null;
  created_at: string;
}

// Interfaz para la definición de la base de datos de Supabase
export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: User;
        Insert: Partial<User>;
        Update: Partial<User>;
      };
      becas: {
        Row: Beca;
        Insert: Partial<Beca>;
        Update: Partial<Beca>;
      };
      solicitudes: {
        Row: Solicitud;
        Insert: Partial<Solicitud>;
        Update: Partial<Solicitud>;
      };
      registros_horas: {
        Row: RegistroHoras;
        Insert: Partial<RegistroHoras>;
        Update: Partial<RegistroHoras>;
      };
    };
  };
}
