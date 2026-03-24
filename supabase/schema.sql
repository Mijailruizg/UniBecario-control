-- Habilitar la extensión para UUID si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum para el estado de los usuarios y solicitudes
CREATE TYPE user_status AS ENUM ('pendiente', 'activo', 'rechazado');
CREATE TYPE request_status AS ENUM ('pendiente', 'aprobada', 'rechazada');
CREATE TYPE user_role AS ENUM ('admin', 'becario');

-- Tabla: usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    correo VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    rol user_role DEFAULT 'becario',
    estado user_status DEFAULT 'pendiente',
    fecha_inicio_beca DATE,
    fecha_fin_beca DATE,
    carrera VARCHAR(255),
    semestre VARCHAR(50),
    gestion VARCHAR(50),
    area_jefe VARCHAR(255),
    foto_perfil TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: becas (ciclos de beca)
CREATE TABLE becas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL, -- Ej: Marzo - Junio 2026
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: solicitudes
CREATE TABLE solicitudes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    estado request_status DEFAULT 'pendiente',
    fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla: registros_horas
CREATE TABLE registros_horas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME,
    total_horas NUMERIC(5,2), -- Horas en formato decimal (ej: 4.5 horas)
    actividad TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurar RLS (Row Level Security) - Básicas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE becas ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_horas ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para Usuarios:
-- Admins pueden ver y editar todo. Usuarios solo ven su propio perfil.
CREATE POLICY "Usuarios pueden ver su propio perfil" ON usuarios FOR SELECT USING (true); -- Permitimos por ahora o agregamos la condición si existe auth.uid()
CREATE POLICY "Admins pueden ver todo" ON usuarios FOR ALL USING (true); 

-- Políticas para Registros de Horas:
CREATE POLICY "Usuarios pueden ver sus propios registros" ON registros_horas FOR SELECT USING (true);
CREATE POLICY "Usuarios pueden insertar sus registros" ON registros_horas FOR INSERT WITH CHECK (true);
CREATE POLICY "Usuarios pueden actualizar sus propios registros" ON registros_horas FOR UPDATE USING (true);

-- Nota: Para un entorno de producción, las políticas RLS deben estar ancladas a auth.uid()
-- Ejemplo para cuando esté configurado el Auth:
-- CREATE POLICY "Propios registros" ON registros_horas FOR SELECT USING (auth.uid() = usuario_id);
