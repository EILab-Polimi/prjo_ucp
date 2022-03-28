(function($) {
  Drupal.behaviors.testCheckboxes = {
    attach: function (context, settings) {

      $('#edit-check-application-field').once('testOnce').click(function(){
            if($(this).prop("checked") == true){
                // $('.form-item-field-application-field-txn').show()
                $('#edit-field-application-field-txn-wrapper').show()
            }
            else if($(this).prop("checked") == false){
                // $('.form-item-field-application-field-txn').hide()
                $('#edit-field-application-field-txn-wrapper').hide()
            }
        });

        $('#edit-check-tech-domain').once('testOnce').click(function(){
              if($(this).prop("checked") == true){
                  // $('.form-item-field-technology-domain-txn').show()
                  $('#edit-field-technology-domain-txn-wrapper').show()
              }
              else if($(this).prop("checked") == false){
                  // $('.form-item-field-technology-domain-txn').hide()
                  $('#edit-field-technology-domain-txn-wrapper').hide()
              }
          });

        $('#edit-field-flow-range-0-from').attr("placeholder", "Min m³/day");
        $('#edit-field-flow-range-0-to').attr("placeholder", "Max m³/day");
    }
};

})(jQuery);
