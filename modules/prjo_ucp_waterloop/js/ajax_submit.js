(function($) {
  Drupal.behaviors.WaterloopSubmit = {
    attach: function (context, settings) {

      Drupal.behaviors.WaterloopSubmit.selection = Drupal.behaviors.WaterloopSubmit.selection || {"WS":[], "TP":[], "WR":[]}
      Drupal.behaviors.WaterloopSubmit.nid = Drupal.behaviors.WaterloopSubmit.nid || "null";

      // Since we use this ajax for submit new nodes && for submit edit nodes check which form we are on
      if($('#node-water-loop-edit-form').length){
        var form = $('#node-water-loop-edit-form');
      }else{
      	var form = $('#node-water-loop-form');
      }

      form.validate({
        ignore: [],
        errorPlacement: function(error, element) {
          element.css('background', '#ffdddd');
          error.insertAfter(element);
        }
      });

      $.validator.addMethod("requiredRow", function(value, element) {
        // return this.optional(element) || (parseFloat(value) > 0);
        console.log(element);
        if(value == 0){
          return false;
        } else {
          return true;
        }
        // $('#edit-field-ws-ref > tbody > tr').attr('id')
      }, "Select one element using marker popup button.");

      $('#edit-title-0-value').rules("add", {
        required : true,
         messages : { required : 'Title field is required.' }
      });

      $('#ws_id').rules("add", {
        requiredRow : true,
        messages: { requiredRow: "Select one Water Stream using marker popup." }
      })

      $('#wr_id').rules("add", {
        requiredRow : true,
        messages: { requiredRow: "Select one Water Demand using marker popup." }
      })

      $("#edit-submit").once().click(function(){
        if (form.valid()){
        console.log("submit clicked");

        // $(this).hasClass('update');
        // If we are in EDIT then get the node id to update
        if ($(this).hasClass('update')){
          console.log('UPDATING');
          // Drupal.behaviors.WaterloopSubmit.nid = $('form.node-water-loop-edit-form').attr('action');
          var myarr = $('form.node-water-loop-edit-form').attr('action').split("/");
          console.log(myarr[2]);
          Drupal.behaviors.WaterloopSubmit.nid = myarr[2]
        }
        // var form_elements = $("#node-water-loop-form").find(":input");
        // console.log(form_elements);
        // $('form .node-water-loop-edit-form').attr('action');
        // get the selected technologies
        $.when(
               // $(":checkbox").each(function (index, checkbox){
               //    if($(this).prop('checked')){
               //      // console.log($(this).attr('id').split('_')[1]);
               //      var techId = $(this).attr('id').split('_')[1];
               //      // Drupal.behaviors.WaterloopSubmit.selection.TP.push(techId)
               //      Drupal.behaviors.WaterloopSubmit.selection.TP.push({"id": techId, "qty": $('#qty_'+techId).val()})
               //    }
               //  })
               // Get all 'visible' input of type number
               // $('input[type=number]:visible').each(function (index, input){
               //   console.log(input);
               //   var techId = $(this).attr('id').split('_')[1];
               //   Drupal.behaviors.WaterloopSubmit.selection.TP.push({"id": techId, "qty": $(this).val()})
               // })
               $(":radio").each(function (index, checkbox){
                  if($(this).prop('checked')){
                    // console.log($(this).attr('id').split('_')[1]);
                    var techId = $(this).attr('id').split('_')[1];
                    // Drupal.behaviors.WaterloopSubmit.selection.TP.push(techId)
                    Drupal.behaviors.WaterloopSubmit.selection.TP.push({"id": techId, "qty": 1})
                  }
                })
                , $('#edit-field-ws-ref > tbody > tr').each(function(index, tr) {
                     // console.log($(this).attr('id'));
                     Drupal.behaviors.WaterloopSubmit.selection.WS.push($(this).attr('id'))
                })
                , $('#edit-field-wr-ref > tbody > tr').each(function(index, tr) {
                     // console.log($(this).attr('id'));
                     Drupal.behaviors.WaterloopSubmit.selection.WR.push($(this).attr('id'))
                })
              ).done(function() {
                // console.log(Drupal.behaviors.WaterloopSubmit.selection);
                // console.log(Drupal.behaviors.WaterloopSubmit.nid);
                // console.log(Drupal.behaviors.WaterloopSubmit.selection.WS[0]);

                // Check if a water stream and a water rerquest are selected
                // if( (Drupal.behaviors.WaterloopSubmit.selection.WS[0] == 'ws_empty') || (Drupal.behaviors.WaterloopSubmit.selection.WR[0] == 'wr_empty') ){
                //     // console.log('length 0')
                //     $('#edit-field-ws-ref > tbody > tr').addClass('btn-danger');
                //     $('#edit-field-wr-ref > tbody > tr').addClass('btn-danger');
                // }
                // else if ($('#edit-title-0-value').val() != ''){
                  console.log('AJAX SUBMIT');
                  var send = JSON.stringify({"title":$('#edit-title-0-value').val(),
                                             "data":Drupal.behaviors.WaterloopSubmit.selection,
                                             "update":Drupal.behaviors.WaterloopSubmit.nid});

                  $.ajax({
                      url: Drupal.url('api/save_wl'),
                      type: 'POST',
                      dataType: 'json',
                      // data: JSON.stringify(Drupal.behaviors.WaterloopSubmit.selection),
                      data: send,
                      headers: {
                          // 'X-CSRF-Token': csrfToken,
                          'Content-type': 'application/json'
                      },
                  }).done(function(response) {
                    console.log('done')
                    console.log(response)
                    window.location.href = "/node/"+response;

                  }).fail(function(jqXHR, textStatus) {
                    console.log( JSON.parse(jqXHR.responseText))
                  });
                // }
              });
        }
      });


    }
};

})(jQuery);
