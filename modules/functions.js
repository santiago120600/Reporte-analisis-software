var db = require('../db');

module.exports.insertData =function(data){
    var sql = "INSERT INTO cotizado (nombre_proyecto, problema, objetivo_gral, alcance_proyecto, factibilidad,  presupuesto_cliente,tiempo_entrega_semanas, observaciones_gantt,id_cliente) VALUES ?";
    var values = [
        [data.nombre_proyecto,data.problema,data.objetivo_gral,data.alcance_proyecto,data.factibilidad,data.presupuesto_cliente,data.tiempo_entrega,data.observaciones_gantt,data.id_cliente]
        ];

    var sqlAcuerdos = "INSERT INTO acuerdos (acuerdo,id_cotizado) VALUES ?";
    var acuerdos =  data.acuerdos;
    var sqlGantt = "INSERT INTO gantt (actividad,fecha_inicio_actividad,fecha_termina_actividad,id_cotizado,puntos_cosmic) VALUES ?";
    var gantt =getGantt(data.actividad,data.fecha_inicio_actividad,data.fecha_termina_actividad,data.puntos_cosmic);
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
                        [gantt[i][0],gantt[i][1],gantt[i][2],result.insertId,gantt[i][3]]
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
        db.rollback();
        throw e.message; 
    }
}

module.exports.deleteItem = function(table,where){
    return new Promise((resolve, reject)=>{
        var sql = `DELETE FROM ${table} WHERE ?`;
        db.query(sql, [where],function (err, result) {
            return err ? reject(error) : resolve(result);

        });
    });
}

module.exports.queryData = function(query){
    return new Promise((resolve,reject)=>{
        db.query(query, (error,results)=>{
                return error ? reject(error) : resolve(results);
        });
    })
}

module.exports.updateData = function(table,data,where){
    return new Promise((resolve,reject)=>{
        db.query(`UPDATE ${table} SET ? WHERE ?`,[data,where], (error,results)=>{
            return error ? reject(error) : resolve(results);
        });
    });
}

module.exports.saveData = function(query,data){
    return new Promise((resolve,reject)=>{
        db.query(query,[data], (error,results)=>{
            return error ? reject(error) : resolve(results);
        });
    });
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

module.exports.listToStringGantt = function(arrayOfObjects){
    lista_actividades = [];
    lista_fecha_inicio = [];
    lista_fecha_termina = [];
    arrayOfObjects.forEach((value)=>{
        lista_actividades.push(value['actividad']);
        lista_fecha_inicio.push(convertDate(value['fecha_inicio_actividad']));
        lista_fecha_termina.push(convertDate(value['fecha_termina_actividad']));
    });
    string_actividades =lista_actividades.toString();
    string_fecha_inicio =lista_fecha_inicio.toString();
    string_fecha_termina =lista_fecha_termina.toString();
    return {'actividades':string_actividades,'fecha_inicio':string_fecha_inicio,'fecha_termina':string_fecha_termina};
}

module.exports.deleteAll = function(id){
    return new Promise((resolve,reject)=>{
        db.beginTransaction(function(e){
            db.query('DELETE FROM responsabilidades WHERE id_cotizado = ?',[id], (error,results)=>{
                if (error) { 
                    db.rollback();
                    reject(error) 
                }
            });
            db.query('DELETE FROM subcontrataciones WHERE id_cotizado = ?',[id], (error,results)=>{
                if (error) { 
                    db.rollback();
                    reject(error) 
                }
            });
            db.query('DELETE FROM gantt WHERE id_cotizado = ?',[id], (error,results)=>{
                if (error) { 
                    db.rollback();
                    reject(error) 
                }
            });
            db.query('DELETE FROM acuerdos WHERE id_cotizado = ?',[id], (error,results)=>{
                if (error) { 
                    db.rollback();
                    reject(error) 
                }
            });
            db.query('DELETE FROM cotizado WHERE id_cotizado = ?',[id], (error,results)=>{
                if (error) { 
                    db.rollback();
                    reject(error) 
                }else{
                    db.commit(function(err) {
                        if (err) {
                            reject(err); 
                        }
                        resolve("success");
                    });
                }
            });
        });
    });
}

module.exports.generaraGastosFijos = function(lista_gastos){
    cel = ((lista_gastos['cel'] == '') ? 0 : parseFloat(lista_gastos['cel']));
    tel = ((lista_gastos['tel'] == '') ? 0 : parseFloat(lista_gastos['tel']));
    renta = ((lista_gastos['renta'] == '') ? 0 : parseFloat(lista_gastos['renta']));
    agua = ((lista_gastos['agua'] == '') ? 0 : parseFloat(lista_gastos['agua']));
    luz = ((lista_gastos['luz'] == '') ? 0 : parseFloat(lista_gastos['luz']));
    supermercado = ((lista_gastos['super'] == '') ? 0 : parseFloat(lista_gastos['super']));
    tv = ((lista_gastos['tv'] == '') ? 0 : parseFloat(lista_gastos['tv']));
    equipo = ((lista_gastos['equipo'] == '') ? 0 : parseFloat(lista_gastos['equipo']));
    gasolina = ((lista_gastos['gasolina'] == '') ? 0 : parseFloat(lista_gastos['gasolina']));
    carro = ((lista_gastos['carro'] == '') ? 0 : parseFloat(lista_gastos['carro']));
    gastos_fijos_mensuales = cel+tel+renta+agua+luz+supermercado+tv+equipo+gasolina+carro;
    return gastos_fijos_mensuales * 12;
}

function convertDate(date){
    // formato 2/10/2008 dd/mm/yyyy
    return (date.getMonth() + 1) + 
    "/" +  date.getDate() +
    "/" +  date.getFullYear();
}
