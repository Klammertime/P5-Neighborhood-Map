$(function() {
    var googleMap;
    var geocoder;
    var map;
    var infowindow;
    var prev_infowindow = false;

    function googleSuccess() {
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
        map = new google.maps.Map(document.getElementById('googleMap'), mapOptions);

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

        window.addEventListener('resize', (function() {
            map.setCenter(center);
        }), false);

        google.maps.event.addDomListener(map, 'click', function() {
            center = map.getCenter();
        });
    }

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


    my.vm = function() {
        var scenes = ko.observableArray([]);
        var currentScenes = ko.observableArray([]); //put current selected film locs
        var favoritedScenes = ko.observableArray([]);
        var allTitles = ko.observableArray([]);
        var requestedFilm = ko.observable();
        var markers = ko.observableArray([]);
        var filmInfoBox = ko.observableArray([]);
        var store = ko.observableArray([]);
        var posterImage = ko.observable();
        var trailerVideo = ko.observable();
        var trailerURL = ko.observable();
        var overview = ko.observable();
        var trailerHTML = ko.observable();
        var capsuleReview = ko.observable();

        var load = function() {
                $.each(my.filmData.data.Scenes, function(i, p) {
                    if (p.film_location !== undefined) { //TODO: Can also push SF, CA as
                        // film_location just to get it on list as having been taped
                        // in SF. Or not. Decide later.
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

            googleInit = function() {
                googleSuccess();
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

            /** Error handler is not called for cross-domain script and cross-domain JSONP requests.
             * We instead have to create a timeout function that is only called if success isn't
             * called, which is where the clearTimeout is located.
             */
            loadWiki = function() {

                var wikiRequestTimeout = setTimeout(function() {
                    console.log('WikiPedia Could Not Be Loaded');
                }, 8000);

                var wikiURL = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + city + '&format=json&callback=wikiCallback';
                //TODO: use this or take it out, could just include a link
                $.ajax({
                    url: wikiURL,
                    dataType: 'jsonp',
                    success: function(response) {
                        var articleList = response[1];
                        for (var i = 0; i < articleList.length; i++) {
                            articleStr = articleList[i];
                        }
                        clearTimeout(wikiRequestTimeout);
                    }
                });
            },

            loadFilmInfoBox = function(chosenFilm) {
                var nytByline;
                var nytHeadline;
                var nytSummaryShort;
                var nytReviewURL;
                var nytPubDate;
                var nytKey = '70f203863d9c8555f9b345f32ec442e8:10:59953537';
                var nyTimesMovieAPI = "http://api.nytimes.com/svc/movies/v2/reviews/search.json?query='" +
                    chosenFilm + "'&api-key=" + nytKey;
                my.vm.capsuleReview(undefined);

                $.ajax({
                    type: "GET",
                    url: nyTimesMovieAPI,
                    timeout: 2000,
                    dataType: "json",
                    beforeSend: function() {},
                    complete: function() {},
                    success: function(data) {
                        console.log("data", data);
                        nytHeadline = data.results[0].headline;
                        nytByline = data.results[0].byline;
                        nytSummaryShort = data.results[0].summary_short;
                        nytReviewURL = data.results[0].link.url;
                        nytPubDate = data.results[0].publication_date;
                        my.vm.capsuleReview(data.results[0].capsule_review);
                    },
                    fail: function(jqxhr, textStatus, error) {

                        console.log("New York Times Article Could Not Be Loaded: ", error);
                    }
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
                var address;
                this.checkReset();
                loadFilmInfoBox(requestedFilm());

                var filmEncoded = encodeURIComponent(requestedFilm());
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

                for (var i = 0; i < my.vm.scenes().length; i++) {
                    if (requestedFilm() == my.vm.scenes()[i].filmTitle()) {
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
                            filmInfoBox.removeAll();
                            filmInfoBox.push({ filmTitle: my.vm.scenes()[i].filmTitle() }, { year: my.vm.scenes()[i].year() }, { director: my.vm.scenes()[i].director() }, { productionCompany: my.vm.scenes()[i].productionCompany() }, { writer: my.vm.scenes()[i].writer() });

                        }
                    }
                }
                theMovieDb.search.getMovie({ "query": filmEncoded },
                    (function(data) {
                        //TODO: why do you save it as theStore, if keep, rename
                        theStore = JSON.parse(data);
                        my.vm.store(theStore);
                        var posterPath = my.vm.store().results[0].poster_path;
                        var posterHTML = '<img class="poster img-responsive" src="https://image.tmdb.org/t/p/w370/' + posterPath + '" >';
                        var overview = my.vm.store().results[0].overview;
                        var filmID = my.vm.store().results[0].id;

                        theMovieDb.movies.getTrailers({ "id": filmID },
                            (function(data) {
                                var theTrailer = JSON.parse(data);
                                my.vm.trailerVideo(theTrailer);
                                if (my.vm.trailerVideo().youtube.length === 0) {
                                    my.vm.trailerVideo(undefined);
                                } else {
                                    var trailerIframe = '<div class="embed-responsive embed-responsive-4by3"><iframe class="embed-responsive-item" width="560" height="315" src="https://www.youtube.com/embed/' +
                                        my.vm.trailerVideo().youtube[0].source + '?rel=0&amp;showinfo=0" frameborder="0" allowfullscreen></iframe></div>';
                                    my.vm.trailerHTML(trailerIframe);
                                }

                            }),
                            (function() {
                                console.log("you fail!");
                            }));

                        my.vm.posterImage(posterHTML);
                        my.vm.overview(overview);

                    }),
                    (function() {
                        console.log("you fail!");
                    }));
            };

        return {
            scenes: scenes,
            load: load,
            uniqueTitles: uniqueTitles,
            allTitles: allTitles,
            requestedFilm: requestedFilm,
            codeAddress: codeAddress,
            currentScenes: currentScenes,
            markers: markers,
            checkReset: checkReset,
            panToMarker: panToMarker,
            filmInfoBox: filmInfoBox,
            store: store,
            posterImage: posterImage,
            trailerVideo: trailerVideo,
            overview: overview,
            trailerHTML: trailerHTML,
            capsuleReview: capsuleReview,
            googleInit: googleInit
        };
    }();

    my.vm.load();

    ko.applyBindings(my.vm);

});