/**
 * @file
 * Font-awesome icons for WaterLoopMap
 */

(function ($) {
  Drupal.behaviors.WaterLoopIcons = {
    attach: function (context, settings) {

      /**
      // Function that return a Leaflet icon
      // @bg - background color (bg-danger = mine, bg-primary = others, bg-info = selected)
      // @markerType - The type of the marker it can be WS, WR, TP
      **/

      Drupal.behaviors.WaterLoopIcons.getIcon = function(bg, markerType, color){
        // return L.geoJSON(jsonObj);
        // console.log(color);
        if (markerType == 'WS'){ // Water Stream marker
          return L.divIcon({
              html: '<div class="text-light rounded-circle img-profile" style="font-size: 20px; padding:1px; background-color:'+bg+'">'+
                    '<i class="fas fa-water" data-fa-transform="right-3"></i>'+
                    '</div>',
                    // '<span style="position: absolute; height: 100%; width: 20px; top: 0px; background-image: radial-gradient(circle at center, '+color+' 5px, transparent 5px); background-size: 20px 20px; background-position: top center, bottom center; background-repeat: no-repeat;">'+
                    // '</span>',
              iconSize: [20, 20],
              iconAnchor: [16, 31],
              popupAnchor: [0, -28],
              className: 'myDivIcon'
          });
        } else if (markerType == 'WR') { // Water demand marker
          return L.divIcon({
              html: '<div class="text-light img-profile" style="font-size: 20px; padding:1px; background-color:'+bg+'">'+
                    '<i class="fas fa-hand-holding-water" data-fa-transform="right-4"></i>'+
                    '</div>',
                    // '<span style="position: absolute; height: 100%; width: 20px; top: 0px; background-image: radial-gradient(circle at center, '+color+' 5px, transparent 5px); background-size: 20px 20px; background-position: top center, bottom center; background-repeat: no-repeat;">'+
                    // '</span>',
              iconSize: [20, 20],
              iconAnchor: [16, 31],
              popupAnchor: [0, -28],
              className: 'myDivIcon'
          });
        } else if (markerType == 'TP') { // Technology provider marker
          return L.divIcon({
              html: '<div class="'+bg+' text-light rounded-circle img-profile" style="font-size: 20px; padding:1px;">'+
                    '<i class="fas fa-cogs" data-fa-transform="right-4"></i>'+
                    '</div>',
                    // '<span style="position: absolute; height: 100%; width: 20px; top: 0px; background-image: radial-gradient(circle at center, '+color+' 5px, transparent 5px); background-size: 20px 20px; background-position: top center, bottom center; background-repeat: no-repeat;">'+
                    // '</span>',
              iconSize: [20, 20],
              iconAnchor: [16, 31],
              popupAnchor: [0, -28],
              className: 'myDivIcon'
          });
        } else { // Set a default icon for unknown markers
          return L.divIcon({
              html: '<div class="'+bg+' text-light rounded-circle img-profile" style="font-size: 20px; padding:1px;"><i class="fas fa-map-marker" data-fa-transform="right-4"></i></div>',
              iconSize: [20, 20],
              iconAnchor: [16, 31],
              popupAnchor: [0, -28],
              className: 'myDivIcon'
          });
        }
      };


    }
  };
})(jQuery);
