/**
 * @file
 * JavaScript for mutistep waterloop node CREATE.
 */

(function ($) {


  Drupal.behaviors.Hide = {
    attach: function (context, settings) {

      // console.log('Hide');

      // Hide headers introduced with jquery-steps
      $('.mtsp').hide();

    }
  };

})(jQuery);
