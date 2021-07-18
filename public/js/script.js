$(function(){

    $(document).on('click','#agregar_subcontrataciones',function(e){
        e.preventDefault();
        $("#agregar_subcontrataciones").before(
            '<div class="row"><div class="col-8"><div class="mb-3"><input type="text" class="form-control" id="subcontrataciones" name="subcontrataciones"></div></div><div class="col-4"><div class="mb-3"><input type="number" class="form-control" id="costo_subcontratacion" name="costo_subcontratacion"></div></div></div>'
        );
    });

    $(document).on('click','#agregar_actividad',function(e){
        e.preventDefault();
        $('#table_actividades tr:last').after('<tr><td><input type="text" name="actividad"></td><td><input type="date" name="fecha_inicio_actividad"></td><td><input type="date" name="fecha_termina_actividad"></td></tr>');
    });

    $(document).on('click','#agregar_responsabilidad',function(e){
        e.preventDefault();
        $("#agregar_responsabilidad").before(
          '<div class="row"><div class="col-8"><div class="mb-3"><input  class="form-control" id="responsabilidades" name="responsabilidades"></div></div><div class="col-4"><div class="mb-3"><select name="responsabilidad_tipo" id="responsabilidad_tipo" class="form-select"><option value="cliente">Cliente</option><option value="desarrollador">Desarrollador</option></select></div></div></div>'
      );
    });

    $(document).on('click','#agregar_acuerdo',function(e){
        e.preventDefault();
        $("#agregar_acuerdo").before(
          '<input  class="form-control mb-3" id="acuerdos" name="acuerdos">'
      );
    });

});

