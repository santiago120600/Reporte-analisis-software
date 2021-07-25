const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');
app.set('view engine', 'ejs');
var fs = require('./modules/functions.js');

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

app.get('/general', async (req, res) => {
    var id_proyecto =req.query.id_cotizacion;
    var cotizado = await fs.queryData(`SELECT * FROM cotizado_view WHERE id_cotizado = ${id_proyecto}`);
    var acuerdos =  await fs.queryData(`SELECT * FROM acuerdos WHERE id_cotizado = ${id_proyecto}`);
    var gantt =  await fs.queryData(`SELECT * FROM gantt WHERE id_cotizado = ${id_proyecto} ORDER BY fecha_inicio_actividad`);
    var subcontrataciones =  await fs.queryData(`SELECT * FROM subcontrataciones WHERE id_cotizado = ${id_proyecto}`);
    var responsabilidades =  await fs.queryData(`SELECT * FROM responsabilidades WHERE id_cotizado = ${id_proyecto}`);
    return res.render('tablas',{id_cotizado:cotizado[0]['id_cotizado'],acuerdos:acuerdos,gantt:gantt,subcontrataciones:subcontrataciones,responsabilidades:responsabilidades,nombre_proyecto:cotizado[0]['nombre_proyecto'],nombre_cliente:cotizado[0]['nombre_cliente'], nombre_empresa:cotizado[0]['nombre_empresa'], email:cotizado[0]['email'], problema:cotizado[0]['problema'],objetivo:cotizado[0]['objetivo_gral'],alcance:cotizado[0]['alcance_proyecto'],factibilidad:cotizado[0]['factibilidad'],presupuesto:cotizado[0]['presupuesto_cliente'],tiempo_entrega:cotizado[0]['tiempo_entrega_semanas'],observaciones_gantt:cotizado[0]['observaciones_gantt'],costo_final:cotizado[0]['costo_final'],costo_punto_funcion:cotizado[0]['costo_punto_funcion'],costo_subcontrataciones:cotizado[0]['costo_subcontrataciones'],duracion_proyecto:cotizado[0]['duracion_proyecto']});
});

app.get('/costos', (req, res) => {
    id_cotizacion = req.query.id_cotizacion;
    fs.queryData('SELECT * FROM costos WHERE id_costos = 1')
    .then(function(i){
          res.render('costos',{costo_hora:i[0]['costo_hora'],precio_venta:i[0]['precio_venta'],costo_impuestos:i[0]['costo_con_impuestos'],gastos:i[0]['gastos_fijos_anuales'],sueldo:i[0]['sueldo'],id:id_cotizacion,puntos:i[0]['puntos_funcion_mes']});
    }).catch(function(e){
    console.log(e.sqlMessage);
    });
});

app.get('/clientes', (req, res) => {
    id_cotizacion = req.query.id_cotizacion;
    fs.queryData('SELECT * FROM cliente')
    .then(function(i){
          res.render('clientes',{'clientes':i,'id':id_cotizacion});
    }).catch(function(e){
    console.log(e.sqlMessage);
    });
});

app.get('/clientesform', (req, res) => {
    id_cliente = req.query.id_cliente;
    if(typeof id_cliente == 'undefined'){
        return res.render('clientes_form',{'id_cliente':'','nombre_cliente':'','nombre_empresa':'','email':'','tel':'','direccion':'','id_cotizacion':''});
    }else{
        id_cotizacion = req.query.id_cotizacion;
        fs.queryData(`SELECT * FROM cliente WHERE id_cliente = ${id_cliente}`)
        .then(function(i){
            return res.render('clientes_form',{'id_cliente':id_cliente,'nombre_cliente':i[0]['nombre_cliente'],'nombre_empresa':i[0]['nombre_empresa'],'email':i[0]['email'],'tel':i[0]['tel'],'direccion':i[0]['direccion'],'id_cotizacion':id_cotizacion});
        }).catch(function(e){
            console.log(e.sqlMessage);
        });
    }
});

app.get('/acuerdosform', (req, res) => {
    id = req.query.id;
    return res.render('acuerdos_form',{"id_cotizado":id});
});

app.get('/responsabilidadesform', (req, res) => {
    id = req.query.id;
    return res.render('responsabilidades_form',{"id_cotizado":id});
});

app.get('/subcontratacionesform', (req, res) => {
    id = req.query.id;
    return res.render('subcontrataciones_form',{"id_cotizado":id});
});

app.get('/actividadesform', (req, res) => {
    id = req.query.id;
    return res.render('actividades_form',{"id_cotizado":id});
});

app.get('/cotizadoEditForm', (req, res) => {
    id = req.query.id;
    fs.queryData(`SELECT * FROM cotizado WHERE id_cotizado = ${id}`).then(function(value){
        return res.render('cotizado_edit_form',{
            id_cotizado: value[0]['id_cotizado'],
            nombre_proyecto: value[0]['nombre_proyecto'],
            problema: value[0]['problema'],
            objetivo_gral: value[0]['objetivo_gral'],
            alcance_proyecto: value[0]['alcance_proyecto'],
            factibilidad: value[0]['factibilidad'],
            presupuesto_cliente: value[0]['presupuesto_cliente'],
            tiempo_entrega_semanas: value[0]['tiempo_entrega_semanas'],
            observaciones_gantt: value[0]['observaciones_gantt']
        });
    }).catch(function(e){
        console.log(e);
    });
});

app.get('/cotizadoform', async (req, res) => {
    try{
        const result = await fs.queryData("SELECT * FROM cliente");
        return res.render('cotizado_form',{data:result});
    }catch(e){
        console.log(e);
    }
});

app.get('/costosform', async (req, res) => {
    //mandar la informacion de los costos para mostrarlos en el formulario
    fs.queryData('SELECT * FROM costos WHERE id_costos = 1').then(function(i){
        return res.render('costos_form',{data:i[0]});
    }).catch(function(e){
        console.log(e);
    })
});

app.get('/gantt', (req, res) => {
    var id =req.query.id_cotizacion;
    fs.queryData(`SELECT * FROM gantt WHERE id_cotizado = ${id}`).then(function(value){
        result = fs.listToStringGantt(value);
        return res.render('gantt',{actividades:result['actividades'],fecha_inicio:result['fecha_inicio'],fecha_termina:result['fecha_termina'],costo:result['costo'],id:id,});
    }).catch(function(e){
        console.log(e);
    });
});

app.get('/', async (req, res) => {
    try{
        var data = await fs.queryData('SELECT id_cotizado, nombre_proyecto FROM cotizado');
        res.render('selection',{data:data});
    }catch(e){
        console.log(e);
    }
});

app.get('/formulario',async (req, res) => {
    try{
        var data = await fs.queryData("SELECT * FROM cliente");
        res.render('index',{data:data});
    }catch(e){
        console.log(e);
    }
});

app.post('/formulario', urlencodedParser, [
    check('nombre_proyecto','Ingrese un nombre de proyecto').exists().isLength({max:80}).withMessage('Máximo 80 carácteres'),
], (req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.end(JSON.stringify({ status: 'error',message: errors.array(),valores:req.body}));
    }else{
        fs.queryData('SELECT * FROM costos WHERE id_costos = 1').then(function(i){
            costo_hora = i[0]['costo_hora'];
            puntos_de_funcion_al_mes = i[0]['puntos_funcion_mes'];
            fs.insertData(req.body,costo_hora,puntos_de_funcion_al_mes).then(function(i){
                return res.end(JSON.stringify({ status: 'success',message:'Reistrado correctamente'}));
            }).catch(function(e){
                return res.end(JSON.stringify({ status: 'error',message: e}));
            });
        }).catch(function(e){
            return res.end(JSON.stringify({ status: 'error',message: e}));
        });

    }
});

app.post('/cotizadoEditForm', urlencodedParser, (req, res) =>{
    fs.updateData('cotizado',req.body,{'id_cotizado':req.body.id_cotizado}).then(function(i){
        return res.end(JSON.stringify({ status: 'success',message:'Actualizado correctamente'}));
    }).catch(function(e){
        return res.end(JSON.stringify({ status: 'error',message: e}));
    })
});

app.post('/savecliente', urlencodedParser, (req, res)=>{
    if(req.body.id_cliente!=''){
        id_cotizacion = req.body.id_cotizacion;
        fs.updateData('cliente',{
            'nombre_cliente':req.body.nombre_cliente,
            'nombre_empresa':req.body.nombre_empresa,
            'email':req.body.email,
            'tel':req.body.tel,
            'direccion':req.body.direccion
        },{'id_cliente':req.body.id_cliente}).then(function(i){
            return res.end(JSON.stringify({ status: 'success',message:'Registrado correctamente',method:'update',data:id_cotizacion }));
        }).catch(function(e){
            return res.end(JSON.stringify({ status: 'error',message:e.sqlMessage }));
        });
    }else{
        var values = [
            [req.body.nombre_cliente,req.body.nombre_empresa,req.body.email,req.body.tel,req.body.direccion]
        ];
        fs.saveData('INSERT INTO cliente (nombre_cliente,nombre_empresa,email,tel,direccion) VALUES ?',values)
        .then(function(value){
            return res.end(JSON.stringify({ status: 'success',message:'Registrado correctamente',method:'post' }));
        }).catch(function(value){
            return res.end(JSON.stringify({ status: 'error',message:value }));
        });
    }
});

app.post('/deleteAll', urlencodedParser, (req, res)=>{
    fs.deleteAll(req.body.id_cotizado).then(function(i){
        return res.end(JSON.stringify({ status: 'success',message:'Eliminado correctamente' }));
    }).catch(function(e){
        return res.end(JSON.stringify({ status: 'error',message:e }));
    });
});

app.post('/deleteGantt', urlencodedParser, (req, res)=>{
    id =req.body.id_actividad;
    fs.deleteItem('gantt',{'id_gantt':id}).then(function(i){
        return res.end(JSON.stringify({ status: 'success',message:'Eliminado correctamente' }));
    }).catch(function(e){
        return res.end(JSON.stringify({ status: 'error',message:e }));
    });
});

app.post('/deleteSubcontratacion', urlencodedParser, (req, res)=>{
    id =req.body.id;
    fs.deleteItem('subcontrataciones',{'id_subcontrataciones':id}).then(function(i){
        return res.end(JSON.stringify({ status: 'success',message:'Eliminado correctamente' }));
    }).catch(function(e){
        return res.end(JSON.stringify({ status: 'error',message:e }));
    });
});

app.post('/deleteResponsabilidad', urlencodedParser, (req, res)=>{
    id =req.body.id;
    fs.deleteItem('responsabilidades',{'id_responsabilidad':id}).then(function(i){
        return res.end(JSON.stringify({ status: 'success',message:'Eliminado correctamente' }));
    }).catch(function(e){
        return res.end(JSON.stringify({ status: 'error',message:e }));
    });
});

app.post('/deleteAcuerdo', urlencodedParser, (req, res)=>{
    id =req.body.id;
    fs.deleteItem('acuerdos',{'id_acuerdos':id}).then(function(i){
        return res.end(JSON.stringify({ status: 'success',message:'Eliminado correctamente' }));
    }).catch(function(e){
        return res.end(JSON.stringify({ status: 'error',message:e }));
    });
});

app.post('/deleteCliente', urlencodedParser, (req, res)=>{
    id =req.body.id;
    fs.deleteItem('cliente',{'id_cliente':id}).then(function(i){
        return res.end(JSON.stringify({ status: 'success',message:'Eliminado correctamente' }));
    }).catch(function(e){
        return res.end(JSON.stringify({ status: 'error',message:e.sqlMessage }));
    });
});

app.post('/newAcuerdo', urlencodedParser, (req, res)=>{
    var values = [];
    id_cotizado =req.body.id_cotizado;
    acuerdos = req.body.acuerdos;
    if(Array.isArray(acuerdos)==false){
        values = [[acuerdos,id_cotizado]];
    }else{
        acuerdos.forEach((value)=>{
            values.push([value,id_cotizado]);
        })
    } 
    fs.saveData('INSERT INTO acuerdos (acuerdo,id_cotizado) VALUES ?',values)
    .then(function(value){
        return res.end(JSON.stringify({ status: 'success',message:'Registrado correctamente' }));
    }).catch(function(value){
        return res.end(JSON.stringify({ status: 'error',message:value.sqlMessage }));
    });
});

app.post('/newResponsabilidad', urlencodedParser, (req, res)=>{
    var values = [];
    id_cotizado =req.body.id_cotizado;
    responsabilidad = req.body.responsabilidades;
    responsabilidad_tipo = req.body.responsabilidad_tipo;
    if(Array.isArray(responsabilidad)==false){
        values = [[responsabilidad,responsabilidad_tipo,id_cotizado]];
    }else{
        for (i = 0; i < responsabilidad.length; i++) {
            values.push([responsabilidad[i],responsabilidad_tipo[i],id_cotizado]);
        }
    } 
    fs.saveData('INSERT INTO responsabilidades (responsabilidad,tipo,id_cotizado) VALUES ?',values)
    .then(function(value){
        return res.end(JSON.stringify({ status: 'success',message:'Registrado correctamente' }));
    }).catch(function(value){
        return res.end(JSON.stringify({ status: 'error',message:value.sqlMessage }));
    });
});

app.post('/newSubcontratacion', urlencodedParser, (req, res)=>{
    var values = [];
    id_cotizado =req.body.id_cotizado;
    subcontrataciones = req.body.subcontrataciones;
    costo = req.body.costo_subcontratacion;
    if(Array.isArray(subcontrataciones)==false){
        values = [[subcontrataciones,costo,id_cotizado]];
    }else{
        for (i = 0; i < subcontrataciones.length; i++) {
            values.push([subcontrataciones[i],costo[i],id_cotizado]);
        }
    } 
    fs.saveData('INSERT INTO subcontrataciones (nombre,costo,id_cotizado) VALUES ?',values)
    .then(function(value){
        return res.end(JSON.stringify({ status: 'success',message:'Registrado correctamente' }));
    }).catch(function(value){
        return res.end(JSON.stringify({ status: 'error',message:value.sqlMessage }));
    });
});

app.post('/newActividad', urlencodedParser, (req, res)=>{
    var values = [];
    id_cotizado =req.body.id_cotizado;
    actividades = req.body.actividad;
    fecha_inicio = req.body.fecha_inicio_actividad;
    fecha_termina = req.body.fecha_termina_actividad;
    puntos = req.body.puntos_cosmic;
    if(Array.isArray(actividades)==false){
        values = [[actividades,fecha_inicio,fecha_termina,puntos,id_cotizado]];
    }else{
        for (i = 0; i < actividades.length; i++) {
            values.push([actividades[i],fecha_inicio[i],fecha_termina[i],puntos[i],id_cotizado]);
        }
    } 
    fs.saveData('INSERT INTO gantt (actividad,fecha_inicio_actividad,fecha_termina_actividad,puntos_cosmic,id_cotizado) VALUES ?',values)
    .then(function(value){
        return res.end(JSON.stringify({ status: 'success',message:'Registrado correctamente' }));
    }).catch(function(value){
        return res.end(JSON.stringify({ status: 'error',message:value.sqlMessage }));
    });
});


app.post('/gastos', urlencodedParser, (req, res)=>{
    gastos_fijos_anuales = fs.generaraGastosFijos({cel:req.body.cel,tel:req.body.tel,renta:req.body.renta,agua:req.body.agua,gas:req.body.gas,luz:req.body.luz,super:req.body.super,tv:req.body.tv,equipo:req.body.equipo,gasolina:req.body.gasolina,carro:req.body.carro});
    ingreso_anual = parseFloat(req.body.sueldo);
    horas_produccion = 1330;
    costo_hora = (ingreso_anual+gastos_fijos_anuales) / horas_produccion;
    precio_venta = costo_hora + (costo_hora * 0.2)
    precio_hora_mas_impuestos = precio_venta + (precio_venta * 0.35)
    fs.updateData('costos',{'costo_hora':costo_hora,'precio_venta':precio_venta,'costo_con_impuestos':precio_hora_mas_impuestos,'gastos_fijos_anuales':gastos_fijos_anuales,'sueldo':ingreso_anual,'puntos_funcion_mes':req.body.puntos},{'id_costos':1}).then(function(i){
        return res.end(JSON.stringify({ status: 'success',message:'Registrado correctamente' }));
    }).catch(function(e){
        return res.end(JSON.stringify({ status: 'error',message:value.sqlMessage }));
    });
});





