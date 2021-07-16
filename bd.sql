DROP DATABASE IF EXISTS cotizacion;
CREATE DATABASE IF NOT EXISTS cotizacion;
USE cotizacion;

CREATE TABLE cotizado(
    id_cotizado INT PRIMARY KEY AUTO_INCREMENT,
    nombre_cliente VARCHAR(80) NOT NULL,
    nombre_empresa  VARCHAR(80) NOT NULL,
    email VARCHAR(80) NOT NULL, 
    tel INT NOT NULL, 
    direccion VARCHAR(80), 
    nombre_proyecto VARCHAR(80) NOT NULL,
    problema  VARCHAR(80),
    objetivo_gral VARCHAR(80),
    alcance_proyecto TEXT,
    factibilidad TEXT,
    presupuesto_cliente DOUBLE,
    horas_trabajo_semanales INT,
    tiempo_entrega_semanas INT,
    costo_hora DOUBLE, 
    costo_con_impuestos DOUBLE,
    costo_venta DOUBLE,
    observaciones_gantt TEXT,
    costo_final  DOUBLE,
    estimacion DOUBLE,
    precio_venta DOUBLE,
    precios_impuestos DOUBLE
);

CREATE  TABLE acuerdos(
    id_acuerdos INT PRIMARY KEY AUTO_INCREMENT,
    acuerdo  VARCHAR(100) NOT NULL,
    id_cotizado INT NOT NULL,
    FOREIGN KEY(id_cotizado) REFERENCES cotizado(id_cotizado)
);

CREATE TABLE gantt(
    id_gantt INT PRIMARY KEY AUTO_INCREMENT,
    actividad VARCHAR(30) NOT NULL,
    fecha_inicio_actividad DATE NOT NULL,
    fecha_termina_actividad DATE NOT NULL,
    id_cotizado INT NOT NULL,
    FOREIGN KEY(id_cotizado) REFERENCES cotizado(id_cotizado)
); 

CREATE TABLE subcontrataciones(
    id_subcontrataciones INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(80) NOT NULL,
    costo DOUBLE,
    id_cotizado INT NOT NULL,
    FOREIGN KEY(id_cotizado) REFERENCES cotizado(id_cotizado)
);

CREATE TABLE responsabilidades(
    id_responsabilidad INT PRIMARY KEY AUTO_INCREMENT,
    responsabilidad Text NOT NULL,
    tipo enum('cliente','desarrollador') NOT NULL,
    id_cotizado INT NOT NULL,
    FOREIGN KEY(id_cotizado) REFERENCES cotizado(id_cotizado)
);
