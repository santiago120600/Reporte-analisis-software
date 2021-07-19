const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const xlsx = require('xlsx');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
var db = require('./db');
app.set('view engine', 'ejs');

var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(express.static("public"));

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('X-Content-Type-Options', 'nosniff');
    next();
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`)
});

app.get('/', (req, res) => {
    db.query('SELECT id_cotizado, nombre_proyecto FROM cotizado', (error,results)=>{
        if (error) {
            return res.render('selection',{error:error.message});
          }
        res.render('selection',{data:results});
    });
});

app.post('/', urlencodedParser,(req, res) =>{
    var id_proyecto =req.body.project;
    var sql = 'SELECT * FROM cotizado WHERE id_cotizado = ?';
    db.query(sql,[id_proyecto], (error,results)=>{
        var cotizado = results[0];
        if (error) {
            return res.render('selection',{error:error.message});
          }
        db.query('SELECT * FROM acuerdos WHERE id_cotizado = ?',[id_proyecto],(error,results)=>{
        var acuerdos = results;
            if (error) {
                return res.render('selection',{error:error.message});
              }
            db.query('SELECT * FROM gantt WHERE id_cotizado = ? ORDER BY fecha_inicio_actividad',[id_proyecto],(error,results)=>{
            var gantt = results;
                if (error) {
                    return res.render('selection',{error:error.message});
                  }
                db.query('SELECT * FROM subcontrataciones WHERE id_cotizado = ?',[id_proyecto],(error,results)=>{
                var subcontrataciones = results;
                    if (error) {
                        return res.render('selection',{error:error.message});
                      }
                    db.query('SELECT * FROM responsabilidades WHERE id_cotizado = ?',[id_proyecto],(error,results)=>{
                    var responsabilidades = results;
                        if (error) {
                            return res.render('selection',{error:error.message});
                          }
                        console.log(acuerdos);
                        res.render('tablas',{cotizado:cotizado,acuerdos:acuerdos,gantt:gantt,subcontrataciones:subcontrataciones,responsabilidades:responsabilidades});
                    });
                });
            });
        });
    });
});

app.get('/formulario', (req, res) => {
    res.render('index');
});

app.post('/formulario', urlencodedParser, [ 
    check('nombre_cliente','Ingrese un nombre de cliente').exists().isLength({max:80}).withMessage('Máximo 80 carácteres'),
    check('nombre_empresa','Ingrese un nombre de empresa').exists().isLength({max:80}).withMessage('Máximo 80 carácteres'),
    check('email','Ingrese un email valido').exists().isEmail().isLength({max:80}).withMessage('Máximo 80 carácteres'),
], (req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.array());
        res.render('index',{validaciones:errors.array(),valores:req.body});
    }else{
        //console.log(req.body);
         insertData(req.body)
        return res.render('gantt',{actividad:req.body.actividad,fecha_inicio:req.body.fecha_inicio_actividad,fecha_termina:req.body.fecha_termina_actividad,costo_hora:req.body.costo_hora,horas_trabajo:req.body.horas_trabajo_semanales, acuerdos:new Array(req.body.acuerdos), responsabilidades:getSubcontrataciones(req.body.responsabilidades,req.body.responsabilidad_tipo),subcontrataciones:getSubcontrataciones(req.body.subcontrataciones,req.body.costo_subcontratacion),gantt:getGantt(req.body.actividad,req.body.fecha_inicio_actividad,req.body.fecha_termina_actividad)});
    }
});

const insertData = (data) =>{
    var sql = "INSERT INTO cotizado (nombre_cliente, nombre_empresa, email, tel,  direccion,nombre_proyecto, problema, objetivo_gral, alcance_proyecto, factibilidad,  presupuesto_cliente, horas_trabajo_semanales, tiempo_entrega_semanas, costo_hora, costo_con_impuestos, costo_venta, observaciones_gantt) VALUES ?";
    var values = [
        [data.nombre_cliente, data.nombre_empresa, data.email, data.tel,data.direcccion,data.nombre_proyecto,data.problema,data.objetivo_gral,data.alcance_proyecto,data.factibilidad,data.presupuesto_cliente,data.horas_trabajo_semanales,data.tiempo_entrega,data.costo_hora,data.costo_con_impuestos,data.costo_venta,data.observaciones_gantt]
      ];

    var sqlAcuerdos = "INSERT INTO acuerdos (acuerdo,id_cotizado) VALUES ?";
    var acuerdos =  data.acuerdos;
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
                if(Array.isArray(acuerdos)==false){
                  acuerdos = new Array(acuerdos);
                }  
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
                if(data.subcontrataciones!=''){
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
  if(Array.isArray(lista_actividades)==false && Array.isArray(lista_fecha_inicio)==false && Array.isArray(lista_fecha_termina)==false){
      lista_actividades = new Array(lista_actividades);
      lista_fecha_inicio = new Array(lista_fecha_inicio);
      lista_fecha_termina = new Array(lista_fecha_termina);
  }  
  const lista = [];
  for (i = 0; i < lista_actividades.length; i++) {
    lista.push([lista_actividades[i],lista_fecha_inicio[i],lista_fecha_termina[i]]);
  }
  return lista;
}

const getSubcontrataciones = (lista_nombres,lista_costos)=>{
  if(lista_nombres==''){
      return [];
  }  
  if(Array.isArray(lista_nombres)==false && Array.isArray(lista_costos)==false){
      lista_nombres = new Array(lista_nombres);
      lista_costos = new Array(lista_costos);
  }  
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


