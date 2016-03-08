// shoppingDataService
// John Papa http://johnpapa.net
// Depends on scripts:
//                         ajaxservice.js
(function (my) {
    "use strict";
    my.reviewDataService = {
        getReviewItems : function (callback) {
            my.ajaxService.ajaxGetJson("GetReviews", null, callback);
        },

        placeOrder: function (shoppingCart, callback) {
            my.ajaxService.ajaxPostJson("PlaceOrder", shoppingCart, callback);
        }
    };
}(my));

