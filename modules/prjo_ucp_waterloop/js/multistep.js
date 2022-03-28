/**
 * @file
 * JavaScript for mutistep waterloop node CREATE.
 */

(function ($) {


  Drupal.behaviors.Multistep = {
    attach: function (context, settings) {

      // console.log(JSON.stringify(settings.geoJson));

      // Hide default form buttons
      $('#edit-actions').hide();

      var form = $('#node-water-loop-form');

      // $.validator.addMethod("oneSelected", function(value, elem, param) {
      //   console.log(elem);
      //   return $(".roles:checkbox:checked").length > 0;
      // },"You must select at least one!");

      // form.once().validate({
      //   debug: true,
      //   errorPlacement: function errorPlacement(error, element) { element.before(error); },
      //   rules: {
      //       // confirm: {
      //       //     equalTo: "#password"
      //       // }
      //       // "edit-field-ws-ref-wrapper": {oneSelected : true},
      //       title: {required: true}
      //   }
      // });



      $("#water-loop").once().steps({
          headerTag: "h3",
          bodyTag: "section",
          transitionEffect: "slideLeft",
          autoFocus: true,
          onStepChanging: function (event, currentIndex, newIndex) {
            // Always allow going backward even if the current step contains invalid fields!
            if (currentIndex > newIndex) {
                return true;
            }

            // step 1
            console.log(currentIndex);
            // if(currentIndex == 0){
            //   console.log('MAP');
            //   // TODO bisogna reinizializzare la mappa perchè le dimensioni del container div non sono al 100%
            //   Drupal.behaviors.WaterLoopMap.map.off();
            //   Drupal.behaviors.WaterLoopMap.map.remove();
            //   // Drupal.behaviors.WaterLoopMap.map.invalidateSize();
            // }
            if(currentIndex == 0 && !$("input[name='field_application_field_txn']:checked").val()) {
              // console.log('nothing checked');
              // $(".steps").after('<div class="alert-status alert-success alert-dismissible fade show">Error message to be displayed</div>');
              $(".steps > ul > li.current > a").append('<p class="pt-2 m-0">Please select at least one Application field</p>');
              // no checkbox checked, do something...
              // $(this).children('div > ul > li.current').addClass('error');
              // $(this).children('div > ul > li.current > a').after("<p>Test</p>");
              return false;
            }
            // step 2
            if(currentIndex == 1 && $('#edit-field-ws-ref-wrapper > table > tbody :checkbox:checked').length == 0) {
              // console.log('nothing checked');
              // $(".steps").after('<div class="alert-status alert-success alert-dismissible fade show">Error message to be displayed</div>');
              $(".steps > ul > li.current > a").append('<p class="pt-2 m-0">Please select at least one item</p>');
              // no checkbox checked, do something...
              // $(this).children('div > ul > li.current').addClass('error');
              // $(this).children('div > ul > li.current > a').after("<p>Test</p>");
              return false;
            }
            // step 3
            if(currentIndex == 2 && $('#edit-field-tp-ref-wrapper > table > tbody :checkbox:checked').length == 0) {
              $(".steps > ul > li.current > a").append('<p class="pt-2 m-0">You go with no technology selected</p>');
            }

            // Disable validation on fields that are disabled or hidden.
            form.validate().settings.ignore = ":disabled,:hidden";
            // // Start validation; Prevent going forward if false
            return form.valid();
          },
          onFinishing: function (event, currentIndex) {
            // console.log('FINISHING');
            // console.log(currentIndex);
            // step 3 - FINISH
            if(currentIndex == 2 && $('#edit-field-wr-ref-wrapper > table > tbody :checkbox:checked').length == 0) {
              // console.log('nothing checked');
              $(".steps > ul > li.current > a").append('<p class="pt-2 m-0">Please select at least one item</p>');
              return false;
            }

            // Disable validation on fields that are disabled or hidden.
            form.validate().settings.ignore = ":disabled";
            // Start validation; Prevent form submission if false
            return form.valid();
          },
          onFinished: function (event, currentIndex) {
            // Submit the form
            form.submit();
          },
      })

    }
  };

})(jQuery);
