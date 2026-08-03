-- Creación de tablas maestras
CREATE TABLE Agentes (
    id_agente INT PRIMARY KEY IDENTITY(1,1),
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20)
);

CREATE TABLE Clientes (
    id_cliente INT PRIMARY KEY IDENTITY(1,1),
    nombre_completo VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    estado_lead VARCHAR(20) DEFAULT 'Nuevo', -- Nuevo, En Contacto, Negociacion, Cerrado
    fecha_registro DATETIME DEFAULT GETDATE()
);

-- Tabla de Inventario Unificado
CREATE TABLE Propiedades (
    id_propiedad INT PRIMARY KEY IDENTITY(1,1),
    tipo_activo VARCHAR(50) NOT NULL, -- 'Terreno', 'Departamento', 'Casa'
    titulo VARCHAR(200) NOT NULL,
    precio DECIMAL(18,2) NOT NULL,
    area_m2 DECIMAL(10,2),
    ubicacion VARCHAR(255),
    estado VARCHAR(20) DEFAULT 'Disponible', -- Disponible, Reservado, Vendido
    id_agente INT,
    FOREIGN KEY (id_agente) REFERENCES Agentes(id_agente)
);

-- Módulo CRM: Registro de Interacciones
CREATE TABLE Interacciones_CRM (
    id_interaccion INT PRIMARY KEY IDENTITY(1,1),
    id_cliente INT NOT NULL,
    id_propiedad INT NULL, -- Puede ser NULL si es un contacto general
    tipo_contacto VARCHAR(50), -- Llamada, Email, Visita Presencial
    notas TEXT,
    fecha_interaccion DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (id_cliente) REFERENCES Clientes(id_cliente),
    FOREIGN KEY (id_propiedad) REFERENCES Propiedades(id_propiedad)
);  