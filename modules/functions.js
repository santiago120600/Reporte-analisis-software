var db = require('../db');

module.exports.insertData = async function(data){
    return new Promise((resolve,reject)=>{
        var values = [
            [data.nombre_proyecto,data.problema,data.objetivo_gral,data.alcance_proyecto,data.factibilidad,data.presupuesto_cliente,data.tiempo_entrega,data.observaciones_gantt,data.id_cliente]
            ];
        try{
            db.beginTransaction(function(e){
                if(e) reject(e.sqlMessage);
                // Cotizado
                db.query('INSERT INTO cotizado (nombre_proyecto, problema, objetivo_gral, alcance_proyecto, factibilidad,  presupuesto_cliente,tiempo_entrega_semanas, observaciones_gantt,id_cliente) VALUES ?', [values], function(e, result) { 
                    if (e) { 
                        db.rollback();
                        reject(e.sqlMessage); 
                    }else{
                        last_inserted_id = result.insertId;
                        // acuerdos
                        var acuerdos =  data.acuerdos;
                        if(Array.isArray(acuerdos)==false){
                            acuerdos = new Array(acuerdos);
                        }
                        for(i = 0; i < acuerdos.length; i++){
                            var value = [
                                [acuerdos[i],last_inserted_id]
                            ];
                            module.exports.saveData("INSERT INTO acuerdos (acuerdo,id_cotizado) VALUES ?", value).then(function(i){
                                // console.log(i);
                            }).catch(function(e){
                                db.rollback();
                                reject(e.sqlMessage); 
                            });
                        }
                        // gantt
                        var gantt =getGantt(data.actividad,data.fecha_inicio_actividad,data.fecha_termina_actividad,data.puntos_cosmic);
                        for(i = 0; i < gantt.length; i++){
                            var value = [
                                [gantt[i]['actividad'],gantt[i]['fecha_inicio'],gantt[i]['fecha_termina'],gantt[i]['puntos'],last_inserted_id]
                            ];
                            module.exports.saveData('INSERT INTO gantt (actividad,fecha_inicio_actividad,fecha_termina_actividad,puntos_cosmic,id_cotizado) VALUES ?',value).then(function(i){
                                console.log(i);
                            }).catch(function(e){
                                db.rollback();
                                reject(e.sqlMessage); 
                            });
                        }
                        // subcontrataciones
                        var subcontrataciones = getSubcontrataciones(data.subcontrataciones,data.costo_subcontratacion);
                        if(data.subcontrataciones!=''){
                            for(i = 0; i < subcontrataciones.length; i++){
                                var value = [
                                    [subcontrataciones[i]['nombre'],subcontrataciones[i]['costo'],last_inserted_id]
                                ];
                                module.exports.saveData('INSERT INTO subcontrataciones(nombre,costo,id_cotizado) VALUES ?',value).then(function(i){
                                    // console.log(i);
                                }).catch(function(e){
                                    db.rollback();
                                    reject(e.sqlMessage); 
                                });
                            }
                        }
                        // responsabilidades
                        var responsabilidades = getResponsabilidades(data.responsabilidades,data.responsabilidad_tipo);
                        if(responsabilidades!=''){
                            for(i = 0; i < responsabilidades.length; i++){
                                var value = [
                                    [responsabilidades[i]['responsabilidad'],responsabilidades[i]['responsable'],last_inserted_id]
                                ];
                                module.exports.saveData('INSERT INTO responsabilidades(responsabilidad,tipo,id_cotizado) VALUES ?',value).then(function(i){
                                    // console.log(i);
                                }).catch(function(e){
                                    db.rollback();
                                    reject(e.sqlMessage); 
                                });
                            }
                        }
                        db.commit(function(e) {
                            if (e) {
                                db.rollback();
                                reject(e.sqlMessage); 
                            }else{
                                resolve("success");
                            }
                        });
                    }

                });
            });
        }catch(e){
            db.rollback();
            reject(e.sqlMessage); 
        }    
    });
}

const getGantt = (lista_actividades,lista_fecha_inicio,lista_fecha_termina, lista_puntos) =>{
    // retornar una lista de objetos [{actividad:"actividad",fecha_inicio:"2020-06-12",fecha_termina:"2020-06-12",puntos:8}]
    if(Array.isArray(lista_actividades)==false && Array.isArray(lista_fecha_inicio)==false && Array.isArray(lista_fecha_termina)==false &&Array.isArray(lista_puntos)==false){
        lista_actividades = new Array(lista_actividades);
        lista_fecha_inicio = new Array(lista_fecha_inicio);
        lista_fecha_termina = new Array(lista_fecha_termina);
        lista_puntos = new Array(lista_puntos);
    }  
    const lista = [];
    for (i = 0; i < lista_actividades.length; i++) {
        lista.push({actividad:lista_actividades[i],fecha_inicio:lista_fecha_inicio[i],fecha_termina:lista_fecha_termina[i],puntos:lista_puntos[i]});
    }
    return lista;
}

const getSubcontrataciones = (lista_nombres,lista_costos)=>{
    // retorn una lista de objetos [{nombre:'Juan',costo:10000}]
    if(lista_nombres==''){
        return [];
    }  
    if(Array.isArray(lista_nombres)==false && Array.isArray(lista_costos)==false){
        lista_nombres = new Array(lista_nombres);
        lista_costos = new Array(lista_costos);
    }  
    const lista = [];
    for (i = 0; i < lista_nombres.length; i++) {
      lista.push({nombre:lista_nombres[i],costo:lista_costos[i]});
    }
    return lista;
  }

const getResponsabilidades = (lista_responsabilidades,lista_responsable)=>{
    // retorn una lista de objetos [{responsabilidad:'cobrar',responsable:'Desarrollador'}]
    if(lista_responsabilidades==''){
        return [];
    }  
    if(Array.isArray(lista_responsabilidades)==false && Array.isArray(lista_responsable)==false){
        lista_responsabilidades = new Array(lista_responsabilidades);
        lista_responsable = new Array(lista_responsable);
    }  
    const lista = [];
    for (i = 0; i < lista_responsabilidades.length; i++) {
      lista.push({responsabilidad:lista_responsabilidades[i],responsable:lista_responsable[i]});
    }
    return lista;
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
    gas = ((lista_gastos['gas'] == '') ? 0 : parseFloat(lista_gastos['gas']));
    luz = ((lista_gastos['luz'] == '') ? 0 : parseFloat(lista_gastos['luz']));
    supermercado = ((lista_gastos['super'] == '') ? 0 : parseFloat(lista_gastos['super']));
    tv = ((lista_gastos['tv'] == '') ? 0 : parseFloat(lista_gastos['tv']));
    equipo = ((lista_gastos['equipo'] == '') ? 0 : parseFloat(lista_gastos['equipo']));
    gasolina = ((lista_gastos['gasolina'] == '') ? 0 : parseFloat(lista_gastos['gasolina']));
    carro = ((lista_gastos['carro'] == '') ? 0 : parseFloat(lista_gastos['carro']));
    gastos_fijos_mensuales = cel+tel+renta+agua+luz+supermercado+tv+equipo+gasolina+carro+gas;
    return gastos_fijos_mensuales * 12;
}

function convertDate(date){
    // formato 2/10/2008 dd/mm/yyyy
    return (date.getMonth() + 1) + 
    "/" +  date.getDate() +
    "/" +  date.getFullYear();
}
