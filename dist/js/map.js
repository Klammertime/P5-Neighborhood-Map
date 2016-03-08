$(function() {
    var googleMap;
    var geocoder;
    var map;
    var infowindow;
    var prev_infowindow = false;


    // Location construction
    var Scene = function() {
        this.filmLocation = ko.observable();
        this.displayLocation = ko.observableArray();
        this.filmTitle = ko.observable();
        this.year = ko.observable();
        this.director = ko.observable();
        this.productionCompany = ko.observable();
        this.writer = ko.observable();
    };

    ko.bindingHandlers.googleMap = {
        init: function(element, valueAccessor) {
            var myLatLng = new google.maps.LatLng(37.77493, -122.419416);
            var mapOptions = {
                center: myLatLng,
                zoom: 12,
                disableDefaultUI: true,
                zoomControl: true,
                panControl: true,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                },
                scaleControl: true,
                streetViewControl: true,
                streetViewControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                },
                rotateControl: true,
                overviewMapControl: true,
                scrollwheel: false, // prevents mousing down from triggering zoom
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var initialCenter = mapOptions.center;
            var initialZoom = mapOptions.zoom;
            map = new google.maps.Map(element, mapOptions);

            addGoToInitialExtent(map, initialCenter, initialZoom);

            google.maps.event.addDomListener(map, 'idle', function() {
                center = map.getCenter();
            });

            // when right click, go back to initial center
            function addGoToInitialExtent(map, initialCenter, initialZoom) {
                google.maps.event.addListener(map, 'rightclick', function() {
                    map.setCenter(initialCenter);
                    map.setZoom(initialZoom);
                });
            }
        },
        update: function(element, valueAccessor, allBindings) {
            window.addEventListener('resize', (function() {
                map.setCenter(center);
            }), false);
            google.maps.event.addDomListener(map, 'click', function() {
                center = map.getCenter();
            });
        }
    };

    my.vm = function() {
        var scenes = ko.observableArray([]);
        var currentScenes = ko.observableArray([]); //put current selected film locs
        var selectedScenes = ko.observableArray([]);
        var favoritedScenes = ko.observableArray([]);
        var allTitles = ko.observableArray([]);
        var selectedFilm = ko.observableArray([]);
        var singleFilm = ko.observable();
        var newFilm = ko.observable(true);
        var markers = ko.observableArray([]);
        var filmInfoBox = ko.observableArray();

        var load = function() {
                $.each(my.filmData.data.Scenes, function(i, p) {
                    if (p.film_location !== undefined) { //TODO: Can also push SF, CA as
                        // film_location just to get it on list as having been taped
                        // in SF. Or not. Decide later.
                        console.log("p.film_location", p.film_location);
                        scenes.push(new Scene()
                            .filmLocation(p.film_location + ", San Francisco, CA")
                            .filmTitle(p.film_title)
                            .year(p.release_year)
                            .director(p.director)
                            .productionCompany(p.production_company)
                            .writer(p.writer)
                        );
                        allTitles.push(p.film_title);
                    }
                });
            },

            uniqueTitles = ko.computed(function() {
                return ko.utils.arrayGetDistinctValues(allTitles().sort());
            }),

            checkReset = function() {
                if (markers().length > 0) {
                    for (var j = 0; j < markers().length; j++) {
                        my.vm.markers()[j].marker.setMap(null);
                    }
                    my.vm.markers([]);
                }
            },

            loadFilmInfoBox = function(requestedFilm) {
                var theFilm = requestedFilm;
                var nytKey = '70f203863d9c8555f9b345f32ec442e8:10:59953537';
                var nyTimesMovieAPI = "http://api.nytimes.com/svc/movies/v2/reviews/search.json?query='" +
                    theFilm + "'&api-key=" + nytKey;

                $.ajax({
                    type: "GET",
                    url: nyTimesMovieAPI,
                    timeout: 2000,
                    beforeSend: function() {},
                    complete: function() {},
                    success: function(data) {
                        console.log("data", data);
                        $.each(data.results, function(i, item) {
                            var byline = item.byline;
                            console.log("byline", byline);
                            var headline = item.headline;
                            console.log("headline", headline);
                            var summaryShort = item.summary_short;
                            console.log("summaryShort", summaryShort);
                            var reviewURL = item.link.url;
                            console.log("item.link.url", item.link.url);

                            var pubDate = item.publication_date;
                            console.log("item.publication_date", item.publication_date);
                            var rating = item.mpaa_rating;
                            var trailerLinkType = item.related_urls[4].type;
                            var suggestedLinkText = item.related_urls[4].type
                            var trailerURL = item.related_urls[4].suggested_link_text;
                        })
                    },
                    fail: function(jqxhr, textStatus, error) {
                        console.log("New York Times Article Could Not Be Loaded: ", error);
                    }
                });

                filmInfoBox.push({
                    title: my.vm.currentScenes()[0].filmTitle(),
                    year: my.vm.currentScenes()[0].year(),
                    director: my.vm.currentScenes()[0].director(),
                    productionCompany: my.vm.currentScenes()[0].productionCompany(),
                    writer: my.vm.currentScenes()[0].writer()
                });
            },



            // The current item will be passed as the first parameter
            panToMarker = function(clickedLocation) {
                if (prev_infowindow) {
                    prev_infowindow.close();
                }

                prev_infowindow = clickedLocation.infowindow;
                map.panTo(clickedLocation.marker.getPosition());
                clickedLocation.infowindow.open(map, clickedLocation.marker);
            },

            codeAddress = function() {
                this.checkReset();
                var address;
                var geocoder = new google.maps.Geocoder();

                function masterGeocoder(myGeocodeOptions) {
                    geocoder.geocode(myGeocodeOptions, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            map.setCenter(results[0].geometry.location);
                            // results[0].formatted_address is actual address on marker
                            // TODO: the movie scenes are not getting mapped to the right loc
                            // on the map due to the poor formatting of the data from sfdata

                            var streetViewURL = 'https://maps.googleapis.com/maps/api/streetview?size=300x300&location=' +
                                results[0].geometry.location;
                            var streetViewImage = '<img class="streetView media-object" src="' + streetViewURL +
                                '&key=AIzaSyCPGiVjhVmpWaeyw_8Y7CCG8SbnPwwE2lE" alt="streetView">';

                            var contentString = '<div class="media"><div class="media-left"><a href="#">' +
                                streetViewImage + '</a></div><div class="media-body"><p class="media-heading">' +
                                results[0].formatted_address +
                                '</p><span class="glyphicon glyphicon-heart" aria-hidden="true"></span>' +
                                '<span class="glyphicon glyphicon-scale" aria-hidden="true" data-toggle="tooltip" data-placement="bottom" title="See how much the yellow man weighs, place him on the scale."></span></div></div>';

                            var infowindow = new google.maps.InfoWindow({
                                content: contentString
                            });

                            // this adds a marker to the map
                            var marker = new google.maps.Marker({
                                map: map,
                                position: results[0].geometry.location,
                                title: myGeocodeOptions.address, // intended address
                                animation: google.maps.Animation.DROP
                            });

                            marker.addListener('click', function() {
                                if (prev_infowindow) {
                                    prev_infowindow.close();
                                }

                                prev_infowindow = infowindow;
                                map.panTo(marker.getPosition());

                                infowindow.open(map, marker);
                            });

                            markers.push({ marker: marker, infowindow: infowindow });


                        } else {
                            console.log("Geocode was not successful for the following reason: " + status);
                        }
                    });
                }

                for (var i = 0; i < this.scenes().length; i++) {
                    if (singleFilm() == my.vm.scenes()[i].filmTitle()) {
                        address = my.vm.scenes()[i].filmLocation();
                        if (address !== 'undefined, San Francisco, CA') {
                            currentScenes.push(my.vm.scenes()[i]);
                            var geocodeOptions = {
                                address: address,
                                componentRestrictions: {
                                    country: 'US'
                                }
                            };

                            masterGeocoder(geocodeOptions);
                        }
                    }
                }
                this.loadFilmInfoBox(singleFilm());

            };

        return {
            scenes: scenes,
            selectedScenes: selectedScenes,
            load: load,
            uniqueTitles: uniqueTitles,
            allTitles: allTitles,
            selectedFilm: selectedFilm,
            singleFilm: singleFilm,
            newFilm: newFilm,
            codeAddress: codeAddress,
            currentScenes: currentScenes,
            markers: markers,
            checkReset: checkReset,
            loadFilmInfoBox: loadFilmInfoBox,
            panToMarker: panToMarker,
            filmInfoBox: filmInfoBox
        };
    }();

    my.vm.load();

    ko.applyBindings(my.vm);

});