/**
 * @file
 * JavaScript for MAP waterloop node CREATE.
 * - http://bl.ocks.org/zross/47760925fcb1643b4225
 * - https://github.com/lennardv2/Leaflet.awesome-markers
 */

(function ($) {


  Drupal.behaviors.WaterLoopViewMap = {
    attach: function (context, settings) {
      // console.log('WaterLoopViewMap');
      // console.log(settings.wlElements);

      // Drupal.behaviors.WaterLoopViewMap.Ws = Drupal.behaviors.WaterLoopViewMap.Ws || {}
      Drupal.behaviors.WaterLoopViewMap.selected = Drupal.behaviors.WaterLoopViewMap.selected || { "WS":[] , "WR":[] };
      Drupal.behaviors.WaterLoopViewMap.ObsPropOut = Drupal.behaviors.WaterLoopViewMap.ObsPropOut || [];
      Drupal.behaviors.WaterLoopViewMap.OutQuality = Drupal.behaviors.WaterLoopViewMap.OutQuality || [];
      Drupal.behaviors.WaterLoopViewMap.PercentageSpec = Drupal.behaviors.WaterLoopViewMap.PercentageSpec || []
      Drupal.behaviors.WaterLoopViewMap.PercentageNoSpec = Drupal.behaviors.WaterLoopViewMap.PercentageNoSpec || []

      Drupal.behaviors.WaterLoopViewMap.all = function(jsonObj){
        return L.geoJSON(jsonObj);
      };

      /**
      / Get the analysis given the list of Water streams selected nids
      / @wsSelected - array of selected water stream in table
      */
      Drupal.behaviors.WaterLoopViewMap.ajax1 = function (wsSelected) {
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
          Drupal.behaviors.WaterLoopViewMap.WSAnalysis = obj;
        }
      }

      /**
      / Get analysis specifications given the list of application field term id
      / of Water request (TODO the application field can be a mix an array)
      / @appFieldTid - The application field term id
      */
      Drupal.behaviors.WaterLoopViewMap.ajax2 = function (appFieldTid) {
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
          Drupal.behaviors.WaterLoopViewMap.AnalysisSpecGlob = obj;
        }
      }

      Drupal.behaviors.WaterLoopViewMap.iconizedMarker = function(markerType, jsonObj, data){
        return L.geoJson(jsonObj, {
           pointToLayer: function(feature, latlng) {

              Drupal.behaviors.WaterLoopViewMap.selected[markerType].push({"nid": feature.properties.nid, "appf":feature.properties.application_field})

              var tid = data.filter(obj => {
                return obj.tid === feature.properties.application_field
              })
              // console.log(tid);
               return L.marker(latlng, {
                   icon: Drupal.behaviors.WaterLoopIcons.getIcon(tid[0].color, markerType, tid[0].color)
               }).on({
                 'mouseover': function() {
                     this.bindPopup('<h6><a href="/node/'+feature.properties.nid+'">'+feature.properties.title+'</a></h6>' +
                                    '<div>Flow: '+feature.properties.flow+' m3/d</div>').openPopup();
                 },
               });
           }
        });
      };

      /**
      / Fill the Water loop status card
      */
      Drupal.behaviors.WaterLoopViewMap.WaterLoopCard = function () {
        // console.log(Drupal.behaviors.WaterLoopViewMap.selected.WS);
        // console.log(Drupal.behaviors.WaterLoopViewMap.selected.WR);
        // get selected fetures from nids
        // ACTUALLY we works on 1! WS && 1! WR -> [0]
        var wsfeature = Drupal.behaviors.WaterLoopViewMap.allWSFeatures.features;
        var wrfeature = Drupal.behaviors.WaterLoopViewMap.allWRFeatures.features;
        console.log(wsfeature);
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
        // var pathLine = L.polyline([latlng1, latlng2], {color: 'red'}).addTo(Drupal.behaviors.WaterLoopViewMap.map)
        Drupal.behaviors.WaterLoopViewMap.pathLine = L.polyline([latlng1, latlng2], {color: 'red'});
        Drupal.behaviors.WaterLoopViewMap.pathLine.addTo(Drupal.behaviors.WaterLoopViewMap.map)
        // // zoom the map to the polyline
        // Drupal.behaviors.WaterLoopViewMap.map.fitBounds(Drupal.behaviors.WaterLoopViewMap.pathLine.getBounds());

        /**
        / Calculate % Flow
        */
        var wsflow = wsfeature[0].properties.flow;
        var wrflow = wrfeature[0].properties.flow;

        var flowPercentage = ((wsflow/wrflow)*100).toFixed(2);
        var bg = Drupal.behaviors.WaterLoopViewMap.getBg(flowPercentage)
        $('#wd > h4 > span').html(flowPercentage+' %');
        $('#wd > div > div').addClass(bg);
        $('#wd > div > div').css("width",flowPercentage+"%");

      }
      /**
      / Simple function to get back background color for progress bars
      / TODO  move in utility functions
      */
      Drupal.behaviors.WaterLoopViewMap.getBg = function (number) {
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

      // This function can be called with
      // @techOp object or null - that is the thechnology effluent and influent values
      //                          if null the quality is about the status and the anlysis specification limits
      // It resolve single elements qualities
      // Is called foreach property opOut
      Drupal.behaviors.WaterLoopViewMap.OpsPropWaterQuality = function(opOut, techOps){
        // console.log(opOut);
        // console.log(techOp);
        // If we have some technology who operate on Observed property
        if (techOps !== null && (typeof techOps !== "undefined")){
          // console.log('Drupal.behaviors.WaterLoopViewMap.Spec');
          // console.log(techOps.technologies);
          // console.log(opOut);
          $.each(techOps.technologies, function( techId, techOp ) {
            // console.log(techOp);
            // Get the effluent && influent variation given from technology
            var eff = (techOp.effluent.container.maxvalue == null) ? techOp.effluent.container.minvalue : techOp.effluent.container.maxvalue;
            var inf = (techOp.influent.container.maxvalue == null) ? techOp.influent.container.minvalue : techOp.influent.container.maxvalue;

            // console.log("Influent " + inf);
            // console.log("Effluent " + eff);


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


              var id = opOut['op'];
              var elem = {'id':id, 'val':outQuality}

              var found = Drupal.behaviors.WaterLoopViewMap.PercentageSpec.find(o => o['id'] === id);
              if (found === undefined){
                Drupal.behaviors.WaterLoopViewMap.PercentageSpec.push(elem)
              } else {
                // console.log(found);
                found.val = found.val + elem.val;
              }

              console.log(elem);
              // GlobalWaterQuality
              // Don't push elem elswhere the first element value with same id is the summ of all values
              if (outQuality >= 100) {
                Drupal.behaviors.WaterLoopViewMap.OutQuality.push({'id':id, 'val':100});
              }  else {
                Drupal.behaviors.WaterLoopViewMap.OutQuality.push({'id':id, 'val':outQuality});
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

              // var bg = Drupal.behaviors.WaterLoopViewMap.getBg(increasePerc)
              var id = opOut['op'];
              var elem = {'id':id, 'val':increasePerc*techOp.qty}

              var found = Drupal.behaviors.WaterLoopViewMap.PercentageNoSpec.find(o => o['id'] === id);
              if (found === undefined){
                Drupal.behaviors.WaterLoopViewMap.PercentageNoSpec.push(elem)
              } else {
                // console.log(found);
                found.val = found.val + elem.val;
              }

              // console.log(Drupal.behaviors.WaterLoopViewMap.PercentageNoSpec);

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
            Drupal.behaviors.WaterLoopViewMap.OutQuality.push(elem);

            // console.log(outQuality);
            var bg = Drupal.behaviors.WaterLoopViewMap.getBg(outQuality)

            var id = '#wq_'+opOut['op'];
            // Set new quality % foreach ObsPropOut
            $(id+' > h4 > span').html(outQuality.toFixed(2)+'%');
            // remove previous classes && add new
            $(id+' > div > div').removeClass().addClass('progress-bar '+bg);
            $(id+' > div > div').css("width",outQuality+"%");
          }
        }


      }

      /**
      // Function to set waterloop status
      **/
      Drupal.behaviors.WaterLoopViewMap.setWaterLoopStatus = function() {
          console.log(Drupal.behaviors.WaterLoopViewMap.selected);
          Promise.all([
                       Drupal.behaviors.WaterLoopViewMap.ajax1(Drupal.behaviors.WaterLoopViewMap.selected.WS),
                       Drupal.behaviors.WaterLoopViewMap.ajax2(Drupal.behaviors.WaterLoopViewMap.selected.WR[0].appf)
          ]).then(() => {
            // console.log('All Ajax done with success!')
            // console.log(Drupal.behaviors.WaterLoopViewMap.WSAnalysis);
            // console.log(Drupal.behaviors.WaterLoopViewMap.AnalysisSpecGlob);

            // ajax1 && ajax2 riempiono WSAnalysis && AnalysisSpecGlob
            // Nel each seguente riempiamo ObsPropOut con le observed properties che sono furi dai parametri
            // ObsPropOut contiene il limite ed il valore attuale
            $.each( Drupal.behaviors.WaterLoopViewMap.WSAnalysis, function( key, value ) {
              // Test if on known uom
              if (value['uom'] == 'ug/L' || value['uom'] == 'mg/L') {
                // Get the object in spec with the same data['observed property']
                let obj = Drupal.behaviors.WaterLoopViewMap.AnalysisSpecGlob.find(o => o['observed property'] === value['observed property']);
                // console.log(obj);

                if (obj !== undefined){
                  if (value.value){

                    // Create 2 math.js Unit object using the respective uom
                    const val = math.unit(value.value, value.uom);
                    const lim = math.unit(obj.limits.container.maxvalue, obj.uom);
                    // Get the value/number of the Unit respect to the spec limits uom
                    const valConverted = math.number(val, obj.uom);
                    const limNum = math.number(lim, obj.uom);
                    if (valConverted > limNum){
                      // console.log(value['observed property'] +' limit reached');
                      // $('.row-'+value['observed property']).addClass('btn-danger');
                      // Drupal.behaviors.WaterLoopViewMap.ObsPropOut.push({"op":value['observed property'], "lim":limNum, "val":valConverted})
                      Drupal.behaviors.WaterLoopViewMap.ObsPropOut.push({"op":value['observed property'], "lim":limNum, "val":valConverted, "isSpec": true})
                    } else {
                      Drupal.behaviors.WaterLoopViewMap.ObsPropOut.push({"op":value['observed property'], "lim":undefined, "val":value.value, "isSpec": false})
                    }
                  }
                } else {
                  Drupal.behaviors.WaterLoopViewMap.ObsPropOut.push({"op":value['observed property'], "lim":undefined, "val":value.value, "isSpec": false})
                }
              } else {
                // For demo purpose only
                // Get the object in spec with the same data['observed property']
                let obj = Drupal.behaviors.WaterLoopViewMap.AnalysisSpecGlob.find(o => o['observed property'] === value['observed property']);
                if (obj !== undefined){
                  if (value.value > obj.limits.container.maxvalue){
                    console.log(value['observed property'] +' limit reached');
                    // $('.row-'+value['observed property']).addClass('btn-danger');
                    Drupal.behaviors.WaterLoopViewMap.ObsPropOut.push({"op":value['observed property'], "lim":obj.limits.container.maxvalue, "val":value.value, "isSpec": true})
                  } else {
                    Drupal.behaviors.WaterLoopViewMap.ObsPropOut.push({"op":value['observed property'], "lim":undefined, "val":value.value, "isSpec": false})
                  }
                }
              }
            });

            // Now we have the observed properties out of limit
            // console.log("Calling GetTechnologies");
            // Drupal.behaviors.WaterLoopViewMap.GetTechnologies();

            console.log(Drupal.behaviors.WaterLoopViewMap.ObsPropOut);

            // technologies
            console.log(settings.wlElements.TP);
            Drupal.behaviors.WaterLoopViewMap.Spec = [];
            Drupal.behaviors.WaterLoopViewMap.OutQuality = [];
            $.each(settings.wlElements.TP, function( techId, techObj ) {
              // Get the technology specifications (json string to object)
              let specObj = JSON.parse(techObj.spec);
              // Filter the specifications on the observed properties we have to break down
              $.each(Drupal.behaviors.WaterLoopViewMap.ObsPropOut, function( key, opObj ) {



                let opSpec = specObj.find(o => o['observed property'] === opObj['op']);
                // console.log(opSpec);
                if(typeof opSpec !== 'undefined'){
                  // console.log(opSpec);
                  // console.log(opObj);
                  // var test = Drupal.behaviors.WaterLoopViewMap.Spec.filter(o => o['observed property'] === opSpec['observed property']);
                  // find returns the first matching element and filter returns an array of all matching elements.

                  // Verify if we have inserted a specification for the observed property and set the one with highest performances
                  // Get the index of global Spec if the opSpec operate on the same element
                  var index = Drupal.behaviors.WaterLoopViewMap.Spec.findIndex(o => o['observed property'] === opSpec['observed property']);
                  // console.log(index);
                  // If we have an entry
                  if( index !== -1 ){
                      // Add some info to the global Spec
                      opSpec.techId = techId // From TP
                      var tbr = settings.wlElements.TPQ.find(o => o['id'] === techId);
                      opSpec.qty = tbr.qty;
                      // Drupal.behaviors.WaterLoopViewMap.Spec[index] = opSpec;
                      Drupal.behaviors.WaterLoopViewMap.Spec[index]['technologies'].push(opSpec);
                  } else {
                    // The new opSpec is NEW add info and insert in global Spec
                    let additionalSpec = {'observed property': opSpec['observed property'],
                                          'technologies':[]}

                    // The new opSpec is NEW add info and insert in global Spec
                    opSpec.techId = techId
                    var tbr = settings.wlElements.TPQ.find(o => o['id'] === techId);
                    opSpec.qty = tbr.qty;
                    additionalSpec.technologies.push(opSpec);
                    Drupal.behaviors.WaterLoopViewMap.Spec.push(additionalSpec);

                  }
                  // console.log("EACH");
                  // console.log(Drupal.behaviors.WaterLoopViewMap.Spec);

                }
              });
            });

            // console.log(Drupal.behaviors.WaterLoopViewMap.Spec);
            // Cycle again oneach Observed property out of limts
            // console.log(Drupal.behaviors.WaterLoopViewMap.ObsPropOut);
            $.each(Drupal.behaviors.WaterLoopViewMap.ObsPropOut, function( key, opObj ) {

                  if(opObj.isSpec){
                    $('#wq').append(
                      '<div id="wq_'+opObj.op+'">'+
                      '<h4 class="small font-weight-bold">'+opObj.op+':&nbsp;<span class="float-right"></span></h4>'+
                      '<div class="progress progress-sm mb-3">'+
                        '<div class="progress-bar " aria-valuemin="0" aria-valuemax="100" style="width: 0%;"><span class="sr-only"></span></div>'+
                      '</div>'+
                      '</div>'
                    )
                  } else {
                    $('#wq_noSpec').append(
                      '<div id="wq_noSpec_'+opObj.op+'" style="display:none;">'+
                      '<h4 class="small font-weight-bold" style="margin-left: -0.75rem;">'+opObj.op+':&nbsp;<span class="float-right"></span></h4>'+
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

                  let specObj = Drupal.behaviors.WaterLoopViewMap.Spec.find(o => o['observed property'] === opObj['op']);
                  // console.log('----------------------------------------');
                  // console.log(specObj);
                  // Add information about technology quantity to the object
                  if(typeof specObj !== 'undefined'){
                    Drupal.behaviors.WaterLoopViewMap.OpsPropWaterQuality(opObj, specObj)
                  } else {
                    Drupal.behaviors.WaterLoopViewMap.OpsPropWaterQuality(opObj, null)
                  }
            });

            Drupal.behaviors.WaterLoopViewMap.NewCardQuality();
            Drupal.behaviors.WaterLoopViewMap.GlobalWaterQuality();
            // console.log("Calling WaterLoopCard");
            Drupal.behaviors.WaterLoopViewMap.WaterLoopCard();
          }).catch((response) => {
            console.log('All Ajax done: some failed!');
            console.log(response);
          })


      };

      /**
      / Set percentage in progres bars calulating the applied technologies
      */
      Drupal.behaviors.WaterLoopViewMap.NewCardQuality = function () {
        // console.log('Drupal.behaviors.WaterLoopViewMap.NewCardQuality');
        // console.log(Drupal.behaviors.WaterLoopViewMap.PercentageSpec);
        // console.log(Drupal.behaviors.WaterLoopViewMap.PercentageNoSpec);

        $.each( Drupal.behaviors.WaterLoopViewMap.PercentageSpec, function( key, val) {
          var outQuality = val.val;
          if(outQuality >= 100) {
            outQuality = 100;
          }
          // Calculate Global water quality like the average of the single percentage
          // sum outQuality && divide for it's numerosity
          // fill a global var with outQuality values
          // Drupal.behaviors.WaterLoopViewMap.OutQuality.push(Number(outQuality));

          // console.log(outQuality);
          var bg = Drupal.behaviors.WaterLoopViewMap.getBg(outQuality)
          // Set new quality % foreach ObsPropOut
          $('#wq_'+val.id+' > h4 > span').html(outQuality.toFixed(2)+'%');
          // remove previous classes && add new
          $('#wq_'+val.id+' > div > div').removeClass().addClass('progress-bar '+bg);
          $('#wq_'+val.id+' > div > div').css("width",outQuality+"%");

        });

        $.each(Drupal.behaviors.WaterLoopViewMap.PercentageNoSpec, function( key, val ) {
          var value = val.val;

          if (value > 0){
            // The property has encresed
            console.log($(val.id));
            $('#wq_noSpec_'+val.id+' > h4 > span').html('+ '+value.toFixed(2)+'%');
            // remove previous classes && add new
            // $(id+' > div > div.flex-row > div').removeClass().addClass('progress-bar '+bg);
            $('#wq_noSpec_'+val.id+' > div > div.progress-sign-right > div').removeClass().addClass('progress-bar bg-primary');
            $('#wq_noSpec_'+val.id+' > div > div.progress-sign-right > div').css("width",value+"%");
            $('#wq_noSpec_'+val.id).show();
          } else {
            // console.log('NEGATIVE');
            // The property has decresed
            $('#wq_noSpec_'+val.id+' > h4 > span').html(value.toFixed(2)+'%');
            // remove previous classes && add new
            // $(id+' > div > div.flex-row-reverse > div').removeClass().addClass('progress-bar '+bg);
            // console.log($('#wq_noSpec_'+val.id+' > div > div.progress-sign-left'));
            $('#wq_noSpec_'+val.id+' > div > div.progress-sign-left > div').removeClass().addClass('progress-bar bg-primary');
            $('#wq_noSpec_'+val.id+' > div > div.progress-sign-left > div').css("width", -1*value+"%");
            $('#wq_noSpec_'+val.id).show();
          }
        });

        // Display the Water Loop status card
        $('#wl_status').show();
        $('#wl_status_noSpec').show();

      }


      // Set global water quality
      Drupal.behaviors.WaterLoopViewMap.GlobalWaterQuality = function() {
        console.log('GlobalWaterQuality');
        console.log(Drupal.behaviors.WaterLoopViewMap.OutQuality);
        // Remove NaN values
        // const newArray = Drupal.behaviors.WaterLoopViewMap.OutQuality.filter( value => !Number.isNaN(value.val) );
        // console.log(newArray);
        // const average = arr => arr.reduce((a,b) => a + b, 0) / arr.length;
        // var globQuality = average(newArray).toFixed(2);
        // console.log(globQuality);
        // $.each(Drupal.behaviors.WaterLoopViewMap.OutQuality, function(key,val){
        //   console.log(val);
        //   // if(val.id)
        // });

        // https://stackoverflow.com/questions/36038100/get-max-value-per-key-in-a-javascript-array
        var maxes = Drupal.behaviors.WaterLoopViewMap.OutQuality.reduce((m, e) => Object.assign(m, { [e.id]: e.id in m ? Math.max(m[e.id], e.val) : e.val }), {});
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
        var bg = Drupal.behaviors.WaterLoopViewMap.getBg(globQuality);
        $('#wqg > h4 > span').html(globQuality.toFixed(2)+'%');
        // remove previous classes && add new
        $('#wqg > div > div').removeClass().addClass('progress-bar '+bg);
        $('#wqg > div > div').css("width",globQuality+"%");

      }

      $("#map").once().each(function() {
        // console.log('selectmap ONCE - Entry point');
        console.log(settings.wlElements);

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
          // Drupal.behaviors.WaterLoopViewMap.appFields.setData() = return data;
          var appFieldLegend = L.control({ position: "bottomleft" });
          // legend.onAdd = function( Drupal.behaviors.WaterLoopViewMap.map ){
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

          appFieldLegend.addTo(Drupal.behaviors.WaterLoopViewMap.map)

          // Set data
          Drupal.behaviors.WaterLoopViewMap.taxonomyTerms = data;
          // Add initial markers
          Drupal.behaviors.WaterLoopViewMap.WsM = Drupal.behaviors.WaterLoopViewMap.iconizedMarker('WS', Drupal.behaviors.WaterLoopViewMap.allWSFeatures, Drupal.behaviors.WaterLoopViewMap.taxonomyTerms);
          Drupal.behaviors.WaterLoopViewMap.WsM.addTo(Drupal.behaviors.WaterLoopViewMap.map);
          Drupal.behaviors.WaterLoopViewMap.WrM = Drupal.behaviors.WaterLoopViewMap.iconizedMarker('WR', Drupal.behaviors.WaterLoopViewMap.allWRFeatures, Drupal.behaviors.WaterLoopViewMap.taxonomyTerms);
          Drupal.behaviors.WaterLoopViewMap.WrM.addTo(Drupal.behaviors.WaterLoopViewMap.map);

          // Fill the tables for Water Streams, Water Demands and Technologies
          $.each(Drupal.behaviors.WaterLoopViewMap.allWSFeatures.features, function(index, feature){
            console.log(feature);
            // $('#edit-field-ws-ref > tbody:last-child').append('<tr class="small" id="'+feature.properties.nid+'"><td>'+feature.properties.author+'</td><td><a href="/node/'+feature.properties.nid+'">'+feature.properties.title+'</a></td><td><input type="checkbox" class="prjo_notifications float-right mt-1" id="group_'+feature.properties.uid+'"></td></tr>');
            var tid = Drupal.behaviors.WaterLoopViewMap.taxonomyTerms.filter(obj => {
              return obj.tid === feature.properties.application_field
            })
            $('#edit-field-ws-ref > tbody:last-child').append(
              '<tr id="'+feature.properties.nid+'">'+
                                               '<td style="border:none;">'+
                                                  '<div class="btn btn-block" style="background: '+tid[0].color+'; color:white; text-align:left;">'+
                                                  '<span class="float-left"><i class="fas fa-water"></i></span>'+
                                                  '<a class="ml-1" href="/node/'+feature.properties.nid+'" style="color:white;">'+feature.properties.title+'</a>'+
                                                  '<span class="float-right">'+
                                                  '</span>'+
                                                  '</div></td></tr>'
            )
          });
          $.each(Drupal.behaviors.WaterLoopViewMap.allWRFeatures.features, function(index, feature){
            console.log(feature)
            var tid = Drupal.behaviors.WaterLoopViewMap.taxonomyTerms.filter(obj => {
              return obj.tid === feature.properties.application_field
            })
            // $('#edit-field-wr-ref > tbody:last-child').append('<tr class="small" id="'+feature.properties.nid+'"><td>'+feature.properties.author+'</td><td><a href="/node/'+feature.properties.nid+'">'+feature.properties.title+'</a></td><td><input type="checkbox" class="prjo_notifications float-right mt-1" id="group_'+feature.properties.uid+'"></td></tr>');
            $('#edit-field-wr-ref > tbody:last-child').append(
              '<tr id="'+feature.properties.nid+'">'+
                                               '<td style="border:none;">'+
                                                  '<div class="btn btn-block" style="background: '+tid[0].color+'; color:white; text-align:left;">'+
                                                  '<span class="float-left"><i class="fas fa-hand-holding-water"></i></span>'+
                                                  '<a class="ml-1" href="/node/'+feature.properties.nid+'" style="color:white;">'+feature.properties.title+'</a>'+
                                                  '<span class="float-right">'+
                                                  '</span>'+
                                                  '</div></td></tr>'
            )
          });
          $.each(settings.wlElements.TP, function(index, value){

            console.log(settings.wlElements.TPQ);
            let obj = settings.wlElements.TPQ.find(obj => obj.id == index);
            console.log(obj);
            // $('#edit-field-tp-ref > tbody:last-child').append('<tr class="small" id="'+index+'"><td>'+value.author+'</td><td><a href="/node/'+index+'">'+value.title+'</a></td><td>'+obj.qty+'</td><td><input type="checkbox" class="prjo_notifications float-right mt-1" id="group_'+value.uid+'"></td></tr>');
            $('#edit-field-tp-ref > tbody:last-child').append('<tr id="'+index+'">'+
                                             '<td style="border:none;">'+
                                                '<div class="">'+
                                                '<a class="ml-1" href="/node/'+index+'" style="color:#787878;">'+value.title+'</a>'+
                                                '<span class="float-right">'+obj.qty+'</span>'+
                                                '</div></td></tr>');

          });


          Drupal.behaviors.WaterLoopViewMap.setWaterLoopStatus();

        }


        /**
          INITIALIZE THE MAP && add base layer
        */
        Drupal.behaviors.WaterLoopViewMap.map = L.map('map');
        var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
           attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
         });
         // add the Base layer onto the map
         layer.addTo(Drupal.behaviors.WaterLoopViewMap.map);

         // Get geoJson Features separated in Water stream features and Water demands features
         Drupal.behaviors.WaterLoopViewMap.allWSFeatures = settings.wlElements.WS;
         Drupal.behaviors.WaterLoopViewMap.allWRFeatures = settings.wlElements.WR;
	       // console.log(Drupal.behaviors.WaterLoopViewMap.allWSFeatures);
	       // console.log(Drupal.behaviors.WaterLoopViewMap.allWRFeatures);

         // // Fill the tables for Water Streams, Water Demands and Technologies
         // $.each(Drupal.behaviors.WaterLoopViewMap.allWSFeatures.features, function(index, feature){
         //   console.log(feature);
         //   // $('#edit-field-ws-ref > tbody:last-child').append('<tr class="small" id="'+feature.properties.nid+'"><td>'+feature.properties.author+'</td><td><a href="/node/'+feature.properties.nid+'">'+feature.properties.title+'</a></td><td><input type="checkbox" class="prjo_notifications float-right mt-1" id="group_'+feature.properties.uid+'"></td></tr>');
         //   var tid = Drupal.behaviors.WaterLoopViewMap.taxonomyTerms.filter(obj => {
         //     return obj.tid === feature.properties.application_field
         //   })
         //   $('#edit-field-ws-ref > tbody:last-child').append(
         //     '<tr id="'+feature.properties.nid+'">'+
         //                                      '<td style="border:none;">'+
         //                                         '<div class="btn btn-block" style="background: '+tid[0].color+'; color:white; text-align:left;">'+
         //                                         '<span class="float-left"><i class="fas '+table_icon+'"></i></span>'+
         //                                         '<a class="ml-1" href="/node/'+feature.properties.nid+'" style="color:white;">'+feature.properties.title+'</a>'+
         //                                         '<span class="float-right">'+
         //                                         '<button id="remove_'+feature.properties.nid+'" class="btn p-0 remove-marker" style="color:white;"><i class="fas fa-times"></i></button></span>'+
         //                                         '</div></td></tr>'
         //   )
         // });
         // $.each(Drupal.behaviors.WaterLoopViewMap.allWRFeatures.features, function(index, feature){
         //   $('#edit-field-wr-ref > tbody:last-child').append('<tr class="small" id="'+feature.properties.nid+'"><td>'+feature.properties.author+'</td><td><a href="/node/'+feature.properties.nid+'">'+feature.properties.title+'</a></td><td><input type="checkbox" class="prjo_notifications float-right mt-1" id="group_'+feature.properties.uid+'"></td></tr>');
         // });
         // $.each(settings.wlElements.TP, function(index, value){
         //
         //   console.log(settings.wlElements.TPQ);
         //   let obj = settings.wlElements.TPQ.find(obj => obj.id == index);
         //
         //   $('#edit-field-tp-ref > tbody:last-child').append('<tr class="small" id="'+index+'"><td>'+value.author+'</td><td><a href="/node/'+index+'">'+value.title+'</a></td><td>'+obj.qty+'</td><td><input type="checkbox" class="prjo_notifications float-right mt-1" id="group_'+value.uid+'"></td></tr>');
         // });


         // Set up Leaflet layers
         var allWSlayer = Drupal.behaviors.WaterLoopViewMap.all(Drupal.behaviors.WaterLoopViewMap.allWSFeatures);
         Drupal.behaviors.WaterLoopViewMap.WSBounds = allWSlayer.getBounds();

         var allWRlayer = Drupal.behaviors.WaterLoopViewMap.all(Drupal.behaviors.WaterLoopViewMap.allWRFeatures);
         Drupal.behaviors.WaterLoopViewMap.WRBounds = allWRlayer.getBounds();

         // Bounds for extension
         Drupal.behaviors.WaterLoopViewMap.extendedBounds = Drupal.behaviors.WaterLoopViewMap.WRBounds.extend(Drupal.behaviors.WaterLoopViewMap.WSBounds);

         // var mineWR = Drupal.behaviors.WaterLoopViewMap.functionalMarker('WR', wrFeatures, true, 'edit-field-wr-ref');
         // var othersWR = Drupal.behaviors.WaterLoopViewMap.functionalMarker('WR', wrFeatures, false, 'edit-field-wr-ref');

        Drupal.behaviors.WaterLoopViewMap.map.fitBounds(Drupal.behaviors.WaterLoopViewMap.extendedBounds, {
            padding: [50, 50]
        });

        // Drupal.behaviors.WaterLoopViewMap.setWaterLoopStatus();
      });

    }
  };

})(jQuery);
