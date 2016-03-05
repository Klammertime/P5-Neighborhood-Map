// shoppingDataService
// John Papa http://johnpapa.net
// Depends on scripts:
//                         ajaxservice.js
(function (my) {
    "use strict";
    my.shoppingDataService = {
        getSaleItems : function (callback) {
            my.ajaxService.ajaxGetJson("GetSaleItems", null, callback);
        },

        placeOrder: function (shoppingCart, callback) {
            my.ajaxService.ajaxPostJson("PlaceOrder", shoppingCart, callback);
        }
    };
}(my));



// AK version
(function (my) {
  "use strict";
  my.filmLocationService = {
    getFilmLocations : function(callback) {
        my.ajaxService.ajaxGetJson("films.json", null, callback);
    },
    // not doing anything right now
    saveFilmLocations: function(null, callback) {
        my.ajaxService.ajaxGetJson(null, null, callback);
    }
  };
}(my));