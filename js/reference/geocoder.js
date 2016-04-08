

var geocoderProvider = 'google';
var httpAdapter = 'https';
var request = require('request');


// optional
var extra = {
    apiKey: 'AIzaSyA6BAH4eD8FNCPHsiElj_fZbtV8DLnfo1g', // for Mapquest, OpenCage, Google Premier
    formatter: null         // 'gpx', 'string', ...
};



var geocoder = require('node-geocoder')(geocoderProvider, httpAdapter);

// geocoder.geocode('29 champs elysée paris', function(err, res) {
//     console.log(res);
// });

geocoder.batchGeocode(['1600 Amphitheatre Parkway, Mountain View, CA'], function (results) {
    // Return an array of type {error: false, value: []}

    console.log(results);
});



// Using callback
// geocoder.geocode('29 champs elysée paris', function(err, res) {
//     console.log(res);
// });

// Or using Promise
// geocoder.geocode('29 champs elysée paris')
//     .then(function(res) {
//         console.log(res);
//     })
//     .catch(function(err) {
//         console.log(err);
//     });

// output :
// [{
//     latitude: 48.8698679,
//     longitude: 2.3072976,
//     country: 'France',
//     countryCode: 'FR',
//     city: 'Paris',
//     zipcode: '75008',
//     streetName: 'Champs-Élysées',
//     streetNumber: '29',
//     administrativeLevels:
//      { level1long: 'Île-de-France',
//        level1short: 'IDF',
//        level2long: 'Paris',
//        level2short: '75' }
// }]