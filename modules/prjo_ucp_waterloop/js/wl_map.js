/**
 * @file
 * JavaScript for MAP waterloop node CREATE.
 * - http://bl.ocks.org/zross/47760925fcb1643b4225
 * - https://github.com/lennardv2/Leaflet.awesome-markers
 */

(function ($) {


  Drupal.behaviors.WaterLoopMap = {
    attach: function (context, settings) {

      Drupal.behaviors.WaterLoopMap.map = Drupal.behaviors.WaterLoopMap.map || null;
      Drupal.behaviors.WaterLoopMap.pathLine = Drupal.behaviors.WaterLoopMap.pathLine || null;

      // Drupal.behaviors.WaterLoopMap.allWSlayer = Drupal.behaviors.WaterLoopMap.allWSlayer || null;
      Drupal.behaviors.WaterLoopMap.allWR = Drupal.behaviors.WaterLoopMap.allWR || null;
      Drupal.behaviors.WaterLoopMap.allWRFeatures = Drupal.behaviors.WaterLoopMap.allWRFeatures || null;

      // Layers ws and wr mine and others
      Drupal.behaviors.WaterLoopMap.othersWsM = Drupal.behaviors.WaterLoopMap.othersWsM || {}
      Drupal.behaviors.WaterLoopMap.mineWsM = Drupal.behaviors.WaterLoopMap.mineWsM || {}
      Drupal.behaviors.WaterLoopMap.othersWrM = Drupal.behaviors.WaterLoopMap.othersWrM || {}
      Drupal.behaviors.WaterLoopMap.mineWrM = Drupal.behaviors.WaterLoopMap.mineWrM || {}

      // Selection
      Drupal.behaviors.WaterLoopMap.selected = Drupal.behaviors.WaterLoopMap.selected || { "WS":[] , "WR":[] };

      Drupal.behaviors.WaterLoopMap.initialBounds = Drupal.behaviors.WaterLoopMap.initialBounds || null;

      Drupal.behaviors.WaterLoopMap.taxonomyTerms = Drupal.behaviors.WaterLoopMap.taxonomyTerms || {};

      // Analysis - Analysis Specifications - Observed properties out of limits
      Drupal.behaviors.WaterLoopMap.WSAnalysis = Drupal.behaviors.WaterLoopMap.WSAnalysis || {}
      Drupal.behaviors.WaterLoopMap.AnalysisSpecGlob = Drupal.behaviors.WaterLoopMap.AnalysisSpecGlob || {}
      Drupal.behaviors.WaterLoopMap.ObsPropOut = Drupal.behaviors.WaterLoopMap.ObsPropOut || []
      Drupal.behaviors.WaterLoopMap.OutQuality = Drupal.behaviors.WaterLoopMap.OutQuality || []
      Drupal.behaviors.WaterLoopMap.PercentageNoSpec = Drupal.behaviors.WaterLoopMap.PercentageNoSpec || []
      Drupal.behaviors.WaterLoopMap.PercentageSpec = Drupal.behaviors.WaterLoopMap.PercentageSpec || []

      Drupal.behaviors.WaterLoopMap.techXanalysis = Drupal.behaviors.WaterLoopMap.techXanalysis || [];
      Drupal.behaviors.WaterLoopMap.techXapplf = Drupal.behaviors.WaterLoopMap.techXapplf || [];

      Drupal.behaviors.WaterLoopMap.checkedTech = Drupal.behaviors.WaterLoopMap.checkedTech || [];
      // Drupal.behaviors.WaterLoopMap.unchechedTech = Drupal.behaviors.WaterLoopMap.unchechedTech || [];

      /**
      / Get the analysis given the list of Water streams selected nids
      / @wsSelected - array of selected water stream in table
      */
      Drupal.behaviors.WaterLoopMap.ajax1 = function (wsSelected) {
        return $.ajax({
            type: 'POST',
            url: '/api/wsanalysis',
            data: JSON.stringify({ws: wsSelected}),
            success: parseWSanalysis,
            error: function(jqXHR, textStatus, errorThrown) {
              alert("error on ajax1");
            }
            // complete: setGCjsonObject,
        });

        function parseWSanalysis (data, textStatus, jqXHR) {
          // console.log(data);
          var obj = JSON.parse(data);
          // console.log(obj);
          Drupal.behaviors.WaterLoopMap.WSAnalysis = obj;
        }
      }

      /**
      / Get analysis specifications given the list of application field term id
      / of Water request (TODO the application field can be a mix an array)
      / @appFieldTid - The application field term id
      */
      Drupal.behaviors.WaterLoopMap.ajax2 = function (appFieldTid) {
        return $.ajax({
            type: 'POST',
            url: '/api/analysis_spec',
            data: JSON.stringify({app_field: appFieldTid}),
            success: anSpecParse,
            error: function(jqXHR, textStatus, errorThrown) {
              alert("error on ajax2");
            }
            // complete: setGCjsonObject,
        });

        function anSpecParse (data, textStatus, jqXHR) {
          // console.log(data);
          if ($.isEmptyObject(data)) {
            alert('ANALYSIS SPECIFICATIONS NOT FOUND FOR THE APPLICATION FIELD');
            var obj = {};
          } else {
            var obj = JSON.parse(data);
          }
          // console.log(obj);
          Drupal.behaviors.WaterLoopMap.AnalysisSpecGlob = obj;
        }
      }

      /**
      / Simple function to get back background color for progress bars
      / TODO  move in utility functions
      */
      // Drupal.behaviors.WaterLoopMap.getBg = function (entry) {
      Drupal.behaviors.WaterLoopMap.getBg = function (number) {

        // var number = Number(entry);
        // console.log(number);

        if(number <= 25){
          return "bg-danger";
        } else if (25 < number && number <= 50) {
          return "bg-warning";
        } else if (50 < number && number <= 75) {
          return "bg-primary";
        } else if(75 < number) {
          return "bg-success";
        } else {
          return "bg-secondary";
        }
      }

      /**
      / Fill the Water loop status card
      */
      Drupal.behaviors.WaterLoopMap.WaterLoopCard = function () {
        // console.log(Drupal.behaviors.WaterLoopMap.selected.WS);
        // console.log(Drupal.behaviors.WaterLoopMap.selected.WR);
        // get selected fetures from nids
        // ACTUALLY we works on 1! WS && 1! WR -> [0]
        var wsfeature = Drupal.behaviors.WaterLoopMap.allWSFeatures.features.filter(obj => {
          // return obj.properties.nid === ws[0]
          return obj.properties.nid === Drupal.behaviors.WaterLoopMap.selected.WS[0].nid
        })
        var wrfeature = Drupal.behaviors.WaterLoopMap.allWRFeatures.features.filter(obj => {
          // return obj.properties.nid === wr[0]
          return obj.properties.nid === Drupal.behaviors.WaterLoopMap.selected.WR[0].nid
        })
        // console.log(wsfeature);
        /**
        / Calculate Distance
        */
        //??? latlng are inverted inside the GEOJson geometry.coordinates ???
        // Reverse Array Without Mutating Original Array
        var latlng1 = wsfeature[0].geometry.coordinates.slice().reverse();
        // var FAIL = wsfeature[0].getLatLng();
        var latlng2 = wrfeature[0].geometry.coordinates.slice().reverse();
        var distance = L.latLng(latlng1).distanceTo(L.latLng(latlng2));
        // console.log(distance);
        // console.log(distance.toFixed(0)/1000 + ' km');
        $('#distance').html(distance.toFixed(0)/1000 + ' km')

        // Create a line between the markers
        // TODO - associate to the doubleclick
        // var pathLine = L.polyline([latlng1, latlng2], {color: 'red'}).addTo(Drupal.behaviors.WaterLoopMap.map)
        Drupal.behaviors.WaterLoopMap.pathLine = L.polyline([latlng1, latlng2], {color: 'red'});
        Drupal.behaviors.WaterLoopMap.pathLine.addTo(Drupal.behaviors.WaterLoopMap.map)
        // // zoom the map to the polyline
        // Drupal.behaviors.WaterLoopMap.map.fitBounds(Drupal.behaviors.WaterLoopMap.pathLine.getBounds());

        /**
        / Calculate Flow percent and Water Demand Satisfied
        */
        var wsflow = wsfeature[0].properties.flow;
        var wrflow = wrfeature[0].properties.flow;

        var flowPercentage = ((wsflow/wrflow)*100).toFixed(2);
        var invFlowPercentage = ((wrflow/wsflow)*100).toFixed(2);
        // console.log('Try the inverse flow percentage on 0 lim');
        // console.log(invFlowPercentage);

        var bg = Drupal.behaviors.WaterLoopMap.getBg(flowPercentage)
        $('#wd > h4 > span').html(flowPercentage+' %');
        $('#wd > div > div').removeClass().addClass('progress-bar '+bg);;
        $('#wd > div > div').css("width",flowPercentage+"%");

        /**
        /  Quality - CREATE initial void elements for quality && fill with CalculateWaterQuality
        */
        // console.log(Drupal.behaviors.WaterLoopMap.ObsPropOut);

        Drupal.behaviors.WaterLoopMap.OutQuality= [];
        // TODO 183
        $.each(Drupal.behaviors.WaterLoopMap.ObsPropOut, function( index, value ) {

          if(value.isSpec) {
            $('#wq').append(
              '<div id="wq_'+value.op+'">'+
              '<h4 class="small font-weight-bold">'+value.op+':&nbsp;<span class="float-right"></span></h4>'+
              // '<span>'+value.op+'</span>'+
              '<div class="progress progress-sm mb-3">'+
                '<div class="progress-bar" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"><span class="sr-only"></span></div>'+
              '</div>'+
              '</div>'
            )
          } else {
            // TODO use a second column for parametrers not law ruled
            $('#wq_noSpec').append(
              '<div id="wq_noSpec_'+value.op+'" style="display:none;">'+
              '<h4 class="small font-weight-bold" style="margin-left: -0.75rem;">'+value.op+':&nbsp;<span class="float-right"></span></h4>'+

              '<div class="row">'+
                '<div class="progress-sign-left progress-sm mb-3 flex-row-reverse" style="width: 50%;">'+
                  '<div class="progress-bar" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"><span class="sr-only">0</span></div>'+
                '</div>'+
                '<div class="progress-sign-right progress-sm mb-3 flex-row" style="width: 50%;">'+
                  '<div class="progress-bar" aria-valuemin="0" aria-valuemax="100" style="width: 0%;"><span class="sr-only"></span></div>'+
                '</div>'+
              '</div>' +
              '</div>'
            )
          }
          // console.log("FIRST QUALITY SET");
          Drupal.behaviors.WaterLoopMap.OpsPropWaterQuality(value, null)

        });
        Drupal.behaviors.WaterLoopMap.GlobalWaterQuality()

        // Display the Water Loop status card
        $('#wl_status').show();
        $('#wl_status_noSpec').show();
      }

      /**
      // Generic function to set and add to map Water Streams or Water Demands only if not defined
      **/
      Drupal.behaviors.WaterLoopMap.insertMirrorMarkers = function() {
        if ($.isEmptyObject(Drupal.behaviors.WaterLoopMap.mineWrM)){
          // If we have selected a Water Stream let's add to the map the Water demands
          // TODO - verify if the layer is already on the map before to add it
          Drupal.behaviors.WaterLoopMap.mineWrM = Drupal.behaviors.WaterLoopMap.functionalMarker('WR', Drupal.behaviors.WaterLoopMap.allWRFeatures, true, 'edit-field-wr-ref', Drupal.behaviors.WaterLoopMap.taxonomyTerms);
          Drupal.behaviors.WaterLoopMap.mineWrM.addTo(Drupal.behaviors.WaterLoopMap.map);
        }
        if ($.isEmptyObject(Drupal.behaviors.WaterLoopMap.othersWrM)){
          Drupal.behaviors.WaterLoopMap.othersWrM = Drupal.behaviors.WaterLoopMap.functionalMarker('WR', Drupal.behaviors.WaterLoopMap.allWRFeatures, false, 'edit-field-wr-ref', Drupal.behaviors.WaterLoopMap.taxonomyTerms);
          Drupal.behaviors.WaterLoopMap.othersWrM.addTo(Drupal.behaviors.WaterLoopMap.map);
        }
        if ($.isEmptyObject(Drupal.behaviors.WaterLoopMap.mineWsM)){
          Drupal.behaviors.WaterLoopMap.mineWsM = Drupal.behaviors.WaterLoopMap.functionalMarker('WS', Drupal.behaviors.WaterLoopMap.allWSFeatures, true, 'edit-field-ws-ref', Drupal.behaviors.WaterLoopMap.taxonomyTerms);
          Drupal.behaviors.WaterLoopMap.mineWsM.addTo(Drupal.behaviors.WaterLoopMap.map);
        }
        if ($.isEmptyObject(Drupal.behaviors.WaterLoopMap.othersWsM)){
          Drupal.behaviors.WaterLoopMap.othersWsM = Drupal.behaviors.WaterLoopMap.functionalMarker('WS', Drupal.behaviors.WaterLoopMap.allWSFeatures, false, 'edit-field-ws-ref', Drupal.behaviors.WaterLoopMap.taxonomyTerms);
          Drupal.behaviors.WaterLoopMap.othersWsM.addTo(Drupal.behaviors.WaterLoopMap.map);
        }
        // ZOOM to bounds Flying - Tobe implemented
        // TODO Lo zoom arriva troppo in alto se abbiamo fetures lontane
        // Drupal.behaviors.WaterLoopMap.map.flyToBounds(Drupal.behaviors.WaterLoopMap.extendedBounds, {
        //     padding: [50, 50]
        // });
      }

      /**
      // Insert or remove the selected marker inside global object
      */
      Drupal.behaviors.WaterLoopMap.fillSelected = function(insert, markerType, nid, appFieldTid) {
        // console.log(markerType);
        // console.log(Drupal.behaviors.WaterLoopMap.selected);
        if (insert){
          Drupal.behaviors.WaterLoopMap.selected[markerType].push({"nid": nid, "appf":appFieldTid})
        } else { // remove the entry
          for (var i in Drupal.behaviors.WaterLoopMap.selected[markerType]) {
            if (Drupal.behaviors.WaterLoopMap.selected[markerType][i].nid == nid) {
              Drupal.behaviors.WaterLoopMap.selected[markerType].splice(i, 1);
            }
          }
        }
      }

      // Get technologies given the Observed properties out of limit
      // && the application field of the water requests
      Drupal.behaviors.WaterLoopMap.GetTechnologies = function() {
        // return
        $.ajax({
            type: 'POST',
            url: '/api/technology',
            data: JSON.stringify({"analysis": Drupal.behaviors.WaterLoopMap.ObsPropOut,
                                  "app_field": Drupal.behaviors.WaterLoopMap.selected.WR[0].appf
            }),
            success: techParse,
            error: function(jqXHR, textStatus, errorThrown) {
              alert("error on GetTechnologies ajax");
            }
            // complete: setGCjsonObject,
        });

        function techParse (data, textStatus, jqXHR) {
          console.log("Response from get GetTechnologies");
          console.log(data);
          if (data.techXanalysis.length == 0) {
            alert('No matching technology found for the Analysis');
          } else {
            // console.log(data.techXanalysis);
            Drupal.behaviors.WaterLoopMap.techXanalysis = data.techXanalysis;
            // Insert technologies inside the table
            $.each(Drupal.behaviors.WaterLoopMap.techXanalysis, function( index, value ) {
              // console.log('techXanalysis');
              // console.log( value );
              // $('#edit-field-tp-ref > tbody:last-child').append('<tr class="small" id="'+index+'"><td>'+value.author+'</td><td><a href="/node/'+index+'">'+value.title+'</a></td><td><input type="number" style="width: 3em; display:none;" min="1" value="1" step="1" id="qty_'+index+'"></td><td><input type="checkbox" id="tech_'+index+'"></td></tr>');
              $('#edit-field-tp-ref > tbody:last-child').append('<tr id="'+index+'">'+
                                               '<td style="border:none;">'+
                                                  '<div class="">'+
                                                  '<a class="ml-1" href="/node/'+index+'" style="color:#787878;">'+value.title+'</a>'+
                                                  '<span class="float-right"><input type="number" style="width: 3em; display:none;" min="0" value="1" step="1" id="qty_'+index+'">'+
                                                  // '<button id="tech_'+index+'" class="btn p-0 add-tech"><i class="fas fa-plus"></i></button></span>'+
                                                  '<input class="form-check-input" type="radio" name="techRadios" id="tech_'+index+'">'+
                                                  '</div></td></tr>');

            });

          }
          if (data.techXapplf.length == 0) {
            alert('No matching technology found for the Application Field realted to the Water request');
          } else {
            Drupal.behaviors.WaterLoopMap.techXapplf = data.techXapplf;
            // Insert technologies inside the table
            $.each(Drupal.behaviors.WaterLoopMap.techXapplf, function( index, value ) {
              // console.log('techXapplf');
              // console.log( value );
              // $('#edit-field-tp-ref > tbody:last-child').append('<tr class="small bg-gray-300" id="'+index+'"><td>'+value.author+'</td><td><a href="/node/'+index+'">'+value.title+'</a></td><td></td><td><input type="checkbox" id="tech_'+index+'"></td></tr>');
              $('#edit-field-tp-ref > tbody:last-child').append('<tr id="'+index+'">'+
                                               '<td style="border:none;">'+
                                                  '<div class="">'+
                                                  '<a class="ml-1" href="/node/'+index+'" style="color:#787878;">'+value.title+'</a>'+
                                                  '<span class="float-right"><input type="number" style="width: 3em; display:none;" min="0" value="1" step="1" id="qty_'+index+'">'+
                                                  // '<button id="tech_'+index+'" class="btn p-0 add-tech"><i class="fas fa-plus"></i></button></span>'+
                                                  '<input class="form-check-input" type="radio" name="techRadios" id="tech_'+index+'">'+
                                                  '</div></td></tr>');

            });
          }

          // Removed buttons and quantity - use radios
          $("input[type='radio']").change(function() {
            console.log("CHANGED");
            var myarr = $(this).attr('id').split("_");
            // console.log("technology id: "+myarr[1]);
            var checked = myarr[1];
            console.log(Drupal.behaviors.WaterLoopMap.checkedTech);
            Drupal.behaviors.WaterLoopMap.checkedTech = [{"id": checked, "qty": 1}];
            Drupal.behaviors.WaterLoopMap.WaterLoopCardQuality();
          });


          // Attach functionalities to .add-tech + buttons
          // $(".add-tech").click(function(event){
          //   event.preventDefault()
          //   var myarr = $(this).attr('id').split("_");
          //   // console.log("technology id: "+myarr[1]);
          //   var checked = myarr[1];
          //   // console.log(checked);
          //   $('#qty_'+checked).show();
          //   $(this).hide();
          //   // Insert it in Drupal.behaviors.WaterLoopMap.checkedTech
          //   Drupal.behaviors.WaterLoopMap.checkedTech.push({"id": checked, "qty": $('#qty_'+checked).val()});
          //   Drupal.behaviors.WaterLoopMap.WaterLoopCardQuality();
          // })
          // Attach functionalities to the number input boxes
          // $("input[type='number']").change(function() {
          //     var myarr = $(this).attr('id').split("_");
          //     // console.log("technology id: "+myarr[1]);
          //     var checked = myarr[1];
          //     // console.log(checked);
          //
          //     if (Drupal.behaviors.WaterLoopMap.checkedTech.findIndex((obj => obj.id == checked)) !== -1) {
          //       var index = Drupal.behaviors.WaterLoopMap.checkedTech.findIndex((obj => obj.id == checked));
          //
          //       if($('#qty_'+checked).val() == 0) {
          //         Drupal.behaviors.WaterLoopMap.checkedTech.splice(index,1)
          //         $("#tech_"+checked).show()
          //         $(this).val(1);
          //         $(this).hide();
          //       } else {
          //         //Update object's name property.
          //         Drupal.behaviors.WaterLoopMap.checkedTech[index].qty = $('#qty_'+checked).val();
          //       }
          //     }
          //     Drupal.behaviors.WaterLoopMap.WaterLoopCardQuality();
          // });

          // EDIT - Fire the click event for the previously selected technologies
          if( ('wlElements' in settings) && (settings.wlElements.TPQ.length > 0) ){
          // if( settings.wlElements.TPQ.length > 0 ){
            // console.log(settings.wlElements.TPQ);
            // Check previously selected technologies
            $.each(settings.wlElements.TPQ, function(index, value){
              // console.log(value);
              // console.log($('#tech_'+value.id));
              // $('#tech_'+value).prop( "checked", true );
              $('#qty_'+value.id).val(value.qty);
              $('#tech_'+value.id).trigger('click');
            });
            // TODO empty the settings.wlElements.TP array to avoid the selected technologies has been
            // reselected when adding a new WR
            // settings.wlElements.TP = [];
          }
          // End for EDIT node
        }
      }

      // This function can be called with
      // @techOp object or null - that is the thechnology effluent and influent values
      //                          if null the quality is about the status and the anlysis specification limits
      // It resolve single elements qualities
      // Is called foreach property opOut
      Drupal.behaviors.WaterLoopMap.OpsPropWaterQuality = function(opOut, techOps){
        // console.log(opOut);
        // console.log(techOp);
        // If we have some technology who operate on Observed property
        if (techOps !== null && (typeof techOps !== "undefined")){
          console.log('Drupal.behaviors.WaterLoopMap.Spec');
          console.log(techOps);
          // console.log(opOut);
          $.each(techOps.technologies, function( techId, techOp ) {
            // Get the effluent && influent variation given from technology
            var eff = (techOp.effluent.container.maxvalue == null) ? techOp.effluent.container.minvalue : techOp.effluent.container.maxvalue;
            var inf = (techOp.influent.container.maxvalue == null) ? techOp.influent.container.minvalue : techOp.influent.container.maxvalue;

            console.log("Influent " + inf);
            console.log("Effluent " + eff);


            if (opOut.lim !== undefined){

              var originalNum = opOut.val
              var prop = (eff/inf) // given by technology effluent values && influent values
              var newNum = originalNum * prop

              // Increase = New Number - Original Number
              // Next, divide the increase by the original number and multiply the answer by 100:
              // % increase = Increase ÷ Original Number × 100.
              // Positive values indicate a percentage increase whereas negative values indicate the percentage decrease.

              var increase = newNum - originalNum
              var increasePerc = (increase/originalNum) * 100
              // console.log(increasePerc);

              // Calculate percentage of quality respect to the laws limits
              if(opOut.lim == 0) {
                var lim = 0.0001;
              } else {
                var lim = opOut.lim;
              }

              // var redux = (eff/inf)*100;
              var prop = (eff/inf)*100;
              // var redux = ((eff/inf)*100)*(techOp.qty);
              var redux = (100-prop)*(techOp.qty);
              // console.log("Redux");
              // console.log(redux);

              // calculate the initial % of quality
              var inQuality = (lim/opOut.val)*100;
              // console.log(inQuality);

              // calculate the final % of quality
              var outQuality = Number(inQuality) + Number(redux);
              // console.log(outQuality);


              var id = '#wq_'+opOut['op'];
              var elem = {'id':id, 'val':outQuality}

              var found = Drupal.behaviors.WaterLoopMap.PercentageSpec.find(o => o['id'] === id);
              if (found === undefined){
                Drupal.behaviors.WaterLoopMap.PercentageSpec.push(elem)
              } else {
                // console.log(found);
                found.val = found.val + elem.val;
              }

              if (outQuality >= 100) {
                Drupal.behaviors.WaterLoopMap.OutQuality.push({'id':id, 'val':100});
              }  else {
                Drupal.behaviors.WaterLoopMap.OutQuality.push({'id':id, 'val':outQuality});
              }


            } else {
              // Calculate percentage of improve/worsen respect to the actual value
              var originalNum = opOut.val
              var prop = (eff/inf) // given by technology effluent values && influent values
              var newNum = originalNum * prop

              // Increase = New Number - Original Number
              // Next, divide the increase by the original number and multiply the answer by 100:
              // % increase = Increase ÷ Original Number × 100.
              // Positive values indicate a percentage increase whereas negative values indicate the percentage decrease.

              var increase = newNum - originalNum
              var increasePerc = (increase/originalNum) * 100
              // console.log('CALCULATED');
              // console.log(increasePerc);
              // console.log('-------------------------------');
              // DEMONSTRATION The percentage is the same no matter the originalNum value
              // We don't need to take care of the order of the application of technologies
              // var originalNum = 100000
              // var prop = (eff/inf) // given by technology effluent values && influent values
              // var newNum = originalNum * prop
              // var increase = newNum - originalNum
              // var increasePerc = (increase/originalNum) * 100
              // console.log('CALCULATED 2');
              // console.log(increasePerc);

              // var bg = Drupal.behaviors.WaterLoopMap.getBg(increasePerc)
              var id = '#wq_noSpec_'+opOut['op'];
              var elem = {'id':id, 'val':increasePerc*techOp.qty}

              var found = Drupal.behaviors.WaterLoopMap.PercentageNoSpec.find(o => o['id'] === id);
              if (found === undefined){
                Drupal.behaviors.WaterLoopMap.PercentageNoSpec.push(elem)
              } else {
                // console.log(found);
                found.val = found.val + elem.val;
              }

              console.log(Drupal.behaviors.WaterLoopMap.PercentageNoSpec);

            }
          });

        } else { // All the technologies are unselected calculate quality on the analysis values

          // var range = max - min
          // var range = opOut.max - opOut.lim;
          // correctedStartValue = input - min
          // var correctedStartValue = opOut.val - opOut.lim;
          // percentage = (correctedStartValue * 100) /
          // console.log(opOut.lim);
          // console.log(opOut.val);
          if(opOut.lim == 0) {
            var lim = 0.0001;
          } else {
            var lim = opOut.lim;
          }
          // console.log(lim);
          var outQuality = parseFloat((lim/opOut.val)*100);
          // console.log(outQuality);
          if (!Number.isNaN(outQuality)){
            // Fix the outquality max to 100%
            if(outQuality >= 100) {
              outQuality = 100;
            }
            // Calculate Global water quality like the average of the single percentage
            // sum outQuality && divide for it's numerosity
            // fill a global var with outQuality values
            var id = opOut['op'];
            var elem = {'id':id, 'val':outQuality}

            //
            console.log('LAST');
            console.log(elem);
            Drupal.behaviors.WaterLoopMap.OutQuality.push(elem);


            // console.log(outQuality);
            var bg = Drupal.behaviors.WaterLoopMap.getBg(outQuality)

            var id = '#wq_'+opOut['op'];
            // Set new quality % foreach ObsPropOut
            $(id+' > h4 > span').html(outQuality.toFixed(2)+'%');
            // remove previous classes && add new
            $(id+' > div > div').removeClass().addClass('progress-bar '+bg);
            $(id+' > div > div').css("width",outQuality+"%");
          }
        }


      }

      // Set global water quality
      Drupal.behaviors.WaterLoopMap.GlobalWaterQuality = function() {
        console.log('GlobalWaterQuality');
        console.log(Drupal.behaviors.WaterLoopMap.OutQuality);
        // const newArray = Drupal.behaviors.WaterLoopMap.OutQuality.filter( value => !Number.isNaN(value) );
        // const average = arr => arr.reduce((a,b) => a + b, 0) / arr.length;
        // // var globQuality = average(Drupal.behaviors.WaterLoopMap.OutQuality).toFixed(2);
        // var globQuality = average(newArray).toFixed(2);
        // // console.log(globQuality);

        // https://stackoverflow.com/questions/36038100/get-max-value-per-key-in-a-javascript-array
        var maxes = Drupal.behaviors.WaterLoopMap.OutQuality.reduce((m, e) => Object.assign(m, { [e.id]: e.id in m ? Math.max(m[e.id], e.val) : e.val }), {});
        // console.log(maxes);

        // https://stackoverflow.com/questions/126100/how-to-efficiently-count-the-number-of-keys-properties-of-an-object-in-javascrip
        var len = Object.keys(maxes).length;
        // console.log(len);

        // https://stackoverflow.com/questions/16449295/how-to-sum-the-values-of-a-javascript-object
        // const sumValues = obj => Object.values(obj).reduce((a, b) => a + b);
        // console.log(sumValues(maxes));
        var sum = Object.values(maxes).reduce((a, b) => a + b);
        // console.log(sum);

        // var globQuality = sumValues(maxes)/len;
        var globQuality = sum/len;

        var bg = Drupal.behaviors.WaterLoopMap.getBg(globQuality);
        $('#wqg > h4 > span').html(globQuality.toFixed(2)+'%');
        // remove previous classes && add new
        $('#wqg > div > div').removeClass().addClass('progress-bar '+bg);
        $('#wqg > div > div').css("width",globQuality+"%");

      }

      /**
      / Set percentage in progres bars calulating the applied technologies
      */
      Drupal.behaviors.WaterLoopMap.NewCardQuality = function () {

        $.each( Drupal.behaviors.WaterLoopMap.PercentageSpec, function( key, val) {
          var outQuality = val.val;
          if(outQuality >= 100) {
            outQuality = 100;
          }
          // Calculate Global water quality like the average of the single percentage
          // sum outQuality && divide for it's numerosity
          // fill a global var with outQuality values
          // Drupal.behaviors.WaterLoopMap.OutQuality.push(Number(outQuality));

          // console.log(outQuality);
          var bg = Drupal.behaviors.WaterLoopMap.getBg(outQuality)

          // var id = '#wq_'+opOut['op'];
          // Set new quality % foreach ObsPropOut
          $(val.id+' > h4 > span').html(outQuality.toFixed(2)+'%');
          // remove previous classes && add new
          $(val.id+' > div > div').removeClass().addClass('progress-bar '+bg);
          $(val.id+' > div > div').css("width",outQuality+"%");


        });

        $.each(Drupal.behaviors.WaterLoopMap.PercentageNoSpec, function( key, val ) {
          var value = val.val;
          if (value > 0){
            // The property has encresed
            console.log($(val.id));
            $(val.id+' > h4 > span').html('+ '+value.toFixed(2)+'%');
            // remove previous classes && add new
            // $(id+' > div > div.flex-row > div').removeClass().addClass('progress-bar '+bg);
            $(val.id+' > div > div.progress-sign-right > div').removeClass().addClass('progress-bar bg-primary');
            $(val.id+' > div > div.progress-sign-right > div').css("width",value+"%");
            // Clean left side
            $(val.id+' > div > div.progress-sign-left > div').removeClass().addClass('progress-bar');
            $(val.id+' > div > div.progress-sign-left > div').css("width", "0%");
            $(val.id).show();
          } else {
            // console.log('NEGATIVE');
            // The property has decresed
            $(val.id+' > h4 > span').html(value.toFixed(2)+'%');
            // remove previous classes && add new
            // $(id+' > div > div.flex-row-reverse > div').removeClass().addClass('progress-bar '+bg);
            console.log($(val.id+' > div > div.progress-sign-left'));
            $(val.id+' > div > div.progress-sign-left > div').removeClass().addClass('progress-bar bg-primary');
            $(val.id+' > div > div.progress-sign-left > div').css("width", -1*value+"%");
            // Clean right side
            $(val.id+' > div > div.progress-sign-right > div').removeClass().addClass('progress-bar');
            $(val.id+' > div > div.progress-sign-right > div').css("width","0%");

            $(val.id).show();
          }
        });
      }

      /**
      / Fill the Water loop status card  - Quality section
      */
      Drupal.behaviors.WaterLoopMap.WaterLoopCardQuality = function () {
        // Drupal.behaviors.WaterLoopMap.checkedTech is an array
        console.log('WaterLoopCardQuality');
        // console.log(Drupal.behaviors.WaterLoopMap.checkedTech);
        // console.log(Drupal.behaviors.WaterLoopMap.unchechedTech);
        // console.log(Drupal.behaviors.WaterLoopMap.techXanalysis);
        // if We have technologies selected let's calculate Quality considering the technologies
        if(Drupal.behaviors.WaterLoopMap.checkedTech.length !== 0){

          Drupal.behaviors.WaterLoopMap.OutQuality = [];
          // Drupal.behaviors.WaterLoopMap.unchechedTech = [];

          // Componiamo un array con i valori "selezionati per *** " da passere a
          // Drupal.behaviors.WaterLoopMap.OpsPropWaterQuality(value, obj)
          // OR
          // Drupal.behaviors.WaterLoopMap.OpsPropWaterQuality(value, null)
          Drupal.behaviors.WaterLoopMap.Spec = [];
          // Cycle on all the technologies
          $.each(Drupal.behaviors.WaterLoopMap.techXanalysis, function( techId, techObj ) {
            // If the technology is checked
            if ( Drupal.behaviors.WaterLoopMap.checkedTech.find(o => o['id'] === techId) !== undefined){
              // Get the technology specifications (json string to object)
              let specObj = JSON.parse(Drupal.behaviors.WaterLoopMap.techXanalysis[techId].spec);
              // Filter the specifications on the observed properties we have to break down
              $.each(Drupal.behaviors.WaterLoopMap.ObsPropOut, function( key, opObj ) {
                let opSpec = specObj.find(o => o['observed property'] === opObj['op']);
                // console.log(opSpec);
                if(typeof opSpec !== 'undefined'){
                  console.log(opSpec);
                  console.log(opObj);
                  // var test = Drupal.behaviors.WaterLoopMap.Spec.filter(o => o['observed property'] === opSpec['observed property']);
                  // find returns the first matching element and filter returns an array of all matching elements.

                  // Verify if we have inserted a specification for the observed property and set the one with highest performances
                  // Get the index of global Spec if the opSpec operate on the same element
                  var index = Drupal.behaviors.WaterLoopMap.Spec.findIndex(o => o['observed property'] === opSpec['observed property']);
                  // If we have an entry
                  if( index !== -1 ){
                      // Add some info to the global Spec
                      opSpec.techId = techId // From techXanalysis
                      var tbr = Drupal.behaviors.WaterLoopMap.checkedTech.find(o => o['id'] === techId);
                      opSpec.qty = tbr.qty;
                      Drupal.behaviors.WaterLoopMap.Spec[index]['technologies'].push(opSpec);
                  } else {
                    // The new opSpec is NEW add info and insert in global Spec
                    let additionalSpec = {'observed property': opSpec['observed property'],
                                          'technologies':[]}

                    opSpec.techId = techId
                    var tbr = Drupal.behaviors.WaterLoopMap.checkedTech.find(o => o['id'] === techId);
                    opSpec.qty = tbr.qty;
                    console.log(opSpec);
                    additionalSpec.technologies.push(opSpec);
                    // Drupal.behaviors.WaterLoopMap.Spec.push(opSpec);
                    Drupal.behaviors.WaterLoopMap.Spec.push(additionalSpec);
                  }
                }
              });
            }
          });

          console.log('EXTERNAL');
          console.log(Drupal.behaviors.WaterLoopMap.Spec);
          console.log("RESET");
          Drupal.behaviors.WaterLoopMap.PercentageSpec = [];
          Drupal.behaviors.WaterLoopMap.PercentageNoSpec = [];
          // Cycle again oneach Observed property out of limts
          $.each(Drupal.behaviors.WaterLoopMap.ObsPropOut, function( key, opObj ) {
                let specObj = Drupal.behaviors.WaterLoopMap.Spec.find(o => o['observed property'] === opObj['op']);
                // console.log(specObj);
                // Add information about technology quantity to the object
                if(typeof specObj !== 'undefined'){
                  Drupal.behaviors.WaterLoopMap.OpsPropWaterQuality(opObj, specObj)
                } else {
                  // TODO - ?????????????????????????
                  Drupal.behaviors.WaterLoopMap.OpsPropWaterQuality(opObj, null)
                  // Drupal.behaviors.WaterLoopMap.MultiTech.push(obj)
                }
          });

          Drupal.behaviors.WaterLoopMap.NewCardQuality();
          Drupal.behaviors.WaterLoopMap.GlobalWaterQuality();

        } else {
          // We don't ave technologies selected calculate the quality passing only opObj

          Drupal.behaviors.WaterLoopMap.OutQuality = [];
          console.log("RESET");
          Drupal.behaviors.WaterLoopMap.PercentageSpec = [];
          Drupal.behaviors.WaterLoopMap.PercentageNoSpec = [];
          // if we don't have technologies selected then return to the quality from observed properties out of limits
          $.each(Drupal.behaviors.WaterLoopMap.ObsPropOut, function( index, opObj ) {
            // console.log("FIRST QUALITY SET");
            Drupal.behaviors.WaterLoopMap.OpsPropWaterQuality(opObj, null)
          });
          Drupal.behaviors.WaterLoopMap.NewCardQuality();
          Drupal.behaviors.WaterLoopMap.GlobalWaterQuality();

        }

      }

      /**
      // Function to set waterloop status
      **/
      Drupal.behaviors.WaterLoopMap.setWaterLoopStatus = function() {
        console.log('Drupal.behaviors.WaterLoopMap.setWaterLoopStatus');
        // ABSOLUTELY leave here
        if (Drupal.behaviors.WaterLoopMap.selected.WR.length == 0){
          // reset the application field global if the WR are empty
          Drupal.behaviors.WaterLoopMap.AnalysisSpecGlob = {}
        }

        // If we have both Water Streams and Water demands let's proceed
        // to generate technology suggestions
        if (Drupal.behaviors.WaterLoopMap.selected.WS.length != 0 && Drupal.behaviors.WaterLoopMap.selected.WR.length != 0){
          // Compare WS -Anlisys- VS. WR -Analisys SPEC-
          // Keep in mind the WR -Analisys SPEC- is omogeneous (refer to the WR -Application field-) in case of multiple WR
          // Drupal.behaviors.WaterLoopMap.AnalysisSpecGlob
          /**
          / TODO - call the ajax2 only if Drupal.behaviors.WaterLoopMap.AnalysisSpecGlob is not empty
          */
          // if ($.isEmptyObject(Drupal.behaviors.WaterLoopMap.AnalysisSpecGlob)){
          //   //
          // }
          Promise.all([
                       Drupal.behaviors.WaterLoopMap.ajax1(Drupal.behaviors.WaterLoopMap.selected.WS),
                       Drupal.behaviors.WaterLoopMap.ajax2(Drupal.behaviors.WaterLoopMap.selected.WR[0].appf),
                       // Drupal.behaviors.WaterLoopMap.ajax3(wsSelected, wrSelected)
          ]).then(() => {
            console.log('WSAnalysis');
            console.log(Drupal.behaviors.WaterLoopMap.WSAnalysis)
            console.log('AnalysisSpecGlob');
            console.log(Drupal.behaviors.WaterLoopMap.AnalysisSpecGlob);
            $.each( Drupal.behaviors.WaterLoopMap.WSAnalysis, function( key, value ) {
              // Test if on known uom
              if (value['uom'] == 'ug/L' || value['uom'] == 'mg/L') {
                // Get the object in spec with the same data['observed property']
                let obj = Drupal.behaviors.WaterLoopMap.AnalysisSpecGlob.find(o => o['observed property'] === value['observed property']);

                if (obj !== undefined){
                  if (value.value){

                    // Create 2 math.js Unit object using the respective uom
                    const val = math.unit(value.value, value.uom);
                    const lim = math.unit(obj.limits.container.maxvalue, obj.uom);
                    // Get the value/number of the Unit respect to the spec limits uom
                    const valConverted = math.number(val, obj.uom);
                    const limNum = math.number(lim, obj.uom);
                    if (valConverted > limNum){
                      // $('.row-'+value['observed property']).addClass('btn-danger');
                      Drupal.behaviors.WaterLoopMap.ObsPropOut.push({"op":value['observed property'], "lim":limNum, "val":valConverted, "isSpec": true})
                    } else {
                      // Add other elements presents in anlysis
                      Drupal.behaviors.WaterLoopMap.ObsPropOut.push({"op":value['observed property'], "lim":undefined, "val":value.value, "isSpec": false})
                      // Drupal.behaviors.WaterLoopMap.ObsPropOut.push({"op":value['observed property'], "lim":value.value, "val":value.value})
                    }
                  }
                } else {
                  // Add other elements presents in anlysis
                  Drupal.behaviors.WaterLoopMap.ObsPropOut.push({"op":value['observed property'], "lim":undefined, "val":value.value, "isSpec": false})
                }
              } else {
                // For demo purpose only
                // Get the object in spec with the same data['observed property']
                let obj = Drupal.behaviors.WaterLoopMap.AnalysisSpecGlob.find(o => o['observed property'] === value['observed property']);
                if (obj !== undefined){
                  if (value.value > obj.limits.container.maxvalue){
                    // console.log(value['observed property'] +' limit reached');
                    // $('.row-'+value['observed property']).addClass('btn-danger');
                    Drupal.behaviors.WaterLoopMap.ObsPropOut.push({"op":value['observed property'], "lim":obj.limits.container.maxvalue, "val":value.value, "isSpec": true})
                  } else {
                    // Add other elements presents in anlysis
                    Drupal.behaviors.WaterLoopMap.ObsPropOut.push({"op":value['observed property'], "lim":undefined, "val":value.value, "isSpec": false})
                    // Drupal.behaviors.WaterLoopMap.ObsPropOut.push({"op":value['observed property'], "lim":value.value, "val":value.value})
                  }
                }
              }
            });

            console.log('Filled ObsPropOut');
            // TODO don't push only the out properties but all
            console.log(Drupal.behaviors.WaterLoopMap.ObsPropOut);
            // Now we have the observed properties out of limit
            console.log("Calling GetTechnologies");
            Drupal.behaviors.WaterLoopMap.GetTechnologies();

            console.log("Calling WaterLoopCard");
            Drupal.behaviors.WaterLoopMap.WaterLoopCard();
          }).catch((response) => {
            console.log('All Ajax done: some failed!')
          })

        } else { // we don't have both a WS and a WR
          // Remove the html in Water quality card id=wq
          $('#wq').html('');
          // remove the technologies from the table
          $('#edit-field-tp-ref > tbody').html('');
          // Remove the water demand
          $('#wd > h4 > span').html('');
          // $('#wd > div > div').addClass(bg);
          var classes = $('#wd > div > div').attr("class");
          $('#wd > div > div').removeClass(classes);
          $('#wd > div > div').addClass('progress-bar');
          $('#wd > div > div').css("width","0%");
          // remove distance
          $('#distance').html('');

          // Reset global Values
          Drupal.behaviors.WaterLoopMap.ObsPropOut = [];
          Drupal.behaviors.WaterLoopMap.checkedTech = [];
          if(Drupal.behaviors.WaterLoopMap.pathLine != null) {
            Drupal.behaviors.WaterLoopMap.map.removeLayer(Drupal.behaviors.WaterLoopMap.pathLine);
          }
        }
      };

      /**
      // Generic Function that return a Layer given a geoJson
      */
      Drupal.behaviors.WaterLoopMap.all = function(jsonObj){
        return L.geoJSON(jsonObj);
      };

      /**
      // Function to get layer of fetures filtered by mine property with icon
      // @markerType - The type of the marker it can be WS, WR, TP
      // @jsonObj - geojson object of features
      // @isMine - boolean property used to set bg color of the marker and to filter by ismine property
      // @tableId - the table element to attach the selection on dobleclick
      // @data = Drupal.behaviors.WaterLoopMap.taxonomyTerms
      **/

      Drupal.behaviors.WaterLoopMap.functionalMarker = function(markerType, jsonObj, isMine, tableId, data){

        // var bg = isMine ? 'bg-success' : 'bg-primary';
        return L.geoJson(jsonObj, {
           filter: function(feature, layer) {
               return feature.properties.ismine == isMine.toString();
           },
           pointToLayer: function(feature, latlng) {
              // console.log(feature);
              // console.log(feature.properties.application_field);
              // var tid = feature.properties.application_field
              var tid = data.filter(obj => {
                return obj.tid === feature.properties.application_field
              })
              // console.log(tid);
              var bg = tid[0].color;
              return L.marker(latlng, {
                   icon: Drupal.behaviors.WaterLoopIcons.getIcon(bg, markerType, tid[0].color)
               }).on({
                 'mouseover': function() {
                     this.bindPopup('<div class="text-center">'+
                                    '<h6><a href="/node/'+feature.properties.nid+'">'+feature.properties.title+'</a></h6>' +
                                    '<div>Flow: '+feature.properties.flow+' m3/d</div>'+
                                    '<div><button value="'+feature.properties.nid+'" class="btn btn-primary btn-sm popupselect">Select</button></div>'+
                                    '</div>').openPopup();
                 }
               });
           }
        });
      };

      Drupal.behaviors.WaterLoopMap.removeMarkerButtonManage = function (){
        // Add remove functionalities to fa-times button in table for selected Markers
        $(".remove-marker").click(function(event){
          event.preventDefault();
          // layer.feature.properties.selected = "true";
          // var tableId = (layer.feature.properties.type == "water_offer") ? "edit-field-ws-ref" : "edit-field-wr-ref";
          // var fill = (layer.feature.properties.type == "water_offer") ? "WS" : "WR";

          var myarr = $(this).attr('id').split("_");
          // console.log("technology id: "+myarr[1]);
          var checked = myarr[1];
          // console.log(checked);
          Drupal.behaviors.WaterLoopMap.map.eachLayer(function(layer) {
            // console.log(layer);
            if( layer instanceof L.Marker ) {
              // console.log('Markers');
              // console.log(layer);
              if ( (layer.hasOwnProperty('feature')) && (layer.feature.properties.nid == checked) ){
                layer.feature.properties.selected = "false";
                var tableId = (layer.feature.properties.type == "water_offer") ? "edit-field-ws-ref" : "edit-field-wr-ref";
                var fill = (layer.feature.properties.type == "water_offer") ? "WS" : "WR";

                Drupal.behaviors.WaterLoopMap.fillSelected(false, fill, layer.feature.properties.nid, layer.feature.properties.application_field);
                Drupal.behaviors.WaterLoopMap.setWaterLoopStatus();

              }
            }
          });
          // Get the parent table
          var table = $('tr#'+checked).parents("table:first")
          // console.log(table);
          // Remove the selected element from the table
          $('tr#'+checked).remove();
          // Add default element based on table id whith hidden input for validation
          // console.log(table.attr('id'))
          if (table.attr('id') == "edit-field-ws-ref") {
            table.children('tbody').append('<tr class="small" id="ws_empty"><td style="border: none;"><input type="hidden" id="ws_id" name="ws_id" value="0"><button class="btn btn-wl-disabled btn-block" disabled><span class="float-left" style="color:white;"><i class="fas fa-water"></i></span></button></td></tr>')
          } else {
            table.children('tbody').append('<tr class="small" id="wr_empty"><td style="border: none;"><input type="hidden" id="wr_id" name="wr_id" value="0"><button class="btn btn-wl-disabled btn-block" disabled><span class="float-left" style="color:white;"> <i class="fas fa-hand-holding-water"></i></span></button></td></tr>')
          }

        })
      }

      $("#selectmap").once().each(function() {
        console.log('selectmap ONCE - Entry point');

        /**
           API TEST
        */
                // var tws = [252,234];
                // var twr = [43,21,45]
                // $.ajax({
                //     type: 'POST',
                //     url: '/api/technologies',
                //     // data: {ws: ws, wr: wr},
                //     data: JSON.stringify({ws: tws, wr: twr}),
                //     // data: {ws: JSON.stringify(tws), wr: JSON.stringify(twr)},
                //     success: parseTechnologies,
                //     // complete: setGCjsonObject,
                // });
                //
                // function parseTechnologies (data, textStatus, jqXHR) {
                //   console.log(data);
                //   // Drupal.behaviors.WaterLoopMap.appFields = data;
                // }


                // Drupal.behaviors.WaterLoopMap.appFieldsCB();
                // console.log(Drupal.behaviors.WaterLoopMap.appFields);

        /**
        * Ajax call to get the application fields
        */

        $.ajax({
            type: 'GET',
            url: '/api/appfields',
            success: parseApplicationField,
            // complete: setGCjsonObject,
        });

        /**
        * Set the controller (Application fields legend) and
        * add the initial layers
        */

        function parseApplicationField (data, textStatus, jqXHR) {
          // console.log(data);
          // Drupal.behaviors.WaterLoopMap.appFields.setData() = return data;
          var appFieldLegend = L.control({ position: "bottomleft" });
          // legend.onAdd = function( Drupal.behaviors.WaterLoopMap.map ){
          appFieldLegend.onAdd = function( a_map ){
            var div = L.DomUtil.create("div", "legend p-2");
            div.innerHTML += "<h6>Category</h6>";
            div.innerHTML += '<div class="mb-2"><div class="text-light rounded-circle img-profile d-inline-block mr-2" style="font-size: 20px; padding:1px; background-color:#787878;">'+
                  '<i class="fas fa-water" data-fa-transform="right-3"></i>'+
                  '</div><span> Stream </span></div>';
            div.innerHTML += '<div class="mb-2"><div class="text-light img-profile d-inline-block mr-2" style="font-size: 20px; padding:1px; background-color:#787878;">'+
                  '<i class="fas fa-hand-holding-water" data-fa-transform="right-4"></i>'+
                  '</div><span> Demand </span></div>'
            div.innerHTML += "<h6>Application Fields</h6>";
            $.each(data, function( index, value ) {
              // console.log( value );
              div.innerHTML += '<div class="rounded-circle mr-2" style="height: 10px; width: 10px; display: inline-block; background: '+ value.color +';"></div><span>'+value.name+'</span><br>'
            });
            return div;
          }

          appFieldLegend.addTo(Drupal.behaviors.WaterLoopMap.map)

          // Set data
          Drupal.behaviors.WaterLoopMap.taxonomyTerms = data;
          // Add initial markers
          Drupal.behaviors.WaterLoopMap.mineWsM = Drupal.behaviors.WaterLoopMap.functionalMarker('WS', Drupal.behaviors.WaterLoopMap.allWSFeatures, true, 'edit-field-ws-ref', Drupal.behaviors.WaterLoopMap.taxonomyTerms);
          Drupal.behaviors.WaterLoopMap.mineWsM.addTo(Drupal.behaviors.WaterLoopMap.map);
          Drupal.behaviors.WaterLoopMap.othersWsM = Drupal.behaviors.WaterLoopMap.functionalMarker('WS', Drupal.behaviors.WaterLoopMap.allWSFeatures, false, 'edit-field-ws-ref', Drupal.behaviors.WaterLoopMap.taxonomyTerms);
          Drupal.behaviors.WaterLoopMap.othersWsM.addTo(Drupal.behaviors.WaterLoopMap.map);

          // Drupal.behaviors.WaterLoopMap.mineWrM = Drupal.behaviors.WaterLoopMap.functionalMarker('WR', Drupal.behaviors.WaterLoopMap.allWRFeatures, true, 'edit-field-wr-ref', Drupal.behaviors.WaterLoopMap.taxonomyTerms);
          // Drupal.behaviors.WaterLoopMap.mineWrM.addTo(Drupal.behaviors.WaterLoopMap.map);
          // Drupal.behaviors.WaterLoopMap.othersWrM = Drupal.behaviors.WaterLoopMap.functionalMarker('WR', Drupal.behaviors.WaterLoopMap.allWRFeatures, false, 'edit-field-wr-ref', Drupal.behaviors.WaterLoopMap.taxonomyTerms);
          // Drupal.behaviors.WaterLoopMap.othersWrM.addTo(Drupal.behaviors.WaterLoopMap.map);

          // EDIT - Fill the tables for Water Streams, Water Demands and Technologies
          if('wlElements' in settings){
            // console.log('EDIT');
            // console.log(settings.wlElements);

            var bounds = [];
            Drupal.behaviors.WaterLoopMap.insertMirrorMarkers();

            Drupal.behaviors.WaterLoopMap.map.eachLayer(function(layer) {
              if((layer instanceof L.Marker) && settings.wlElements.WS.includes(layer.feature.properties.nid) ) {
                    // console.log(layer);
                  // console.log(layer.feature.properties.nid);
                  layer.feature.properties.selected = "true";
                  var tableId = (layer.feature.properties.type == "water_offer") ? "edit-field-ws-ref" : "edit-field-wr-ref";
                  var fill = (layer.feature.properties.type == "water_offer") ? "WS" : "WR";

                  var tid = Drupal.behaviors.WaterLoopMap.taxonomyTerms.filter(obj => {
                    return obj.tid === layer.feature.properties.application_field
                  })

                  var table_icon = (layer.feature.properties.type == "water_offer") ? "fa-water" : "fa-hand-holding-water";
                  // Remove neutral button
                  $('#'+tableId+' > tbody > tr:last').remove();
                  // Add selected
                  $('#'+tableId+' > tbody').append('<tr id="'+layer.feature.properties.nid+'">'+
                                                   '<td style="border:none;">'+
                                                      '<div class="btn btn-block" style="background: '+tid[0].color+'; color:white; text-align:left;">'+
                                                      '<span class="float-left"><i class="fas '+table_icon+'"></i></span>'+
                                                      '<a class="ml-1" href="/node/'+layer.feature.properties.nid+'" style="color:white;">'+layer.feature.properties.title+'</a>'+
                                                      '<span class="float-right">'+
                                                      '<button id="remove_'+layer.feature.properties.nid+'" class="btn p-0 remove-marker" style="color:white;"><i class="fas fa-times"></i></button></span>'+
                                                      '</div></td></tr>');
                  var icon = Drupal.behaviors.WaterLoopIcons.getIcon(tid[0].color, fill, tid[0].color)
                  layer.setIcon(icon);
                  Drupal.behaviors.WaterLoopMap.fillSelected(true, 'WS', layer.feature.properties.nid, layer.feature.properties.application_field);
                  //
                  var latlng = layer.feature.geometry.coordinates.slice().reverse();
                  bounds.push(L.latLng(latlng))
              }
              if((layer instanceof L.Marker) && settings.wlElements.WR.includes(layer.feature.properties.nid) ) {
                layer.feature.properties.selected = "true";
                var tableId = (layer.feature.properties.type == "water_offer") ? "edit-field-ws-ref" : "edit-field-wr-ref";
                var fill = (layer.feature.properties.type == "water_offer") ? "WS" : "WR";

                var tid = Drupal.behaviors.WaterLoopMap.taxonomyTerms.filter(obj => {
                  return obj.tid === layer.feature.properties.application_field
                })

                var table_icon = (layer.feature.properties.type == "water_offer") ? "fa-water" : "fa-hand-holding-water";
                // Remove neutral button
                $('#'+tableId+' > tbody > tr:last').remove();
                // Add selected
                $('#'+tableId+' > tbody').append('<tr id="'+layer.feature.properties.nid+'">'+
                                                 '<td style="border:none;">'+
                                                    '<div class="btn btn-block" style="background: '+tid[0].color+'; color:white; text-align:left;">'+
                                                    '<span class="float-left"><i class="fas '+table_icon+'"></i></span>'+
                                                    '<a class="ml-1" href="/node/'+layer.feature.properties.nid+'" style="color:white;">'+layer.feature.properties.title+'</a>'+
                                                    '<span class="float-right">'+
                                                    '<button id="remove_'+layer.feature.properties.nid+'" class="btn p-0 remove-marker" style="color:white;"><i class="fas fa-times"></i></button></span>'+
                                                    '</div></td></tr>');
                var icon = Drupal.behaviors.WaterLoopIcons.getIcon(tid[0].color, fill, tid[0].color)
                layer.setIcon(icon);
                  Drupal.behaviors.WaterLoopMap.fillSelected(true, 'WR', layer.feature.properties.nid, layer.feature.properties.application_field);
                  //
                  var latlng = layer.feature.geometry.coordinates.slice().reverse();
                  bounds.push(L.latLng(latlng))
              }
            });

            // Drupal.behaviors.WaterLoopMap.map.fitBounds([[1,1],[2,2],[3,3]]);
            Drupal.behaviors.WaterLoopMap.map.fitBounds(bounds, {
                padding: [50, 50]
            });
            Drupal.behaviors.WaterLoopMap.removeMarkerButtonManage();
            Drupal.behaviors.WaterLoopMap.setWaterLoopStatus();

          }

          // Add click functionalities to popup Select buttons
          $(document).on('click', '.popupselect', function(event){
            event.preventDefault();
            console.log("button is clicked");
            console.log($(this).val());
            var nid = $(this).val();
            Drupal.behaviors.WaterLoopMap.map.eachLayer(function(layer) {
              // console.log(layer);
              if( layer instanceof L.Marker ) {
                // console.log('Markers');
                // console.log(layer);
                if ( (layer.hasOwnProperty('feature')) && (layer.feature.properties.nid == nid) ){
                  layer.feature.properties.selected = "true";
                  var tableId = (layer.feature.properties.type == "water_offer") ? "edit-field-ws-ref" : "edit-field-wr-ref";
                  var fill = (layer.feature.properties.type == "water_offer") ? "WS" : "WR";

                  var tid = Drupal.behaviors.WaterLoopMap.taxonomyTerms.filter(obj => {
                    return obj.tid === layer.feature.properties.application_field
                  })

                  var table_icon = (layer.feature.properties.type == "water_offer") ? "fa-water" : "fa-hand-holding-water";
                  // Remove neutral button
                  $('#'+tableId+' > tbody > tr:last').remove();
                  // Add selected
                  $('#'+tableId+' > tbody').append('<tr id="'+layer.feature.properties.nid+'">'+
                                                   '<td style="border:none;">'+
                                                      '<div class="btn btn-block" style="background: '+tid[0].color+'; color:white; text-align:left;">'+
                                                      '<span class="float-left"><i class="fas '+table_icon+'"></i></span>'+
                                                      '<a class="ml-1" href="/node/'+layer.feature.properties.nid+'" style="color:white;">'+layer.feature.properties.title+'</a>'+
                                                      '<span class="float-right">'+
                                                      '<button id="remove_'+layer.feature.properties.nid+'" class="btn p-0 remove-marker" style="color:white;"><i class="fas fa-times"></i></button></span>'+
                                                      '</div></td></tr>');

                  /**
                  / TODO La grandezza delle icone cambia se selected o no usa il terzo parametro per la size
                  */
                  var icon = Drupal.behaviors.WaterLoopIcons.getIcon(tid[0].color, fill, tid[0].color)
                  layer.setIcon(icon);
                  Drupal.behaviors.WaterLoopMap.fillSelected(true, fill, layer.feature.properties.nid, layer.feature.properties.application_field);


                  //
                  // var latlng = layer.feature.geometry.coordinates.slice().reverse();
                  // bounds.push(L.latLng(latlng))
                }
              }
            });
            Drupal.behaviors.WaterLoopMap.insertMirrorMarkers();
            Drupal.behaviors.WaterLoopMap.removeMarkerButtonManage();
            Drupal.behaviors.WaterLoopMap.setWaterLoopStatus();
          });
        }


        /**
          INITIALIZE THE MAP && add base layer
        */
        Drupal.behaviors.WaterLoopMap.map = L.map('selectmap');
        var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
           attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
         });
         // add the Base layer onto the map
         layer.addTo(Drupal.behaviors.WaterLoopMap.map);

         // Get geoJson Features separated in Water stream features and Water demands features
         Drupal.behaviors.WaterLoopMap.allWSFeatures = settings.geoJson.ws;
         Drupal.behaviors.WaterLoopMap.allWRFeatures = settings.geoJson.wr;
	       // console.log(Drupal.behaviors.WaterLoopMap.allWSFeatures);
	       // console.log(Drupal.behaviors.WaterLoopMap.allWRFeatures);

         // Set up Leaflet layers
         var allWSlayer = Drupal.behaviors.WaterLoopMap.all(Drupal.behaviors.WaterLoopMap.allWSFeatures);
         Drupal.behaviors.WaterLoopMap.WSBounds = allWSlayer.getBounds();

         var allWRlayer = Drupal.behaviors.WaterLoopMap.all(Drupal.behaviors.WaterLoopMap.allWRFeatures);
         Drupal.behaviors.WaterLoopMap.WRBounds = allWRlayer.getBounds();

         // Bounds for extension on double click
         Drupal.behaviors.WaterLoopMap.extendedBounds = Drupal.behaviors.WaterLoopMap.WRBounds.extend(Drupal.behaviors.WaterLoopMap.WSBounds);

         // var mineWR = Drupal.behaviors.WaterLoopMap.functionalMarker('WR', wrFeatures, true, 'edit-field-wr-ref');
         // var othersWR = Drupal.behaviors.WaterLoopMap.functionalMarker('WR', wrFeatures, false, 'edit-field-wr-ref');

        Drupal.behaviors.WaterLoopMap.map.fitBounds(Drupal.behaviors.WaterLoopMap.WSBounds, {
            padding: [50, 50]
        });

        // Filter water streams
        // $("#others").click(function() {
        //     Drupal.behaviors.WaterLoopMap.map.addLayer(Drupal.behaviors.WaterLoopMap.othersWsM)
        //     Drupal.behaviors.WaterLoopMap.map.removeLayer(Drupal.behaviors.WaterLoopMap.mineWsM)
        // });
        // $("#mine").click(function() {
        //     Drupal.behaviors.WaterLoopMap.map.addLayer(Drupal.behaviors.WaterLoopMap.mineWsM)
        //     Drupal.behaviors.WaterLoopMap.map.removeLayer(Drupal.behaviors.WaterLoopMap.othersWsM)
        // });
        // $("#all").click(function() {
        //     Drupal.behaviors.WaterLoopMap.map.addLayer(Drupal.behaviors.WaterLoopMap.mineWsM)
        //     Drupal.behaviors.WaterLoopMap.map.addLayer(Drupal.behaviors.WaterLoopMap.othersWsM)
        // });

        // Toggle buttons
        $('button').click(function() {
          $('button').not(this).removeClass('active'); // remove active from the others
          $(this).toggleClass('active'); // toggle current clicked element
        });

      });

    }
  };

})(jQuery);
