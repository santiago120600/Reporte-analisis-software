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
    return res.render('tablas',{cotizado:cotizado,acuerdos:acuerdos,gantt:gantt,subcontrataciones:subcontrataciones,responsabilidades:responsabilidades});
});

app.get('/costos', async (req, res) => {
      var data = await fs.queryData('SELECT * FROM costos');
      console.log(data);
    //   res.render('gantt',{data:data});
});

app.post('/savecliente', urlencodedParser, (req, res)=>{
    var values = [
        [req.body.nombre_cliente,req.body.nombre_empresa,req.body.email,req.body.tel,req.body.direccion]
    ];
    fs.saveData('INSERT INTO cliente (nombre_cliente,nombre_empresa,email,tel,direccion) VALUES ?',values)
    .then(function(value){
        return res.end(JSON.stringify({ status: 'success',message:'Registrado correctamente' }));
    }).catch(function(value){
        return res.end(JSON.stringify({ status: 'error',message:value }));
    });
});

app.get('/clientesform', (req, res) => {
    return res.render('clientes_form');
});

app.get('/cotizadoform', async (req, res) => {
    const result = await fs.queryData("SELECT * FROM cliente");
    return res.render('cotizado_form',{data:result});
});


app.get('/gantt', (req, res) => {
    var id =req.query.id_cotizacion;
    fs.queryData(`SELECT * FROM gantt WHERE id_cotizado = ${id}`).then(function(value){
        result = fs.listToStringGantt(value);
        return res.render('gantt',{actividades:result['actividades'],fecha_inicio:result['fecha_inicio'],fecha_termina:result['fecha_termina'],id:id,});
    }).catch(function(e){
        console.log(e);
    });
});

app.get('/', async (req, res) => {
    var data = await fs.queryData('SELECT id_cotizado, nombre_proyecto FROM cotizado');
    res.render('selection',{data:data});
});

app.get('/formulario',async (req, res) => {
    var data = await fs.queryData("SELECT * FROM cliente");
    res.render('index',{data:data});
});

app.post('/formulario', urlencodedParser, [ 
    check('nombre_proyecto','Ingrese un nombre de proyecto').exists().isLength({max:80}).withMessage('Máximo 80 carácteres'),
], (req, res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors.array());
        return res.end(JSON.stringify({ status: 'error',message: errors.array(),valores:req.body}));
    }else{
        fs.insertData(req.body);
        return res.end(JSON.stringify({ status: 'success',message:'Reistrado correctamente'}));
    }
});







