DROP DATABASE IF EXISTS cotizacion;
CREATE DATABASE IF NOT EXISTS cotizacion;
USE cotizacion;

CREATE TABLE costos(
    id_costos INT PRIMARY KEY AUTO_INCREMENT,
    costo_hora DOUBLE, 
    costo_con_impuestos DOUBLE, 
    costo_venta DOUBLE,
    gastos_fijos DOUBLE,
    precios_impuestos DOUBLE
);

INSERT INTO costos VALUES(null,200,210,300,10000,200);

CREATE TABLE cliente(
    id_cliente INT PRIMARY KEY AUTO_INCREMENT,
    nombre_cliente VARCHAR(80) NOT NULL,
    nombre_empresa  VARCHAR(80) NOT NULL,
    email VARCHAR(80) NOT NULL, 
    tel INT NOT NULL, 
    direccion VARCHAR(80) 
);

INSERT INTO cliente VALUES(null,'juan carlos villagran','juan inc','juan@gmail.com',768768,'calle rosales #55');

CREATE TABLE cotizado(
    id_cotizado INT PRIMARY KEY AUTO_INCREMENT,
    nombre_proyecto VARCHAR(80) NOT NULL UNIQUE,
    problema  VARCHAR(80),
    objetivo_gral VARCHAR(80),
    alcance_proyecto TEXT,
    factibilidad TEXT,
    presupuesto_cliente DOUBLE,
    horas_trabajo_semanales INT,
    tiempo_entrega_semanas INT,
    observaciones_gantt TEXT,
    costo_final  DOUBLE,
    estimacion DOUBLE,
    precio_venta DOUBLE,
    id_cliente INT NOT NULL,
    FOREIGN KEY(id_cliente) REFERENCES cliente(id_cliente)
);
INSERT INTO cotizado VALUES(null,'proyecto juan','problema','objetivo general','alcance','Es factible',9000,8,8,'Observacion gantt',null,null,null,1);

CREATE  TABLE acuerdos(
    id_acuerdos INT PRIMARY KEY AUTO_INCREMENT,
    acuerdo  VARCHAR(100) NOT NULL,
    id_cotizado INT NOT NULL,
    FOREIGN KEY(id_cotizado) REFERENCES cotizado(id_cotizado)
);
INSERT INTO acuerdos VALUES(null,'No cambios durante la entrega',1);

CREATE TABLE gantt(
    id_gantt INT PRIMARY KEY AUTO_INCREMENT,
    actividad VARCHAR(30) NOT NULL,
    fecha_inicio_actividad DATE NOT NULL,
    fecha_termina_actividad DATE NOT NULL,
    id_cotizado INT NOT NULL,
    puntos_cosmic INT,
    costo DOUBLE,
    FOREIGN KEY(id_cotizado) REFERENCES cotizado(id_cotizado)
); 
INSERT INTO gantt VALUES(null,'actividad 1','2021-06-07','2021-06-11',1,8,500);

CREATE TABLE subcontrataciones(
    id_subcontrataciones INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(80) NOT NULL,
    costo DOUBLE,
    id_cotizado INT NOT NULL,
    FOREIGN KEY(id_cotizado) REFERENCES cotizado(id_cotizado)
);
INSERT INTO subcontrataciones VALUES(null,'mario vargaz',1000,1);

CREATE TABLE responsabilidades(
    id_responsabilidad INT PRIMARY KEY AUTO_INCREMENT,
    responsabilidad Text NOT NULL,
    tipo enum('cliente','desarrollador') NOT NULL,
    id_cotizado INT NOT NULL,
    FOREIGN KEY(id_cotizado) REFERENCES cotizado(id_cotizado)
);
INSERT INTO responsabilidades VALUES(null,'Entregar a tiempo','desarrollador',1);

CREATE OR REPLACE VIEW cotizado_view AS SELECT c.*,cl.nombre_cliente,cl.nombre_empresa,cl.email,cl.tel,cl.direccion FROM cotizado AS c JOIN cliente AS cl ON c.id_cliente = cl.id_cliente; 
