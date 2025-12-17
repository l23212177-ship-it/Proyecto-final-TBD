-- schema.sql - Crear base de datos y tablas

-- 1. Crear la base de datos
CREATE DATABASE IF NOT EXISTS gestion_pacientes;
USE gestion_pacientes;

-- 2. Tabla de pacientes
CREATE TABLE IF NOT EXISTS pacientes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    edad INT NOT NULL,
    frecuencia_cardiaca INT NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de cuadrantes de la camilla
CREATE TABLE IF NOT EXISTS cuadrantes_camilla (
    id INT PRIMARY KEY AUTO_INCREMENT,
    paciente_id INT NOT NULL,
    cuadrante CHAR(1) NOT NULL,
    temperatura DECIMAL(4,1) NOT NULL,
    nivel_movimiento ENUM('poco', 'estable', 'mucho') NOT NULL,
    umbral_movimiento INT NOT NULL,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    INDEX idx_paciente (paciente_id),
    INDEX idx_cuadrante (cuadrante)
);

-- 4. Insertar datos de ejemplo
INSERT INTO pacientes (nombre, edad, frecuencia_cardiaca) VALUES
('Juan Pérez', 45, 78),
('María García', 32, 85),
('Carlos López', 61, 92),
('Ana Rodríguez', 28, 72),
('Luis Martínez', 55, 88),
('Sofía Hernández', 40, 76),
('Miguel Torres', 65, 94),
('Elena Castro', 33, 81);

-- 5. Insertar datos de cuadrantes para algunos pacientes
INSERT INTO cuadrantes_camilla (paciente_id, cuadrante, temperatura, nivel_movimiento, umbral_movimiento) VALUES
(1, 'A', 36.8, 'estable', 45),
(1, 'B', 37.2, 'poco', 28),
(1, 'C', 36.5, 'mucho', 67),
(1, 'D', 37.8, 'estable', 52),
(1, 'E', 36.9, 'poco', 31),
(1, 'F', 37.1, 'estable', 48),
(2, 'A', 37.4, 'mucho', 70),
(2, 'B', 36.5, 'poco', 25),
(2, 'C', 37.8, 'estable', 50),
(2, 'D', 36.9, 'poco', 30),
(2, 'E', 37.4, 'mucho', 68),
(2, 'F', 36.7, 'estable', 44);

-- 6. Verificar que todo se creó correctamente
SELECT '✅ Base de datos y tablas creadas exitosamente' as Mensaje;
SELECT COUNT(*) as 'Total de pacientes' FROM pacientes;
SELECT COUNT(*) as 'Total de registros de cuadrantes' FROM cuadrantes_camilla;
