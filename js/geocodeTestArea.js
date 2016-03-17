/* Because the Google Maps API is a bit of a beast, here
are my notes:


google.maps.Geocoder is an object. The method you use to
initiate an async request is Geocoder.geocode(), and you pass
in a GeocoderRequest object literal containing
the input terms and a callback method to execute upon receipt
of the response since it needs to make a call to an
external server it needs that callback method to execute upon
completion of the request. The callback processes the results.

the GeocoderRequest object literal contains the following fields:

{
  address: string, (required)
  location: LatLng, // don't have to supply, if you do, it does
  a reverse geocode and gives you address
  placeId: string, //  don't have to give this
  bounds: LatLngBounds, // optional: LatLngBounds, biases
  geocode results, influences them, does not restrict them
  put SF LatLngBounds here.
  componentRestrictions: GeocoderComponentRestrictions,
  region: string // not required and confusing, ignore
}

- callback passes two parameters to hold the results and
a status code, in that order.

GeocoderResult object is a single geocoding result while
the geocode request may return multiple result objects

results[]: {
  types[]: string, // bunch tags, such as 'locality' or 'political'
  formatted_address: string, // postal address
  address_components[]: {
    short_name: string,
    long_name: string,
    postcode_localities[]: string,
    types[]: string
  },
  partial_match: boolean, // indicates geocoder did not return an
  exact match for the original request though it was able to match part
  of it. may wish to examine original request for misspellings or
  incomplete address TODO: I need to use this and create a function
  if true since the addresses supplied were often bad
  place_id: string, // NICE! This is a unique identifier of a place
  which can be used w/ other Google APIs to get for instance, details
  of a local business, phone number, opening hourse, user reviews and more!!
  TODO: Integrate this isn't infowindows
  postcode_localities[]: string,

  geometry: {
    location: LatLng, // LatLng object, not a string
    location_type: GeocoderLocationType // NICE! supports additional
    data about location, such as:
      google.maps.GeocoderLocationType.ROOFTOP - indicates returned result
      reflects precide geocode
      google.maps.GeocoderLocationType.RANGE_INTERPOLATED - indicates
      returned result reflects approximation(usually on a road) between
      two precise points(such as intersections).Results generally returned
      when rooftop geocodes are unavailable for a street address.
      TODO: So I don't need to specifiy this? A lot of my addresses
      are intersections so this is good.
      google.maps.GeocoderLocationType.GEOMETRIC_CENTER - indicates that
      the returned result is the geometric center of a result such as a
      polyline (for example, a street) or polygon (region). (I don't need
      this right now).
      google.maps.GeocoderLocationType.APPROXIMATE - indicates that
      returned result is approximate TODO: this I might need.
    viewport: LatLngBounds,
    bounds: LatLngBounds
  },
  viewport: recc viewport for returned result
  bounds: NICE! optionally returned, stores the LatLngBounds which can
  fully contain the returned result. These bounds may not match the
  recc viewport, ex, in SF Farallon Islands technically part of the city
  but should not be returned in the viewport.
}

*/

function codeAddress() {
  var address = // how do i isolate each address?
  geocoder.geocode( { 'address': address}, function(results, status) {
    if(status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
      });
    } else {
      console.log("Geocode was not successful for the following reason: " + status);
    }
  });
}





 geocoder.geocode({address: filmLocation + "San Francisco, CA" }, function(results, status) {
              if (status === google.maps.GeocoderStatus.OK) {

                  map.setCenter(results[0].geometry.location);

                  var marker = new google.maps.Marker({
                      map: map,
                      position: results[0].geometry.location,
                      title: results[0].formatted_address,
                      animation: google.maps.Animation.DROP
                  });

                  var infowindow = new google.maps.InfoWindow({
                      content: '<div id="content"><p>' + results[0].formatted_address + '</p></div>',
                      disableAutoPan: false,
                      maxWidth: 300,
                  });

                  google.maps.event.addListener(marker, 'click', function() {
                      infowindow.open(map, marker);
                  });
                  // infoWindows.push(infowindow);
                } else {
                  alert('Geocode was not successful for the following reason: ' + status);
                }
            });
