var db = require('../db');

module.exports.insertData = function(data,costo_hora,puntos_funcion_mes){
    return new Promise((resolve,reject)=>{
        var suma_puntos = getSumaElementosLista(data.puntos_cosmic);
        var costo_subcontrataciones = getSumaElementosLista(data.costo_subcontratacion);
        var costoPuntoFuncion =getCostoPuntoFuncion(costo_hora,8,20,puntos_funcion_mes,costo_subcontrataciones);
        var duracion_proyecto = puntos_funcion_mes / suma_puntos;
        var costo_final = suma_puntos * costo_punto_funcion;

        var values = [
            [data.nombre_proyecto,data.problema,data.objetivo_gral,data.alcance_proyecto,data.factibilidad,data.presupuesto_cliente,data.tiempo_entrega,data.observaciones_gantt,data.id_cliente,costoPuntoFuncion,costo_subcontrataciones,duracion_proyecto,costo_final]
            ];
        try{
            db.beginTransaction(function(e){
                if(e) reject(e.sqlMessage);
                // Cotizado
                db.query('INSERT INTO cotizado (nombre_proyecto, problema, objetivo_gral, alcance_proyecto, factibilidad,  presupuesto_cliente,tiempo_entrega_semanas, observaciones_gantt,id_cliente, costo_punto_funcion, costo_subcontrataciones,duracion_proyecto, costo_final) VALUES ?', [values], function(e, result) { 
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
                                [gantt[i]['actividad'],gantt[i]['fecha_inicio'],gantt[i]['fecha_termina'],gantt[i]['puntos'],last_inserted_id,costo_punto_funcion*parseFloat(gantt[i]['puntos'])]
                            ];
                            module.exports.saveData('INSERT INTO gantt (actividad,fecha_inicio_actividad,fecha_termina_actividad,puntos_cosmic,id_cotizado, costo) VALUES ?',value).then(function(i){
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

const getCostoPuntoFuncion = (costo_hora,horas_dia,dias_mes,puntos_funcion_mensuales,costo_subcontrataciones)=>{
    if (costo_subcontrataciones === undefined) costo_subcontrataciones = 0;
    costo_mensual = (parseFloat(costo_hora) * parseFloat(horas_dia) * parseFloat(dias_mes)) + costo_subcontrataciones;
    costo_punto_funcion =  costo_mensual / parseInt(puntos_funcion_mensuales);
    return costo_punto_funcion;
}

const getSumaElementosLista = (lista)=>{
    if(Array.isArray(lista)==false){
        return parseFloat(lista);
    }
    var suma = lista.reduce((x, y) => parseInt(x) + parseInt(y));
     return suma; 
}

module.exports.deleteItem = function(table,where){
    return new Promise((resolve, reject)=>{
        var sql = `DELETE FROM ${table} WHERE ?`;
        db.query(sql, [where],function (err, result) {
            return err ? reject(err) : resolve(result);

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
    lista_costos = [];
    arrayOfObjects.forEach((value)=>{
        lista_actividades.push(value['actividad']);
        lista_fecha_inicio.push(convertDate(value['fecha_inicio_actividad']));
        lista_fecha_termina.push(convertDate(value['fecha_termina_actividad']));
        lista_costos.push(value['costo']);
    });
    string_actividades =lista_actividades.toString();
    string_fecha_inicio =lista_fecha_inicio.toString();
    string_fecha_termina =lista_fecha_termina.toString();
    string_costos =lista_costos.toString();
    return {'actividades':string_actividades,'fecha_inicio':string_fecha_inicio,'fecha_termina':string_fecha_termina,'costo':string_costos};
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

module.exports.newActivity = function(id_cotizado,valores){
    return new Promise((resolve,reject)=>{
       module.exports.queryData(`SELECT puntos_cosmic FROM gantt WHERE id_cotizado = ${id_cotizado}`).then(function(i){
           lista_puntos = [];
           i.forEach((i)=>{
               lista_puntos.push(i['puntos_cosmic']);
            });
            valores.forEach((i)=>{
                lista_puntos.push(parseInt(i['puntos']));
            });
            var suma_puntos = getSumaElementosLista(lista_puntos);
            module.exports.queryData(`SELECT costo_subcontrataciones FROM cotizado WHERE id_cotizado =  ${id_cotizado}`).then(i=>{
                var costo_subcontrataciones = i[0]['costo_subcontrataciones'];
                module.exports.queryData('SELECT * FROM costos WHERE id_costos = 1').then(i =>{
                    var costos = i;
                    var costoPuntoFuncion =getCostoPuntoFuncion(costos[0]['costo_hora'],8,20,costos[0]['puntos_funcion_mes'],costo_subcontrataciones);
                    var duracion_proyecto = costos[0]['puntos_funcion_mes'] / suma_puntos;
                    var costo_final = suma_puntos * costoPuntoFuncion;
                    try{
                        db.beginTransaction(function(e){
                            if(e){
                                db.rollback();
                                reject(e.sqlMessage);
                            }
                            // actualizar cotizado
                            db.query('UPDATE cotizado SET ? WHERE ?',[{
                                "costo_final":costo_final,
                                "duracion_proyecto":duracion_proyecto,
                                "costo_subcontrataciones":costo_subcontrataciones,
                                "costo_punto_funcion":costoPuntoFuncion
                            },{
                                "id_cotizado":id_cotizado
                            }],(e,results)=>{
                                if(e){
                                    db.rollback();
                                    reject(e.sqlMessage);  
                                }
                            });
                            //actualizar actividades
                            module.exports.queryData(`SELECT * FROM gantt WHERE id_cotizado =  ${id_cotizado}`).then(function(actividades){
                                actividades.forEach((i)=>{
                                    db.query('UPDATE gantt SET ? WHERE ?',[{
                                        "costo":i['costo']
                                    },{
                                        "id_gantt":i['id_gantt']
                                    }],(e,results)=>{
                                        if(e){
                                            db.rollback();
                                            reject(e.sqlMessage);  
                                        }
                                    });
                                });
                            }).catch(function(e){
                                db.rollback();
                                reject(e.sqlMessage); 
                            });
                            // insertar en gantt
                            valores.forEach((i)=>{
                                db.query('INSERT INTO gantt(actividad,fecha_inicio_actividad,fecha_termina_actividad,id_cotizado,puntos_cosmic,costo) VALUES ?',[
                                    [[i['actividad'],i['fecha_inicio'],i['fecha_termina'],id_cotizado,i['puntos'],costoPuntoFuncion*parseInt(i['puntos'])]]
                                ], function (e, result) {
                                    if (e){
                                        db.rollback();
                                        reject(e.sqlMessage);  
                                    }
                                    });
                            });
                            //commit
                            db.commit(function(e) {
                                if (e) {
                                    db.rollback();
                                    reject(e.sqlMessage); 
                                }else{
                                    resolve("success");
                                }
                            });
                        });
                    }catch(e){
                        db.rollback();
                        reject(e.sqlMessage);
                    }
                });
            });
       }).catch(function(e){
            reject(e.message); 
       });
    });
}
module.exports.newSubcontratacion = function(id_cotizado,valores){
    return new Promise((resolve,reject)=>{
       module.exports.queryData(`SELECT puntos_cosmic FROM gantt WHERE id_cotizado = ${id_cotizado}`).then(function(i){
           lista_puntos = [];
           i.forEach((i)=>{
               lista_puntos.push(i['puntos_cosmic']);
            });
            var suma_puntos = getSumaElementosLista(lista_puntos);

            module.exports.queryData(`SELECT costo_subcontrataciones FROM cotizado WHERE id_cotizado =  ${id_cotizado}`).then(i=>{

                var costo_subcontrataciones = i[0]['costo_subcontrataciones'];
                lista_costo_subcontrataciones = [];
                valores.forEach((i)=>{
                    lista_costo_subcontrataciones.push(parseFloat(i['costo']));
                });
                var costo_subcontrataciones_nuevos = getSumaElementosLista(lista_costo_subcontrataciones);
                costo_subcontrataciones = costo_subcontrataciones +costo_subcontrataciones_nuevos;
                module.exports.queryData('SELECT * FROM costos WHERE id_costos = 1').then(i =>{
                    var costos = i;
                    var costoPuntoFuncion =getCostoPuntoFuncion(costos[0]['costo_hora'],8,20,costos[0]['puntos_funcion_mes'],costo_subcontrataciones);
                    var costo_final = suma_puntos * costoPuntoFuncion;
                    try{
                        db.beginTransaction(function(e){
                            if(e){
                                db.rollback();
                                reject(e.sqlMessage);
                            }
                            // actualizar cotizado
                            db.query('UPDATE cotizado SET ? WHERE ?',[{
                                "costo_final":costo_final,
                                "costo_subcontrataciones":costo_subcontrataciones,
                                "costo_punto_funcion":costoPuntoFuncion
                            },{
                                "id_cotizado":id_cotizado
                            }],(e,results)=>{
                                if(e){
                                    db.rollback();
                                    reject(e.sqlMessage);  
                                }
                            });
                            // insertar en subcontrataciones
                            valores.forEach((i)=>{
                                db.query('INSERT INTO subcontrataciones(nombre,costo,id_cotizado) VALUES ?',[
                                    [[i['subcontratacion'],i['costo'],id_cotizado]]
                                ], function (e, result) {
                                    if (e){
                                        db.rollback();
                                        reject(e.sqlMessage);  
                                    }
                                    });
                            });
                            //commit
                            db.commit(function(e) {
                                if (e) {
                                    db.rollback();
                                    reject(e.sqlMessage); 
                                }else{
                                    resolve("success");
                                }
                            });
                        });
                    }catch(e){
                        db.rollback();
                        reject(e.sqlMessage);
                    }
                });
            });
       }).catch(function(e){
            reject(e.message); 
       });
    });
}

module.exports.deleteActivity = function(id_actividad){
    return new Promise((resolve,reject)=>{
        module.exports.queryData(`SELECT * FROM gantt WHERE id_gantt = ${id_actividad}`).then(function(i){
            puntos_cosmic_restar = i[0]['puntos_cosmic'];
            id_cotizado = i[0]['id_cotizado'];
            module.exports.queryData(`SELECT puntos_cosmic FROM gantt WHERE id_cotizado = ${id_cotizado}`).then(function(i){
                lista_puntos = [];
                i.forEach((i)=>{
                    lista_puntos.push(parseFloat(i['puntos_cosmic']));
                 });
                 var suma_puntos = getSumaElementosLista(lista_puntos);
                 suma_puntos = suma_puntos - puntos_cosmic_restar;
                 module.exports.queryData(`SELECT costo_subcontrataciones FROM cotizado WHERE id_cotizado =  ${id_cotizado}`).then(i=>{
                     var costo_subcontrataciones = i[0]['costo_subcontrataciones'];
                     module.exports.queryData('SELECT * FROM costos WHERE id_costos = 1').then(i =>{
                         var costos = i;
                         var costoPuntoFuncion =getCostoPuntoFuncion(costos[0]['costo_hora'],8,20,costos[0]['puntos_funcion_mes'],costo_subcontrataciones);
                         var duracion_proyecto = costos[0]['puntos_funcion_mes'] / suma_puntos;
                         var costo_final = suma_puntos * costoPuntoFuncion;
                         try{
                             db.beginTransaction(function(e){
                                 if(e){
                                     db.rollback();
                                     reject(e.sqlMessage);
                                 }
                                 // actualizar cotizado
                                 db.query('UPDATE cotizado SET ? WHERE ?',[{
                                     "costo_final":costo_final,
                                     "costo_subcontrataciones":costo_subcontrataciones,
                                     "duracion_proyecto":duracion_proyecto,
                                     "costo_punto_funcion":costoPuntoFuncion
                                 },{
                                     "id_cotizado":id_cotizado
                                 }],(e,results)=>{
                                     if(e){
                                         db.rollback();
                                         reject(e.sqlMessage);  
                                     }
                                 });
                                 // Borrar de subcontrataciones
                                db.query(`DELETE FROM gantt WHERE id_gantt = ${id_actividad}`, function (e, result) {
                                    if (e){
                                        db.rollback();
                                        reject(e.sqlMessage);  
                                    }
                                    });
                                  //actualizar actividades
                                  module.exports.queryData(`SELECT * FROM gantt WHERE id_cotizado =  ${id_cotizado}`).then(function(i){
                                      actividades = i;
                                      actividades.forEach((i)=>{
                                         db.query('UPDATE gantt SET ? WHERE ?',[{
                                             "costo":actividades['puntos_cosmic']*costoPuntoFuncion
                                         },{
                                             "id_gantt":i['id_gantt']
                                         }],(e,results)=>{
                                             if(e){
                                                 db.rollback();
                                                 reject(e.sqlMessage);  
                                             }
                                         });
                                     });
                                 }).catch(function(e){
                                     db.rollback();
                                     reject(e.sqlMessage); 
                                 });
                                 //commit
                                 db.commit(function(e) {
                                     if (e) {
                                         db.rollback();
                                         reject(e.sqlMessage); 
                                     }else{
                                         resolve("success");
                                     }
                                 });
                             });
                         }catch(e){
                             db.rollback();
                             reject(e.sqlMessage);
                         }
                     });
                 });
            }).catch(function(e){
                 reject(e.message); 
            });
        }).catch(function(e){
            reject(e.sqlMessage); 
        });
       
    });
}

module.exports.deleteSubcontratacion = function(id_subcontratacion){
    return new Promise((resolve,reject)=>{
        module.exports.queryData(`SELECT * FROM subcontrataciones WHERE id_subcontrataciones = ${id_subcontratacion}`).then(function(i){
            id_cotizado = i[0]['id_cotizado'];
            costo_restar_subcontrataciones = i[0]['costo'];
            module.exports.queryData(`SELECT puntos_cosmic FROM gantt WHERE id_cotizado = ${id_cotizado}`).then(function(i){
                lista_puntos = [];
                i.forEach((i)=>{
                    lista_puntos.push(parseFloat(i['puntos_cosmic']));
                 });
                 var suma_puntos = getSumaElementosLista(lista_puntos);
                 module.exports.queryData(`SELECT costo_subcontrataciones FROM cotizado WHERE id_cotizado =  ${id_cotizado}`).then(i=>{
                     var costo_subcontrataciones = i[0]['costo_subcontrataciones'];
                     costo_subcontrataciones = costo_subcontrataciones - parseFloat(costo_restar_subcontrataciones);
                     module.exports.queryData('SELECT * FROM costos WHERE id_costos = 1').then(i =>{
                         var costos = i;
                         var costoPuntoFuncion =getCostoPuntoFuncion(costos[0]['costo_hora'],8,20,costos[0]['puntos_funcion_mes'],costo_subcontrataciones);
                         var duracion_proyecto = costos[0]['puntos_funcion_mes'] / suma_puntos;
                         var costo_final = suma_puntos * costoPuntoFuncion;
                         try{
                             db.beginTransaction(function(e){
                                 if(e){
                                     db.rollback();
                                     reject(e.sqlMessage);
                                 }
                                 // actualizar cotizado
                                 db.query('UPDATE cotizado SET ? WHERE ?',[{
                                     "costo_final":costo_final,
                                     "costo_subcontrataciones":costo_subcontrataciones,
                                     "duracion_proyecto":duracion_proyecto,
                                     "costo_punto_funcion":costoPuntoFuncion
                                 },{
                                     "id_cotizado":id_cotizado
                                 }],(e,results)=>{
                                     if(e){
                                         db.rollback();
                                         reject(e.sqlMessage);  
                                     }
                                 });
                                 // Borrar de subcontrataciones
                                db.query(`DELETE FROM subcontrataciones WHERE id_subcontrataciones = ${id_subcontratacion}`, function (e, result) {
                                    if (e){
                                        db.rollback();
                                        reject(e.sqlMessage);  
                                    }
                                    });
                                  //actualizar actividades
                                  module.exports.queryData(`SELECT * FROM gantt WHERE id_cotizado =  ${id_cotizado}`).then(function(i){
                                      actividades = i;
                                      actividades.forEach((i)=>{
                                         db.query('UPDATE gantt SET ? WHERE ?',[{
                                             "costo":actividades['puntos_cosmic']*costoPuntoFuncion
                                         },{
                                             "id_gantt":i['id_gantt']
                                         }],(e,results)=>{
                                             if(e){
                                                 db.rollback();
                                                 reject(e.sqlMessage);  
                                             }
                                         });
                                     });
                                 }).catch(function(e){
                                     db.rollback();
                                     reject(e.sqlMessage); 
                                 });
                                 //commit
                                 db.commit(function(e) {
                                     if (e) {
                                         db.rollback();
                                         reject(e.sqlMessage); 
                                     }else{
                                         resolve("success");
                                     }
                                 });
                             });
                         }catch(e){
                             db.rollback();
                             reject(e.sqlMessage);
                         }
                     });
                 });
            }).catch(function(e){
                 reject(e.message); 
            });
        }).catch(function(e){
            reject(e.sqlMessage); 
        });
       
    });
}
