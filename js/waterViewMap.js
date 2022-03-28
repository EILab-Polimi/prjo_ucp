/**
 * @file
 * JavaScript for MAP waterloop node CREATE.
 * - http://bl.ocks.org/zross/47760925fcb1643b4225
 * - https://github.com/lennardv2/Leaflet.awesome-markers
 */

(function ($) {


  Drupal.behaviors.DashWaterMap = {
    attach: function (context, settings) {
      // console.log('WaterLoopViewMap');
      // console.log(settings.wlElements);
      // console.log(settings);

      Drupal.behaviors.DashWaterMap.all = function(jsonObj){
        return L.geoJSON(jsonObj);
      };

      Drupal.behaviors.DashWaterMap.iconizedMarker = function(markerType, jsonObj, data){
        // console.log(jsonObj);
        return L.geoJson(jsonObj, {
           pointToLayer: function(feature, latlng) {
              // console.log(feature);
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


      $("#map").once().each(function() {
        // console.log('selectmap ONCE - Entry point');
        // console.log(settings.mapElements);

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
          // Drupal.behaviors.DashWaterMap.appFields.setData() = return data;
          var appFieldLegend = L.control({ position: "bottomleft" });
          // legend.onAdd = function( Drupal.behaviors.DashWaterMap.map ){
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

          appFieldLegend.addTo(Drupal.behaviors.DashWaterMap.map)

          // Set data
          Drupal.behaviors.DashWaterMap.taxonomyTerms = data;
          // console.log(Drupal.behaviors.DashWaterMap.taxonomyTerms)
          // Add initial markers
          var markers = L.markerClusterGroup();
          Drupal.behaviors.DashWaterMap.WsM = Drupal.behaviors.DashWaterMap.iconizedMarker('WS', Drupal.behaviors.DashWaterMap.allWSFeatures, Drupal.behaviors.DashWaterMap.taxonomyTerms);
          markers.addLayer(Drupal.behaviors.DashWaterMap.WsM);
          // Drupal.behaviors.DashWaterMap.WsM.addTo(Drupal.behaviors.DashWaterMap.map);

          Drupal.behaviors.DashWaterMap.WrM = Drupal.behaviors.DashWaterMap.iconizedMarker('WR', Drupal.behaviors.DashWaterMap.allWRFeatures, Drupal.behaviors.DashWaterMap.taxonomyTerms);
          // Drupal.behaviors.DashWaterMap.WrM.addTo(Drupal.behaviors.DashWaterMap.map);
          markers.addLayer(Drupal.behaviors.DashWaterMap.WrM);

          markers.addTo(Drupal.behaviors.DashWaterMap.map);
        }


        /**
          INITIALIZE THE MAP && add base layer
        */
        Drupal.behaviors.DashWaterMap.map = L.map('map');
        var layer = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
           attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
         });
         // add the Base layer onto the map
         layer.addTo(Drupal.behaviors.DashWaterMap.map);

         // Get geoJson Features separated in Water stream features and Water demands features
         Drupal.behaviors.DashWaterMap.allWSFeatures = settings.mapElements.WS;
         Drupal.behaviors.DashWaterMap.allWRFeatures = settings.mapElements.WR;
         // console.log(Drupal.behaviors.DashWaterMap.allWSFeatures);
         // console.log(Drupal.behaviors.DashWaterMap.allWRFeatures);

         // Set up Leaflet layers
         var allWSlayer = Drupal.behaviors.DashWaterMap.all(Drupal.behaviors.DashWaterMap.allWSFeatures);
         Drupal.behaviors.DashWaterMap.WSBounds = allWSlayer.getBounds();

         var allWRlayer = Drupal.behaviors.DashWaterMap.all(Drupal.behaviors.DashWaterMap.allWRFeatures);
         Drupal.behaviors.DashWaterMap.WRBounds = allWRlayer.getBounds();

         // Bounds for extension
         Drupal.behaviors.DashWaterMap.extendedBounds = Drupal.behaviors.DashWaterMap.WRBounds.extend(Drupal.behaviors.DashWaterMap.WSBounds);

         // var mineWR = Drupal.behaviors.DashWaterMap.functionalMarker('WR', wrFeatures, true, 'edit-field-wr-ref');
         // var othersWR = Drupal.behaviors.DashWaterMap.functionalMarker('WR', wrFeatures, false, 'edit-field-wr-ref');

        Drupal.behaviors.DashWaterMap.map.fitBounds(Drupal.behaviors.DashWaterMap.extendedBounds, {
            padding: [50, 50]
        });

      });

    }
  };

})(jQuery);
