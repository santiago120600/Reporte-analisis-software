const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const xlsx = require('xlsx');
const bodyParser = require('body-parser');
var db = require('./db');
const { Console } = require('console');
app.set('view engine', 'ejs');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(express.static("public"));

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('X-Content-Type-Options', 'nosniff');
    next();
});


app.get('/', (req, res) => {
    res.render('index',{actividad:'',fecha_inicio:'',fecha_termina:''});
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
});

app.post('/', urlencodedParser, function (req, res) {
    insertData(req.body);
    return res.render('gantt',{actividad:req.body.actividad,fecha_inicio:req.body.fecha_inicio_actividad,fecha_termina:req.body.fecha_termina_actividad});
});

const insertData = (data) =>{
    var sql = "INSERT INTO cotizado (nombre_cliente, nombre_empresa, email, tel,  direccion,nombre_proyecto, problema, objetivo_gral, alcance_proyecto, factibilidad,  presupuesto_cliente, horas_trabajo_semanales, tiempo_entrega_semanas, costo_hora, costo_con_impuestos, costo_venta, observaciones_gantt) VALUES ?";
    var values = [
        [data.nombre_cliente, data.nombre_empresa, data.email, data.tel,data.direcccion,data.nombre_proyecto,data.problema,data.objetivo_gral,data.alcance_proyecto,data.factibilidad,data.presupuesto_cliente,data.horas_trabajo_semanales,data.tiempo_entrega,data.costo_hora,data.costo_con_impuestos,data.costo_venta,data.observaciones_gantt]
      ];

    var sqlAcuerdos = "INSERT INTO acuerdos (acuerdo,id_cotizado) VALUES ?";
    var acuerdos = data.acuerdos;
    var sqlGantt = "INSERT INTO gantt (actividad,fecha_inicio_actividad,fecha_termina_actividad,id_cotizado) VALUES ?";
    var gantt =getGantt(data.actividad,data.fecha_inicio_actividad,data.fecha_termina_actividad);
    var sqlSubcontrataciones = "INSERT INTO subcontrataciones(nombre,costo,id_cotizado) VALUES ?";
    var subcontrataciones = getSubcontrataciones(data.subcontrataciones,data.costo_subcontratacion);
    var sqlResponsabilidades = "INSERT INTO responsabilidades(responsabilidad,tipo,id_cotizado) VALUES ?";
    var responsabilidades = getSubcontrataciones(data.responsabilidades,data.responsabilidad_tipo);

    try{
      db.beginTransaction(function(e){
          if (e) { throw e; }
          // Insertar en la tabla de cotizado
          db.query(sql, [values], function(err, result) { 
              if (err) {
                  throw err;
              }else{
                // insertar en acuerdos   
                for(i = 0; i < acuerdos.length; i++){
                    var value = [
                        [acuerdos[i],result.insertId]
                    ];
                    db.query(sqlAcuerdos,[value],function(err,result){
                        if (err) {
                              throw err;
                          }
                    });
                } 
                // insertar en gantt 
                for(i = 0; i < gantt.length; i++){
                    var value = [
                        [gantt[i][0],gantt[i][1],gantt[i][2],result.insertId]
                    ];
                    db.query(sqlGantt,[value],function(err,result){
                        if (err) {
                              throw err;
                          }
                    });
                } 
                // insertar en subcontrataciones 
                for(i = 0; i < subcontrataciones.length; i++){
                    var value = [
                        [subcontrataciones[i][0],subcontrataciones[i][1],result.insertId]
                    ];
                    db.query(sqlSubcontrataciones,[value],function(err,result){
                        if (err) {
                              throw err;
                          }
                    });
                } 
                // insertar en responsabilidades 
                for(i = 0; i < responsabilidades.length; i++){
                    var value = [
                        [responsabilidades[i][0],responsabilidades[i][1],result.insertId]
                    ];
                    db.query(sqlResponsabilidades,[value],function(err,result){
                        if (err) {
                              throw err;
                          }
                    });
                } 
              }
            });

  
          db.commit(function(err) {
              if (err) {
                  throw err;
              }
              console.log('success!');
            });
      });
    }catch(e){
      console.log(e);
      db.rollback();
    }
}

const getGantt = (lista_actividades,lista_fecha_inicio,lista_fecha_termina) =>{
  // retornar una lista de listas [["actividad","2020-06-12","2020-06-12"],["actividad","2020-06-12","2020-06-12"]]
  const lista = [];
  for (i = 0; i < lista_actividades.length; i++) {
    lista.push([lista_actividades[i],lista_fecha_inicio[i],lista_fecha_termina[i]]);
  }
  return lista;
}

const getSubcontrataciones = (lista_nombres,lista_costos)=>{
  const lista = [];
  for (i = 0; i < lista_nombres.length; i++) {
    lista.push([lista_nombres[i],lista_costos[i]]);
  }
  return lista;
}

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


