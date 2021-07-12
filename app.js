const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const xlsx = require('xlsx');
const bodyParser = require('body-parser');
app.set('view engine', 'ejs');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(express.static("public"));

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('X-Content-Type-Options', 'nosniff');
    next();
});


app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
});

app.post('/', urlencodedParser, function (req, res) {
    // console.info(req.body);
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

    const actividad  = req.body.actividad;   
    const fecha_inicio_actividad  = req.body.fecha_inicio_actividad;   
    const fecha_termina_actividad  = req.body.fecha_termina_actividad; 
    generarGantt(actividad,fecha_inicio_actividad,fecha_termina_actividad);


    // generarChecklist(objetivos_espc);
    res.redirect('/');
    res.end();
});

const generarChecklist = (lista_tareas) =>{
    const workBook = xlsx.utils.book_new();
    const checklist= [
        ["Objetivo","Realizado"]
    ];
    lista_tareas.forEach(agregar_a_lista);
    function agregar_a_lista(value){
        checklist.push([value,""]);
    }
    var workSheet = xlsx.utils.aoa_to_sheet(checklist);
    xlsx.utils.book_append_sheet(workBook,workSheet,'checklist');
    xlsx.writeFile(workBook,path.resolve('./outputFiles/excelFile.xlsx'));
}

const generarGantt = (actividad,fecha_inicio_actividad,fecha_termina_actividad) => {
    const gantt_list = [
        ["Actividad","Fecha Inicio","Fecha ternmina"]
    ];
    for (index = 0; index < actividad.length; index++) {
        gantt_list.push([actividad[index],fecha_inicio_actividad[index],fecha_termina_actividad[index]]);
    }
    console.log(gantt_list);
}

