/**
 * @file
 * JavaScript for MAP waterloop node CREATE.
 * - http://bl.ocks.org/zross/47760925fcb1643b4225
 * - https://github.com/lennardv2/Leaflet.awesome-markers
 */

(function ($) {


  Drupal.behaviors.WRViewAnSpec = {
    attach: function (context, settings) {

      $("#an_spec").once().each(function() {
        // console.log(settings);
        var rows = ''
        $.each( settings.spec, function( key, value ) {
          // console.log(value);
          rows += '<tr><td>'+value['observed property']+'</td><td>'+value['uom']+'</td><td>'+value['limits']['container']['minvalue']+'</td><td>'+value['limits']['container']['maxvalue']+'</td></tr>';
        });

        $('#an_spec').html(rows);

      });

    }
  };

})(jQuery);
