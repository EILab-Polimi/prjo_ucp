(function($) {
  // Argument passed from InvokeCommand.
  $.fn.woAjaxCallback = function(argument) {
    // console.log('Water Offer AjaxCallback is called.');
    // console.log(argument);
    // The  Drupal.behaviors.InitJsonEditor.jsonEditor is attached from the
    // AnalysisInputWidget
    Drupal.behaviors.InitJsonEditor.jsonEditor.setValue(argument)
  };

  $.fn.wrAjaxCallback = function(argument) {
    // console.log('Water Request AjaxCallback is called.');
    // console.log(argument);

    var rows = ''
    $.each( argument, function( key, value ) {
      // console.log(value);
      rows += '<tr><td>'+value['observed property']+'</td><td>'+value['uom']+'</td><td>'+value['limits']['container']['minvalue']+'</td><td>'+value['limits']['container']['maxvalue']+'</td></tr>';
    });

    $('#an_spec').html(rows);
  };


})(jQuery);
