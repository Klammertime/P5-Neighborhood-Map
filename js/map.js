$(function() {
    var googleMap,
        geocoder,
        map,
        marker;

    // Location construction
    var Scene = function() {
        this.filmLocation = ko.observable();
        this.filmTitle = ko.observable();
        this.year = ko.observable();
        this.director = ko.observable();
        this.productionCompany = ko.observable();
        this.writer = ko.observable();
        this.latLng = null;
        this.latLng = null;
        this.description = null;
        this.wikipedia = null;
        this.flickr = null;
        this.nyTimes = null;
        this.review = null;
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
                scaleControl: true,
                streetViewControl: true,
                rotateControl: true,
                overviewMapControl: true,
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
        var metadata = {},
            scenes = ko.observableArray([]),
            currentScenes = ko.observableArray([]), //put current selected film locs
            selectedScenes = ko.observableArray([]),
            favoritedScenes = ko.observableArray([]),
            allTitles = ko.observableArray([]),
            selectedFilm = ko.observableArray([]),
            singleFilm = ko.observable('180'),
            newFilm = ko.observable(true),
            markers = ko.observableArray([]),

            load = function() {
                $.each(my.filmData.data.Scenes, function(i, p) {
                    scenes.push(new Scene()
                        .filmLocation(p.film_location + ", San Francisco, CA")
                        .filmTitle(p.film_title)
                        .year(p.release_year)
                        .director(p.director)
                        .productionCompany(p.production_company)
                        .writer(p.writer)
                    );
                    allTitles.push(p.film_title);
                });
            },
            uniqueTitles = ko.computed(function() {
                return ko.utils.arrayGetDistinctValues(allTitles().sort());
            });

        function codeAddress() {
            var address;
            geocoder = new google.maps.Geocoder();

            for (var i = 0; i < this.scenes().length; i++) {
                if (singleFilm()[0] == my.vm.scenes()[i].filmTitle()) {
                    address = my.vm.scenes()[i].filmLocation();
                    currentScenes.push(address);
                    //TODO: Don't make functions within a loop.
                    var geocodeOptions = {
                        address: address,
                        componentRestrictions: {
                           country: 'US'
                        }
                    };
                    geocoder.geocode(geocodeOptions, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            map.setCenter(results[0].geometry.location);
                            marker = new google.maps.Marker({
                                map: map,
                                position: results[0].geometry.location,
                                title: results[0].formatted_address,
                                animation: google.maps.Animation.DROP
                            });

                            markers.push(marker);
                            var infowindow = new google.maps.InfoWindow({
                                content: '<div id="content"><p>' + results[0].formatted_address + '</p></div>',
                                disableAutoPan: false,
                                maxWidth: 300,
                                position: results[0].geometry.location
                                //TODO: all markers are ending up in the same spot
                            });

                            google.maps.event.addListener(marker, 'click', function() {
                                infowindow.open(map, marker);
                            });

                        } else {
                            console.log("Geocode was not successful for the following reason: " + status);
                        }
                    });
                }
            }
        }

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
            markers: markers
        };
    }();

    my.vm.load();
    ko.applyBindings(my.vm);

});