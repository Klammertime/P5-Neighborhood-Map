(function() {

        window.onload = function() {
            var mc;
            // Creating an object literal containing the properties we want to pass to the map
            var options = {
                zoom: 0,
                maxZoom: 0,
                center: new google.maps.LatLng(52.40, -3.61),
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            // Creating the map
            var map = new google.maps.Map(document.getElementById('map'), options);

            // Creating a LatLngBounds object
            var bounds = new google.maps.LatLngBounds();

            // Creating an array that will contain the addresses
            var places = [];

            // Creating a variable that will hold the InfoWindow object
            var infowindow;
            mc = new MarkerClusterer(map);
            var popup_content = "[..redacted..]";

            var geocoder = new google.maps.Geocoder();

            var markers = [];

            // Adding a LatLng object for each city
            function geocodeAddress(i) {
                // check if localStorage is available (it is now available on most modern browsers)
                // http://html5tutorial.net/tutorials/working-with-html5-localstorage.html
                // NB: this *must* be improved to handle quota limits, age/freshness, etc
                if (localStorage && localStorage['address_' + i]) {
                    places[i] = JSON.parse(localStorage['address_' + i]);
                    addPlace(i);
                } else {
                    geocoder.geocode({ 'address': address[i] }, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            places[i] = results[0].geometry.location;
                            if (localStorage) {
                                // cache result locally on the browser, this will help reducing the number of requests
                                // to the google geocoder in case the user refreshes the page
                                // remember: the more he will refresh, the more he's likely to hit the limit
                                // (this is one case where refreshing or closing the browser does not work)
                                localStorage['address_' + i] = JSON.stringify(results[0].geometry.location);
                            }

                            addPlace(i);
                        } else {
                            console.log("Geocoding of address " + address[i] + " failed");
                        }
                    });
                }

                function addPlace(i) {
                    // Adding the markers
                    var marker = new google.maps.Marker({ position: places[i], map: map });
                    markers.push(marker);
                    mc.addMarker(marker);

                    // Creating the event listener. It now has access to the values of i and marker as they were during its creation
                    google.maps.event.addListener(marker, 'click', function() {
                        // Check to see if we already have an InfoWindow
                        if (!infowindow) {
                            infowindow = new google.maps.InfoWindow();
                        }

                        // Setting the content of the InfoWindow
                        infowindow.setContent(popup_content[i]);

                        // Tying the InfoWindow to the marker
                        infowindow.open(map, marker);
                    });

                    // Extending the bounds object with each LatLng
                    bounds.extend(places[i]);

                    // Adjusting the map to new bounding box
                    map.fitBounds(bounds);
                }

                function geocode() {
                    if (geoIndex < address.length) {
                        geocodeAddress(geoIndex);
                        ++geoIndex;
                    } else {
                        clearInterval(geoTimer);
                    }
                }
                var geoIndex = 0;
                var geoTimer = setInterval(geocode, 600); // 200 milliseconds (to try out)

                var markerCluster = new MarkerClusterer(map, markers);
            }
        };
    })();