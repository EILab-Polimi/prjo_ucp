/**
 * @file
 * JavaScript for graph insertion.
 */

(function ($) {


  Drupal.behaviors.Notifications = {
    attach: function (context, settings) {

      // console.log('Notifications');
      $('#notify').once().click(function(){

        let uids = [];

        $('.prjo_notifications').each(function() {
          if($(this).attr('checked') == 'checked'){

            // <div class="d-none">{{ mail }}</div>
            // console.log($(this).parents('td').parents('tr'));
            var row = $(this).parents('td').parents('tr');
            // console.log($(this).parents('td').parents('tr').('td:first').text());
            // console.log($('td:first', row).text());
            // console.log($('td:first', row).children("div .d-none").text());
            // console.log($('td:first', row).find("div.d-none").html());

            // Get the class of the parent <td> that contain a class uid-#
            // This class is a STYLE SETTINGS configuration of the
            // Checkbox Notifications Flagger field
            // console.log($(this).parents('td').attr('class'));
            // Since we have multiple classes on the <td> split them by space
            // var classes = $(this).parents('td').attr('class').split(" ");
            // console.log(classes);
            //
            // $.each(classes, function( index, value ) {
            //   // alert( index + ": " + value );
            //   var sclass = value.split("-");
            //   if( sclass[0] == 'uid'){
            //     uids.push(sclass[1]);
            //   }
            // });

            // console.log($('td:first', row).find("span.d-none").text());
            console.log($('td:first', row).text());

            var uname = $('td:first', row).text();
            // uids.push($('td:first', row).find("span.d-none").html());
            uids.push($.trim(uname));
          }
        });

        if (uids.length > 0){
          console.log(uids);
          // Set unique array - this avoid multiple notifcations at same user/group
          var uniq = [...new Set(uids)];
          console.log(uniq);
          // alert("Email sent to selected users.");
          alert("sending  notifications to : "+uniq.join(", "));
        } else {
          alert("Select one or more users.");
        }

      });

      // Flip the checkbox checked attribute foreach CheckboxNotificationsFlagger
      // on click
      $('.prjo_notifications').once().click(function(){
        // console.log('Flipping');
        // Flip the checked attribute
        $(this).attr('checked', !$(this).attr('checked'));
      });

    }
  };

})(jQuery);
