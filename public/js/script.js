$(function(){

    $(document).on('click','#agregar_objetivos',function(e){
        e.preventDefault();
        $("#agregar_objetivos").before(
            '<input  class="form-control mb-3" id="objetivos_espc"  name="objetivos_espc">'
        );
    });

    $(document).on('click','#agregar_subcontrataciones',function(e){
        e.preventDefault();
        $("#agregar_subcontrataciones").before(
            '<input type="text" class="form-control mb-3" id="subcontrataciones" name="subcontrataciones">'
        );
    });

});
