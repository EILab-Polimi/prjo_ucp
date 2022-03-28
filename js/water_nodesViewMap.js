/**
 * @file
 * JavaScript for MAP waterloop node CREATE.
 * - http://bl.ocks.org/zross/47760925fcb1643b4225
 * - https://github.com/lennardv2/Leaflet.awesome-markers
 */

(function ($) {


  Drupal.behaviors.WOMap = {
    attach: function (context, settings) {
      // console.log('WaterLoopViewMap');
      // console.log(settings.wlElements);
      // console.log(settings);

      Drupal.behaviors.WOMap.all = function(jsonObj){
        return L.geoJSON(jsonObj);
      };

      Drupal.behaviors.WOMap.iconizedMarker = function(markerType, jsonObj, data){
        // console.log(jsonObj);
        return L.geoJson(jsonObj, {
           pointToLayer: function(feature, latlng) {
              // console.log(feature)
              var tid = data.filter(obj => {
                return obj.tid === feature.properties.application_field
              })
              // console.log(tid);
               return L.marker(latlng, {
                   icon: Drupal.behaviors.WaterLoopIcons.getIcon(tid[0].color, markerType, tid[0].color)
               });
           }
        });
      };


      $("#map").once().each(function() {
        // console.log('selectmap ONCE - Entry point');
        // console.log(settings.mapElements);
        // console.log(settings.application_field.length);

        if (settings.point.length === 0){
          $("#map").html('No point settled. Please pick a point using the Edit tab.');
        } else if (settings.application_field.length === 0) {
          $("#map").html('No Application field selected. Please select an Application field using the Edit tab.');
        } else {

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
            // Drupal.behaviors.WOMap.appFields.setData() = return data;
            var appFieldLegend = L.control({ position: "bottomleft" });
            // legend.onAdd = function( Drupal.behaviors.WOMap.map ){
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

            appFieldLegend.addTo(Drupal.behaviors.WOMap.map)

            // // Set data
            Drupal.behaviors.WOMap.taxonomyTerms = data;
            // // Add initial markers

            Drupal.behaviors.WOMap.WsM = Drupal.behaviors.WOMap.iconizedMarker(settings.nodetype, Drupal.behaviors.WOMap.geojsonFeature, Drupal.behaviors.WOMap.taxonomyTerms);
            Drupal.behaviors.WOMap.WsM.addTo(Drupal.behaviors.WOMap.map);
          }


          /**
            INITIALIZE THE MAP && add base layer
          */
          Drupal.behaviors.WOMap.map = L.map('map');
          var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
             attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
           });
           // add the Base layer onto the map
           layer.addTo(Drupal.behaviors.WOMap.map);

           // Get geoJson Features
           // var wkt_geom = "POINT(34.0218531, -81.0707438)";
           // console.log(settings.point[0]['value']);

           var wkt_geom = settings.point[0]['value'];
           var wkt = new Wkt.Wkt();
           wkt.read(wkt_geom);

           console.log("settings.point");
           console.log(wkt);

           // Compose the feature
           Drupal.behaviors.WOMap.geojsonFeature = {'properties': {"application_field": settings.application_field[0]['target_id']}, "geometry": wkt.toJson(), "type": "Feature" };

           // // Add it to the map
           Drupal.behaviors.WOMap.map.setView([settings.point[0]['lat'], settings.point[0]['lon']], 13);
        }
      });

    }
  };

})(jQuery);
