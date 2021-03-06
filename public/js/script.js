$(function(){

    $(document).on('click','#agregar_subcontrataciones',function(e){
        e.preventDefault();
        $("#agregar_subcontrataciones").before(
            '<div class="row"><div class="col-8"><div class="mb-3"><input type="text" class="form-control" id="subcontrataciones" name="subcontrataciones" required></div></div><div class="col-4"><div class="mb-3"><input type="number" class="form-control" id="costo_subcontratacion" name="costo_subcontratacion"></div></div></div>'
        );
    });

    $(document).on('click','#agregar_actividad',function(e){
        e.preventDefault();
        $('#table_actividades tr:last').after('<tr><td><input type="text" style="border: 0px solid;" name="actividad" required></td><td><input type="date" style="border: 0px solid;" name="fecha_inicio_actividad" required></td><td><input type="date" style="border: 0px solid;" name="fecha_termina_actividad" required></td><td><input type="number" style="border: 0px solid;" name="puntos_cosmic" required></td></tr>');
    });

    $(document).on('click','#agregar_responsabilidad',function(e){
        e.preventDefault();
        $("#agregar_responsabilidad").before(
          '<div class="row"><div class="col-8"><div class="mb-3"><input  class="form-control" id="responsabilidades" name="responsabilidades" required></div></div><div class="col-4"><div class="mb-3"><select name="responsabilidad_tipo" id="responsabilidad_tipo" class="form-select"><option value="cliente">Cliente</option><option value="desarrollador">Desarrollador</option></select></div></div></div>'
      );
    });

    $(document).on('click','#agregar_acuerdo',function(e){
        e.preventDefault();
        $("#agregar_acuerdo").before(
          '<input  class="form-control mb-3" id="acuerdos" name="acuerdos" required>'
      );
    });

    $(document).on('click', '#openModal', function(e) {
        e.preventDefault();
        $.ajax({
            'url': '/clientesform',
            'success': function(response) {
                $(document).find('#modalContent').empty().append(response);
            }
        });
    });

    $(document).on('click', '#edit-cliente', function(e) {
        e.preventDefault();
        id_cliente = $(this).attr('data-target');
        id_cotizacion = $(this).attr('data-cotizado');
        $.ajax({
            'url': '/clientesform',
            'data': {'id_cliente':id_cliente,'id_cotizacion':id_cotizacion},
            'success': function(response) {
                $(document).find('#modalContent').empty().append(response);
            }
        });
    });

    $(document).on('click', '#openModalCostos', function(e) {
        e.preventDefault();
        $.ajax({
            'url': '/costosform',
            'success': function(response) {
                $(document).find('#modalContent').empty().append(response);
            }
        });
    });

    $(document).on('submit', '#form_clientes', function(e) {
        e.preventDefault();
        $.ajax({
            'url': '/savecliente',
            'data': $(this).serializeArray(),
            'method': "post",
            'success': function(response) {
                var convert_response = JSON.parse(response);
                if (convert_response.status == "success") {
                    $(document).find('#modalView').modal('hide');
                    if(convert_response.method=='update'){
                        id_cotizado = convert_response.data;
                        window.location = `/clientes?id_cotizacion=${id_cotizado}`;
                    }else{
                        Swal.fire(
                            'Correcto',
                            convert_response.message,
                            'success'
                        );
                    }
                }else{
                    Swal.fire(
                        'Error',
                        convert_response.message,
                        'error'
                    );
                }
            }
        });
    });


    $(document).on('submit', '#form_gastos', function(e) {
        e.preventDefault();
        $.ajax({
            'url': '/gastos',
            'data': $(this).serializeArray(),
            'method': "post",
            'success': function(response) {
                var convert_response = JSON.parse(response);
                if (convert_response.status == "success") {
                    $(document).find('#modalView').modal('hide');
                    window.location = "/";
                }else{
                    Swal.fire(
                        'Error',
                        convert_response.message,
                        'error'
                    );
                }
            }
        });
    });

    $(document).on('click', '#delete_all', function(e) {
        e.preventDefault();
        id_cotizado = $(this).attr('data-target');
        Swal.fire({
            title: '??Eliminar?',
            showDenyButton: true,
            confirmButtonText: `Continuar`,
            denyButtonText: `Cancelar`,
            icon: 'warning'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    'url': '/deleteAll',
                    'data': {"id_cotizado":id_cotizado},
                    'method': "post",
                    'success': function(response) {
                        var convert_response = JSON.parse(response);
                        if (convert_response.status == "success") {
                            window.location = "/";
                        }else{
                            Swal.fire(
                                'Error',
                                convert_response.message,
                                'error'
                            );
                        }
                    }
                });
            } else if (result.isDenied) {
                Swal.close()
            }
        });

    });

    $(document).on('click', '#delete-actividad', function(e) {
        e.preventDefault();
        id_actividad = $(this).attr('data-target');
        id_cotizado = $(this).attr('data-cotizado');
        Swal.fire({
            title: '??Eliminar?',
            showDenyButton: true,
            confirmButtonText: `Continuar`,
            denyButtonText: `Cancelar`,
            icon: 'warning'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    'url': '/deleteGantt',
                    'data': {"id_actividad":id_actividad},
                    'method': "post",
                    'success': function(response) {
                        var convert_response = JSON.parse(response);
                        if (convert_response.status == "success") {
                            window.location = `/general?id_cotizacion=${id_cotizado}`;
                        }else{
                            Swal.fire(
                                'Error',
                                convert_response.message,
                                'error'
                            );
                        }
                    }
                });
            } else if (result.isDenied) {
                Swal.close()
            }
        });

    });

    $(document).on('click', '#delete-subcontratacion', function(e) {
        e.preventDefault();
        id = $(this).attr('data-target');
        id_cotizado = $(this).attr('data-cotizado');
        Swal.fire({
            title: '??Eliminar?',
            showDenyButton: true,
            confirmButtonText: `Continuar`,
            denyButtonText: `Cancelar`,
            icon: 'warning'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    'url': '/deleteSubcontratacion',
                    'data': {"id":id},
                    'method': "post",
                    'success': function(response) {
                        var convert_response = JSON.parse(response);
                        if (convert_response.status == "success") {
                            window.location = `/general?id_cotizacion=${id_cotizado}`;
                        }else{
                            Swal.fire(
                                'Error',
                                convert_response.message,
                                'error'
                            );
                        }
                    }
                });
            } else if (result.isDenied) {
                Swal.close()
            }
        });

    });

    $(document).on('click', '#delete-responsabilidad', function(e) {
        e.preventDefault();
        id = $(this).attr('data-target');
        id_cotizado = $(this).attr('data-cotizado');
        Swal.fire({
            title: '??Eliminar?',
            showDenyButton: true,
            confirmButtonText: `Continuar`,
            denyButtonText: `Cancelar`,
            icon: 'warning'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    'url': '/deleteResponsabilidad',
                    'data': {"id":id},
                    'method': "post",
                    'success': function(response) {
                        var convert_response = JSON.parse(response);
                        if (convert_response.status == "success") {
                            window.location = `/general?id_cotizacion=${id_cotizado}`;
                        }else{
                            Swal.fire(
                                'Error',
                                convert_response.message,
                                'error'
                            );
                        }
                    }
                });
            } else if (result.isDenied) {
                Swal.close()
            }
        });

    });

    $(document).on('click', '#delete-acuerdo', function(e) {
        e.preventDefault();
        id = $(this).attr('data-target');
        id_cotizado = $(this).attr('data-cotizado');
        Swal.fire({
            title: '??Eliminar?',
            showDenyButton: true,
            confirmButtonText: `Continuar`,
            denyButtonText: `Cancelar`,
            icon: 'warning'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    'url': '/deleteAcuerdo',
                    'data': {"id":id},
                    'method': "post",
                    'success': function(response) {
                        var convert_response = JSON.parse(response);
                        if (convert_response.status == "success") {
                            window.location = `/general?id_cotizacion=${id_cotizado}`;
                        }else{
                            Swal.fire(
                                'Error',
                                convert_response.message,
                                'error'
                            );
                        }
                    }
                });
            } else if (result.isDenied) {
                Swal.close()
            }
        });

    });

    $(document).on('click', '#openModalCotizado', function(e) {
        e.preventDefault();
        $.ajax({
            'url': '/cotizadoform',
            'success': function(response) {
                $(document).find('#modalContentCotizado').empty().append(response);
            }
        });
    });

    $(document).on('click', '#editar-cotizado', function(e) {
        e.preventDefault();
        id = $(this).attr('data-target');
        $.ajax({
            'url': '/cotizadoEditForm',
            "data":{"id":id},
            'success': function(response) {
                $(document).find('#modalContent').empty().append(response);
            }
        });
    });

    $(document).on('click', '#add-acuerdo', function(e) {
        e.preventDefault();
        id = $(this).attr('data-cotizado');
        $.ajax({
            'url': '/acuerdosform',
            'data':{"id":id},
            'success': function(response) {
                $(document).find('#modalContent').empty().append(response);
            }
        });
    });

    $(document).on('click', '#add-responsabilidad', function(e) {
        e.preventDefault();
        id = $(this).attr('data-cotizado');
        $.ajax({
            'url': '/responsabilidadesform',
            'data':{"id":id},
            'success': function(response) {
                $(document).find('#modalContent').empty().append(response);
            }
        });
    });

    $(document).on('click', '#add-subcontratacion', function(e) {
        e.preventDefault();
        id = $(this).attr('data-cotizado');
        $.ajax({
            'url': '/subcontratacionesform',
            'data':{"id":id},
            'success': function(response) {
                $(document).find('#modalContent').empty().append(response);
            }
        });
    });

    $(document).on('click', '#add-actividad', function(e) {
        e.preventDefault();
        id = $(this).attr('data-cotizado');
        $.ajax({
            'url': '/actividadesform',
            'data':{"id":id},
            'success': function(response) {
                $(document).find('#modalContent').empty().append(response);
            }
        });
    });

    $(document).on('submit', '#form_cotizado', function(e) {
        e.preventDefault();
        $.ajax({
            'url': '/formulario',
            'data': $(this).serializeArray(),
            'method': "post",
            'success': function(response) {
                var convert_response = JSON.parse(response);
                if (convert_response.status == "success") {
                    window.location = "/";
                }else{
                    Swal.fire(
                        'Error',
                        convert_response.message,
                        'error'
                    );
                }
            }
        });
    });

    $(document).on('submit', '#form_cotizado_edit', function(e) {
        e.preventDefault();
        id = $("#input_id_cotizado").val();
        $.ajax({
            'url': '/cotizadoEditForm',
            'data': $(this).serializeArray(),
            'method': "post",
            'success': function(response) {
                var convert_response = JSON.parse(response);
                if (convert_response.status == "success") {
                    window.location = `general?id_cotizacion=${id}`;
                }else{
                    Swal.fire(
                        'Error',
                        convert_response.message,
                        'error'
                    );
                }
            }
        });
    });
    $(document).on('submit', '#form_actividades', function(e) {
        e.preventDefault();
        id = $("#input_id_cotizado").val();
        $.ajax({
            'url': '/newActividad',
            'data': $(this).serializeArray(),
            'method': "post",
            'success': function(response) {
                var convert_response = JSON.parse(response);
                if (convert_response.status == "success") {
                    window.location = `general?id_cotizacion=${id}`;
                }else{
                    Swal.fire(
                        'Error',
                        convert_response.message,
                        'error'
                    );
                }
            }
        });
    });

    $(document).on('submit', '#form_acuerdos', function(e) {
        e.preventDefault();
        id = $("#input_id_cotizado").val();
        $.ajax({
            'url': '/newAcuerdo',
            'data': $(this).serializeArray(),
            'method': "post",
            'success': function(response) {
                var convert_response = JSON.parse(response);
                if (convert_response.status == "success") {
                    window.location = `general?id_cotizacion=${id}`;
                }else{
                    Swal.fire(
                        'Error',
                        convert_response.message,
                        'error'
                    );
                }
            }
        });
    });

    $(document).on('submit', '#form_responsabilidades', function(e) {
        e.preventDefault();
        id = $("#input_id_cotizado").val();
        $.ajax({
            'url': '/newResponsabilidad',
            'data': $(this).serializeArray(),
            'method': "post",
            'success': function(response) {
                var convert_response = JSON.parse(response);
                if (convert_response.status == "success") {
                    window.location = `general?id_cotizacion=${id}`;
                }else{
                    Swal.fire(
                        'Error',
                        convert_response.message,
                        'error'
                    );
                }
            }
        });
    });

    $(document).on('submit', '#form_subcontrataciones', function(e) {
        e.preventDefault();
        id = $("#input_id_cotizado").val();
        $.ajax({
            'url': '/newSubcontratacion',
            'data': $(this).serializeArray(),
            'method': "post",
            'success': function(response) {
                var convert_response = JSON.parse(response);
                if (convert_response.status == "success") {
                    window.location = `general?id_cotizacion=${id}`;
                }else{
                    Swal.fire(
                        'Error',
                        convert_response.message,
                        'error'
                    );
                }
            }
        });
    });

    $(document).on('click', '#project_select', function() {
        id = $('#select_project').val();
        $(this).attr('href',`general?id_cotizacion=${id}`);
    });

    $(document).on('click', '#delete-cliente', function(e) {
        e.preventDefault();
        id = $(this).attr('data-target');
        id_cotizado = $(this).attr('data-cotizado');
        Swal.fire({
            title: '??Eliminar?',
            showDenyButton: true,
            confirmButtonText: `Continuar`,
            denyButtonText: `Cancelar`,
            icon: 'warning'
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    'url': '/deleteCliente',
                    'data': {"id":id},
                    'method': "post",
                    'success': function(response) {
                        var convert_response = JSON.parse(response);
                        if (convert_response.status == "success") {
                            window.location = `/clientes?id_cotizacion=${id_cotizado}`;
                        }else{
                            Swal.fire(
                                'Error',
                                convert_response.message,
                                'error'
                            );
                        }
                    }
                });
            } else if (result.isDenied) {
                Swal.close()
            }
        });
    });

});

