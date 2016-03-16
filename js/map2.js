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
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP,
                style: 'SMALL'
            },
            panControl: true,
            mapTypeControl: false,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.TOP_RIGHT
            },
            scaleControl: true,
            streetViewControl: true,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.RIGHT_TOP
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


        google.maps.event.addListener(map, 'click', function() {
            center = map.getCenter();
        });
    }

    // Location construction
    var SceneFilmModel = Base.extend({
        constructor: function(director, studio, fullAddress, place, streetAddress, year, filmTitle, writer, favorite, actor1, actor2, actor3, funFact) {
            this.director = ko.observable(director);
            this.studio = ko.observable(studio);
            this.fullAddress = ko.observable(fullAddress);
            this.place = ko.observable(place);
            this.streetAddress = ko.observable(streetAddress);
            this.year = ko.observable(year);
            this.filmTitle = ko.observable(filmTitle);
            this.writer = ko.observable(writer);
            this.favorite = ko.observable(false);
            this.actor1 = ko.observable(actor1);
            this.actor2 = ko.observable(actor2);
            this.actor3 = ko.observable(actor3);
            this.funFact = ko.observable(funFact);
        }
    });

    my.vm = function() {
        var self = this;
        var scenes = ko.observableArray([]);
        var currentScenes = ko.observableArray([]); //put current selected film locs
        var favoritedScenes = ko.observableArray([]);
        var allTitles = ko.observableArray([]);
        var requestedFilm = ko.observable();
        var markers = ko.observableArray([]);
        var filmInfoBox = ko.observableArray([]);
        var movieDbData = ko.observableArray([]); //TODO: rename to something meaningful
        var posterImage = ko.observable();
        var trailerVideo = ko.observable();
        var trailerURL = ko.observable();
        var overview = ko.observable();
        var trailerHTML = ko.observable();
        var currentTitle = ko.observable();
        var currentYear = ko.observable();
        var currentDirector = ko.observable();
        var currentWriter = ko.observable();
        var currentActor1 = ko.observable();
        var currentActor2 = ko.observable();
        var currentActor3 = ko.observable();
        var currentStudio = ko.observable();
        var funFact = ko.observable();
        var nytCapsuleReview = ko.observable();
        var nytHeadline = ko.observable();
        var nytByline = ko.observable();
        var nytSummaryShort = ko.observable();
        var nytReviewURL = ko.observable();
        var nytTitle = ko.observable();

        // not using right now
        var films = ko.observableArray([]);

        var loadSceneFM = function() {
                function escapeRegExp(string) {
                    var regExp = /^.*?(?=\s\()/;
                    var matches = regExp.exec(string);
                    return matches ? matches[0] : undefined;
                }

                function escapeRegExp2(string) {
                    var regExp2 = /\(([^)]+)\)/;
                    var matches = regExp2.exec(string);
                    return matches ? matches[1] : undefined;
                }

                $.each(my.filmData.data.Scenes, function(i, s) { //s stands for 'scene'
                    if (s.film_location !== undefined) { // create more false conditions
                        scenes.push(new SceneFilmModel(s.director, s.production_company, s.film_location, escapeRegExp(s.film_location), escapeRegExp2(s.film_location), s.release_year, s.film_title, s.writer, false, s.actor_1, s.actor_2, s.actor_3, s.fun_facts));
                        allTitles.push(s.film_title);
                    }
                });
            },

            uniqueTitles = ko.computed(function() {
                return ko.utils.arrayGetDistinctValues(allTitles().sort());
            }),

            googleInit = function() {
                googleSuccess();
            },

            checkReset = function() {
                if (this.markers().length > 0) {
                    $.each(this.markers(), function(i, marker) {
                        marker.marker.setMap(null);
                    });
                    this.markers([]);
                }
            },

            // The current item will be passed as the first parameter
            panToMarker = function(clickedLocation) {
                // Makes it so when click on item in list of locations takes you to marker and opens infowindow
                if (prev_infowindow) {
                    prev_infowindow.close();
                }

                prev_infowindow = clickedLocation.infowindow;
                // Without this it still works but doesn't open the infowindow,
                // it goes to it and drops the marker
                map.panTo(clickedLocation.marker.getPosition());
                // Without this, it doesn't work
                clickedLocation.infowindow.open(map, clickedLocation.marker);
            },

            loadNYTData = function(chosenFilm) {
                var nytKey = '70f203863d9c8555f9b345f32ec442e8:10:59953537';
                var nyTimesMovieAPI = "http://api.nytimes.com/svc/movies/v2/reviews/search.json?query='" +
                    chosenFilm + "'&api-key=" + nytKey;
                my.vm.nytCapsuleReview(undefined);
                my.vm.nytTitle(undefined);

                $.ajax({
                    type: "GET",
                    url: nyTimesMovieAPI,
                    timeout: 2000,
                    dataType: "json",
                    beforeSend: function() {},
                    complete: function() {},
                    success: function(data) {
                        console.log("data from NYTimes", data);
                        if ((data.results[0].display_title).toLowerCase().trim() == chosenFilm.toLowerCase().trim() | 'the ' + (data.results[0].display_title).toLowerCase().trim() == chosenFilm.toLowerCase().trim()) {
                            my.vm.nytHeadline(data.results[0].headline);
                            my.vm.nytByline(data.results[0].byline);
                            my.vm.nytSummaryShort(data.results[0].summary_short);
                            my.vm.nytReviewURL(data.results[0].link.url);
                            my.vm.nytCapsuleReview(data.results[0].capsule_review);
                            my.vm.nytTitle(data.results[0].display_title);
                        }
                    },
                    fail: function(jqxhr, textStatus, error) {
                        console.log("New York Times Article Could Not Be Loaded: ", error);
                    }
                });
            },
            loadMovieDbData = function(encodedFilm) {
                theMovieDb.search.getMovie({ "query": encodedFilm },
                    (function(data) {
                        dbStore = JSON.parse(data);
                        my.vm.movieDbData(dbStore);
                        var posterPath = my.vm.movieDbData().results[0].poster_path;
                        var posterHTML = '<img class="poster img-responsive" src="https://image.tmdb.org/t/p/w370/' + posterPath + '" >';
                        var overview = my.vm.movieDbData().results[0].overview;
                        var filmID = my.vm.movieDbData().results[0].id;

                        theMovieDb.movies.getTrailers({ "id": filmID },
                            (function(data) {
                                var theTrailer = JSON.parse(data);
                                my.vm.trailerVideo(theTrailer);
                                if (my.vm.trailerVideo().youtube.length === 0) {
                                    my.vm.trailerVideo(undefined);
                                } else {
                                    var trailerIframe = '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" width="1280" height="720" src="https://www.youtube.com/embed/' +
                                        my.vm.trailerVideo().youtube[0].source + '?rel=0&amp;showinfo=0" allowfullscreen></iframe></div>';
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
            },

            masterGeocoder = function(myGeocodeOptions, place, geocoder) {
                var contentString;
                var marker;
                geocoder.geocode(myGeocodeOptions, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        map.setCenter(results[0].geometry.location);
                        var streetViewURL = 'https://maps.googleapis.com/maps/api/streetview?size=300x300&location=' +
                            results[0].geometry.location;
                        var streetViewImage = '<img class="streetView media-object" src="' + streetViewURL +
                            '&key=AIzaSyCPGiVjhVmpWaeyw_8Y7CCG8SbnPwwE2lE" alt="streetView">';

                        if (place) {
                            contentString = '<div class="media contentString"><div class="content-left"><a href="#">' +
                                streetViewImage + '</a></div><div class="content-body"><p class="content-heading">' + place +
                                '</p><p>' + results[0].formatted_address + '</p>' +
                                '<span class="glyphicon glyphicon-heart" aria-hidden="true"></span></div></div>';
                            marker = new google.maps.Marker({
                                map: map,
                                position: results[0].geometry.location,
                                title: place + ", " + myGeocodeOptions.address, // intended address
                                animation: google.maps.Animation.DROP
                            });

                        } else {
                            contentString = '<div class="media contentString"><div class="content-left"><a href="#">' +
                                streetViewImage + '</a></div><div class="content-body"><p>' +
                                results[0].formatted_address + '</p>' +
                                '<span class="glyphicon glyphicon-heart" aria-hidden="true"></span></div></div>';

                            marker = new google.maps.Marker({
                                map: map,
                                position: results[0].geometry.location,
                                title: myGeocodeOptions.address, // intended address
                                animation: google.maps.Animation.DROP
                            });
                        }

                        var infowindow = new google.maps.InfoWindow({
                            content: contentString
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
            },

            codeAddress = function() {
                var address;
                var place;
                this.checkReset();
                var filmEncoded = encodeURIComponent(requestedFilm());
                var geocoder = new google.maps.Geocoder();
                loadNYTData(requestedFilm());
                loadMovieDbData(filmEncoded);
                //TODO change to foreach
                for (var i = 0; i < my.vm.scenes().length; i++) {
                    if (requestedFilm() == my.vm.scenes()[i].filmTitle()) {
                        if (my.vm.scenes()[i].place()) {
                            address = my.vm.scenes()[i].streetAddress();
                            place = my.vm.scenes()[i].place();
                        } else {
                            address = my.vm.scenes()[i].fullAddress();
                            place = undefined;
                        }

                        currentScenes.push(my.vm.scenes()[i]);

                        var geocodeOptions = {
                            address: address + ', San Francisco, CA',
                            componentRestrictions: {
                                country: 'US'
                            }
                        };

                        masterGeocoder(geocodeOptions, place, geocoder);

                        my.vm.currentTitle(my.vm.scenes()[i].filmTitle());
                        my.vm.currentYear(my.vm.scenes()[i].year());
                        my.vm.currentDirector(my.vm.scenes()[i].director());
                        my.vm.currentWriter(my.vm.scenes()[i].writer());
                        my.vm.currentActor1(my.vm.scenes()[i].actor1());
                        my.vm.currentActor2(my.vm.scenes()[i].actor2());
                        my.vm.currentActor3(my.vm.scenes()[i].actor3());
                        my.vm.currentStudio(my.vm.scenes()[i].studio());
                        my.vm.funFact(my.vm.scenes()[i].funFact());
                    } // end of master if statement
                }
            };


        return {
            scenes: scenes,
            loadSceneFM: loadSceneFM,
            uniqueTitles: uniqueTitles,
            allTitles: allTitles,
            requestedFilm: requestedFilm,
            codeAddress: codeAddress,
            currentScenes: currentScenes,
            markers: markers,
            checkReset: checkReset,
            panToMarker: panToMarker,
            filmInfoBox: filmInfoBox,
            movieDbData: movieDbData,
            posterImage: posterImage,
            trailerVideo: trailerVideo,
            overview: overview,
            trailerHTML: trailerHTML,
            googleInit: googleInit,
            currentTitle: currentTitle,
            currentYear: currentYear,
            currentDirector: currentDirector,
            currentWriter: currentWriter,
            currentActor1: currentActor1,
            currentActor2: currentActor2,
            currentActor3: currentActor3,
            currentStudio: currentStudio,
            films: films,
            nytCapsuleReview: nytCapsuleReview,
            nytHeadline: nytHeadline,
            nytByline: nytByline,
            nytSummaryShort: nytSummaryShort,
            nytReviewURL: nytReviewURL,
            nytTitle: nytTitle,
            funFact: funFact
        };
    }();

    my.vm.loadSceneFM();
    ko.applyBindings(my.vm);

    ko.observable.fn.equalityComparer = function(a, b) {
        return a === b;
    };

});