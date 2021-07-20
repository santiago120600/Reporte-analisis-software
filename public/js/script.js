$(function(){

    $(document).on('click','#agregar_subcontrataciones',function(e){
        e.preventDefault();
        $("#agregar_subcontrataciones").before(
            '<div class="row"><div class="col-8"><div class="mb-3"><input type="text" class="form-control" id="subcontrataciones" name="subcontrataciones" required></div></div><div class="col-4"><div class="mb-3"><input type="number" class="form-control" id="costo_subcontratacion" name="costo_subcontratacion"></div></div></div>'
        );
    });

    $(document).on('click','#agregar_actividad',function(e){
        e.preventDefault();
        $('#table_actividades tr:last').after('<tr><td><input type="text" style="border: 0px solid;" name="actividad" required></td><td><input type="date" style="border: 0px solid;" name="fecha_inicio_actividad" required></td><td><input type="date" style="border: 0px solid;" name="fecha_termina_actividad" required></td></tr>');
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
                    Swal.fire(
                        'Correcto',
                        convert_response.message,
                        'success'
                    );
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

    $(document).on('click', '#openModalCotizado', function(e) {
        e.preventDefault();
        $.ajax({
            'url': '/cotizadoform',
            'success': function(response) {
                $(document).find('#modalContentCotizado').empty().append(response);
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
                    $(document).find('#modalViewCotizado').modal('hide');
                    Swal.fire(
                        'Correcto',
                        convert_response.message,
                        'success'
                    );
                    //recargar el select de los proyectos
                    // $(document).find('#data_container').empty().append(response);
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

});

