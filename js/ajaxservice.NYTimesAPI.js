// ajaxService
// John Papa http://johnpapa.net
// Depends on scripts:
//                         jQuery
(function (my) {
    "use strict";
    var nyTimesMovieAPI = 'http://api.nytimes.com/svc/movies/v2/reviews/search.json?query=Godzilla&page=2&sort=oldest&api-key=70f203863d9c8555f9b345f32ec442e8:10:59953537';
    var baseURI = 'http://api.nytimes.com/svc/movies/v2/reviews';
    var nyTimesKey = '70f203863d9c8555f9b345f32ec442e8:10:59953537';
    var serviceBase = baseURI + '/search.json?query=' + filmName + '&page=2&sort=oldest&api-key=' + nyTimesKey;
        getSvcUrl = function (method) { return serviceBase + method; };

    my.ajaxService = (function () {
        var ajaxGetJson = function (method, jsonIn, callback) {
            $.ajax({
                url: getSvcUrl(method),
                type: "GET",
                data: ko.toJSON(jsonIn),
                dataType: "json",
                contentType: "json",
                success: function (json) {
                    callback(json);
                }
            });
        },
            ajaxPostJson = function (method, jsonIn, callback) {
                $.ajax({
                    url: getSvcUrl(method),
                    type: "POST",
                    data: ko.toJSON(jsonIn),
                    dataType: "json",
                    contentType: "application/json",
                    success: function (json) {
                        callback(json);
                    }
                });
            };
        return {
            ajaxGetJson: ajaxGetJson,
            ajaxPostJson: ajaxPostJson
        };
    })();
} (my));


