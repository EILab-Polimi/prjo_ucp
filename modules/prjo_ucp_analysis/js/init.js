/**
 * @file
 * JavaScript for graph insertion.
 */

(function ($) {


  Drupal.behaviors.InitJsonEditor = {
    attach: function (context, settings) {

      Drupal.behaviors.InitJsonEditor.jsonEditor = Drupal.behaviors.InitJsonEditor.jsonEditor || null;
      // console.log('json editor');
      // console.log(drupalSettings);

      $('#cstmjsoneditor', context).once('InitJsonEditor').each(function() {

        // TODO test variable
        console.log(drupalSettings['json-editor']['test']);
        // var schema = JSON.parse(drupalSettings['jsoneditor']['schema']);

        // value will be empty when creting new node - NOT empty when editing node
        var value = JSON.parse(drupalSettings['json-editor']['value']);
        console.log(value);
        // field is the textbox where to insert the jsonb
        var field = document.querySelector('.js-editor');
        // console.log(field);
        // element is the markup with id cstmjsoneditor
        var element = document.getElementById('cstmjsoneditor');
        // console.log(element);

        // var options = {};
        var icons = (drupalSettings['json-editor']['iconlib'] === "null") ? null : drupalSettings['json-editor']['iconlib'];

        // var vEditor4JSON = new Editor4JSON();
        // var vInitData = vDataJSON["data"];
        // vEditor4JSON.init(vDOMID,vInitData,vSchemaJSON);
        // var editor = vEditor4JSON.aEditor;

        // var vLAE = new LargeArrayEditor();

        Drupal.behaviors.InitJsonEditor.jsonEditor = new JSONEditor(element, {
          theme: 'bootstrap4',
          // template: 'swig',
          ajax: true,
          schema: JSON.parse(drupalSettings['json-editor']['schema']),
          show_errors: drupalSettings['json-editor']['show_errors'],
          disable_array_add: drupalSettings['json-editor']['disable_array_add'],
          disable_array_delete: drupalSettings['json-editor']['disable_array_delete'],
          disable_array_delete_all_rows: drupalSettings['json-editor']['disable_array_delete_all_rows'],
          disable_array_delete_last_row: drupalSettings['json-editor']['disable_array_delete_last_row'],
          disable_array_reorder: drupalSettings['json-editor']['disable_array_reorder'],
          enable_array_copy: drupalSettings['json-editor']['enable_array_copy'],
          disable_collapse: drupalSettings['json-editor']['disable_collapse'],
          object_layout: drupalSettings['json-editor']['object_layout'],
          iconlib: icons,
          remove_button_labels: drupalSettings['json-editor']['remove_button_labels'],
          disable_edit_json: drupalSettings['json-editor']['disable_edit_json'],
          disable_properties: drupalSettings['json-editor']['disable_properties'],
          no_additional_properties: drupalSettings['json-editor']['no_additional_properties'],
        });

        // console.log(Drupal.behaviors.InitJsonEditor.jsonEditor);
        // When using ref we need to initiate the json-editor when ready
        Drupal.behaviors.InitJsonEditor.jsonEditor.on('ready',() => {
          // Now the api methods will be available
          // editor.validate();
          Drupal.behaviors.InitJsonEditor.jsonEditor.setValue(value);
          Drupal.behaviors.InitJsonEditor.jsonEditor.validate();
        });
        // editor.setValue(value);

        // listen for changes
        Drupal.behaviors.InitJsonEditor.jsonEditor.on('change', function () {
          console.log('CHANGE');

          $( "div[data-schemapath$='container'] > h3" ).remove();
          $( "div[data-schemapath$='container'] > span" ).remove();
          $( "div[data-schemapath$='container'] > div" ).removeClass('card card-body mb-3');

          $( "td[data-schemapath$='influent'] > div" ).removeClass('card card-body mb-3');
          $( "td[data-schemapath$='effluent'] > div" ).removeClass('card card-body mb-3');
          $( "td[data-schemapath$='influent'] > h3" ).remove();
          $( "td[data-schemapath$='effluent'] > h3" ).remove();
          $( "td[data-schemapath$='influent'] > span" ).remove();
          $( "td[data-schemapath$='effluent'] > span" ).remove();

          //
          // $( "div[data-schemapath$='min'] > div" ).removeClass('card card-body');
          // // $( "div[data-schemapath$='min'] > h3" ).after( '<small class="form-text">Min</small>' );
          // $( "div[data-schemapath$='max'] > div" ).removeClass('card card-body');
          // // $( "div[data-schemapath$='max'] > h3" ).after( '<small class="form-text">Max</small>' );

          // output
          var json = Drupal.behaviors.InitJsonEditor.jsonEditor.getValue()
          field.value = JSON.stringify(json, null, 2)

          // validate
          var validationErrors = Drupal.behaviors.InitJsonEditor.jsonEditor.validate()
          if (validationErrors.length) {
            console.log(JSON.stringify(validationErrors, null, 2));
            // validateTextarea.value = JSON.stringify(validationErrors, null, 2)
          } else {
            console.log('valid');
            // validateTextarea.value = 'valid'
          }
        })
      });

    }
  };

})(jQuery);
