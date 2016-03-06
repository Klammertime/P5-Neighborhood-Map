$(function() {
    var googleMap;
    var geocoder;
    var map;

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
                zoom: 13,
                disableDefaultUI: true,
                zoomControl: true,
                panControl: true,
                scaleControl: true,
                streetViewControl: true,
                rotateControl: true,
                overviewMapControl: true,
                scrollwheel: false , // prevents mousing down from triggering zoom
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

            function startButtonEvents () {
    document.getElementById('btnRoad' ).addEventListener('click', function(){
        map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
    });
    document.getElementById('btnSat' ).addEventListener('click', function(){
        map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
    });
    document.getElementById('btnHyb' ).addEventListener('click', function(){
        map.setMapTypeId(google.maps.MapTypeId.HYBRID);
    });
    document.getElementById('btnTer' ).addEventListener('click', function(){
        map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
    });
}

startButtonEvents();
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
        var markers = [];

        var load = function() {
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
            }),

            checkReset = function() {
                if (markers.length > 0) {
                    for (var j = 0; j < markers.length; j++) {
                        my.vm.markers[j].setMap(null);
                    }
                    my.vm.currentScenes([]);
                }
            },

            codeAddress = function() {
                this.checkReset();
                var address;
                var geocoder = new google.maps.Geocoder();
                var prev_infowindow = false;

                function masterGeocoder(geocodeOptions1) {
                    console.log("running");

                    geocoder.geocode(geocodeOptions1, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            map.setCenter(results[0].geometry.location);
                            var contentString = '<div id="content"><p>' +
                                results[0].formatted_address + '</p></div>';

                            var infowindow = new google.maps.InfoWindow({
                                content: contentString,
                                maxWidth: 400
                            });

                            // this adds a marker to the map
                            var marker = new google.maps.Marker({
                                map: map,
                                position: results[0].geometry.location,
                                title: results[0].formatted_address,
                                animation: google.maps.Animation.DROP
                            });


                            marker.addListener('click', function() {
                                if (prev_infowindow) {
                                    prev_infowindow.close();
                                }

                                prev_infowindow = infowindow;
                                infowindow.open(map, marker);
                            });

                            markers.push(marker);

                        } else {
                            console.log("Geocode was not successful for the following reason: " + status);
                        }
                    });
                }

                for (var i = 0; i < this.scenes().length; i++) {
                    if (singleFilm() == my.vm.scenes()[i].filmTitle()) {
                        address = my.vm.scenes()[i].filmLocation();
                        currentScenes.push(address);
                        var geocodeOptions = {
                            address: address,
                            componentRestrictions: {
                                country: 'US'
                            }
                        };
                        masterGeocoder(geocodeOptions);
                    }
                }
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
            checkReset: checkReset
        };
    }();

    my.vm.load();

    ko.applyBindings(my.vm);

});