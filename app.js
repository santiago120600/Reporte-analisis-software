const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const xlsx = require('xlsx');
const bodyParser = require('body-parser');
app.set('view engine', 'ejs');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(express.static("public"));

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
});

app.post('/', urlencodedParser, function (req, res) {
    console.log(req.body);
    const nombre_cliente = req.body.nombre_cliente;
    const nombre_empresa  = req.body.nombre_empresa;   
    const email  = req.body.email;   
    const tel  = req.body.tel;   
    const direcccion  = req.body.direcccion;   
    const nombre_proyecto  = req.body.nombre_proyecto;   
    const problema  = req.body.problema;   
    const objetivo_gral  = req.body.objetivo_gral;   
    const objetivos_espc  = req.body.objetivos_espc;   
    const alcance_proyecto  = req.body.alcance_proyecto;   
    const factibilidad  = req.body.factibilidad;   
    const factibilidad_encuesta  = req.body.factibilidad_encuesta;   
    const presupuesto_cliente  = req.body.presupuesto_cliente;   
    const horas_trabajo_semanales  = req.body.horas_trabajo_semanales;   
    const tiempo_entrega  = req.body.tiempo_entrega;  
    const costo_hora  = req.body.costo_hora;   
    const costo_con_impuestos  = req.body.costo_con_impuestos;   
    const costo_venta  = req.body.costo_venta;   
    const subcontrataciones  = req.body.subcontrataciones;   
    const subcontrataciones_costo  = req.body.subcontrataciones_costo;   
    const acuerdos  = req.body.acuerdos;   
    const gantt  = req.body.gantt;   
    const observaciones_gantt  = req.body.observaciones_gantt;   
    const subsecuencias_gantt  = req.body.nombre_empresa;   
    const tabla_responsabilidades  = req.body.tabla_responsabilidades;   
});
