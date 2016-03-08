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

