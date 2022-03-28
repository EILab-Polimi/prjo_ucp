/**
 * @file
 * JavaScript for graph insertion.
 */

(function ($) {


  Drupal.behaviors.InitMathjs = {
    attach: function (context, settings) {

      // console.log(drupalSettings);
      //
      // console.log(math.sqrt(-4).toString()) // 2i

      $('#pistable').once('testOnce').each(function() {
        var data = drupalSettings['MathJs']['data'];
        // var spec = drupalSettings['MathJs']['spec'];

        console.log(data);
        // console.log(spec);
        // console.log('INIT MATHJS');
        // console.log(drupalSettings);
        var spec = drupalSettings['spec'];
        console.log("Spec")
        console.log(spec);

        var r1 = [];
        var r2 = [];
        var th = [];

        if(data[0]['observed property'] != '' && spec !== null){
          $.each( data, function( key, value ) {

            // Test if on known uom
            if (value['uom'] == 'ug/L' || value['uom'] == 'mg/L') {
              // Get the object in spec with the same data['observed property']
              let obj = spec.find(o => o['observed property'] === value['observed property']);
              // console.log(obj);

              if (obj !== undefined){
                if (value.value){

                  th.push(value['observed property']);
                  // Create 2 math.js Unit object using the respective uom
                  const val = math.unit(value.value, value.uom);
                  const lim = math.unit(obj.limits.container.maxvalue, obj.uom);
                  // Get the value/number of the Unit respect to the spec limits uom
                  const valConverted = math.number(val, obj.uom);
                  const limNum = math.number(lim, obj.uom);
                  // console.log(val);
                  // console.log(value['observed property']);
                  // console.log(valConverted);
                  // console.log(limNum);
                  // if (valConverted > 10) {
                  //   r1.push(Math.log(valConverted));
                  // } else {
                  //   r1.push(valConverted);
                  // }
                  if (limNum > 10) {
                    r1.push(Math.log(valConverted));
                    r2.push(Math.log(limNum));
                  } else {
                    r1.push(valConverted);
                    r2.push(limNum);
                  }

                  if (valConverted > limNum){
                    // console.log(value['observed property'] +' limit reached');
                    $('.row-'+value['observed property']).addClass('btn-danger');
                  }

                }
              }
            } else {
              // For demo purpose only
              // Get the object in spec with the same data['observed property']
              let obj = spec.find(o => o['observed property'] === value['observed property']);
              if (obj !== undefined){
                if (value.value > obj.limits.container.maxvalue){
                  $('.row-'+value['observed property']).addClass('btn-danger');
                }
              }
            }

          });
        }
        // var allvalues = r1.concat(r2);
        // // console.log(allvalues);
        // var max = Math.max(...allvalues);
        // // console.log(max);
        // th.push(th[0]);
        // r1.push(r1[0]);
        // r2.push(r2[0]);
        // // console.log(th);
        // console.log(r1);
        // console.log(r2);
        //
        //
        // grphdata = [
        //   {
        //   type: 'scatterpolar',
        //   // r: [39, 28, 8, 7, 28, 39],
        //   r: r1,
        //   // theta: ['A','B','C', 'D', 'E', 'A'],
        //   theta: th,
        //   fill: 'toself',
        //   name: 'Values'
        //   },
        //   {
        //   type: 'scatterpolar',
        //   // r: [1.5, 10, 39, 31, 15, 1.5],
        //   r: r2,
        //   // theta: ['A','B','C', 'D', 'E', 'A'],
        //   theta: th,
        //   fill: 'toself',
        //   name: 'Limits'
        //   }
        // ]
        //
        // layout = {
        //   title: 'Values over 10 are plotted on log scale',
        //   // font: {size: 4},
        //   polar: {
        //     radialaxis: {
        //       visible: true,
        //       range: [0, max]
        //     }
        //   }
        // }
        //
        // var config = {responsive: true,
        //               // scrollZoom: true // not working for radial
        //             }
        //
        // Plotly.newPlot("radialplotly", grphdata, layout, config)


      });


    }
  };

})(jQuery);
