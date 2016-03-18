$(function() {
    'use strict';
    var geocoder;
    var map;
    var infowindow;
    var prev_infowindow = false;


    function googleSuccess() {
        var center;
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
        var movieDbData = ko.observableArray([]);
        var posterImage = ko.observable();
        var trailerVideo = ko.observable();
        var trailerURL = ko.observable();
        var overview = ko.observable();
        var tagline = ko.observable();
        var trailerHTML = ko.observable();
        var currentTitle = ko.observable();
        var currentYear = ko.observable();
        var currentDirector = ko.observable();
        var currentWriter = ko.observable();
        var currentActor1 = ko.observable();
        var currentActor2 = ko.observable();
        var currentActor3 = ko.observable();
        var currentStudio = ko.observable();
        var nytCapsuleReview = ko.observable();
        var nytHeadline = ko.observable();
        var nytByline = ko.observable();
        var nytReviewURL = ko.observable();
        var nytSummary = ko.observable();

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
                    //'this' is the window

                nytCapsuleReview(undefined);
                nytSummary(undefined);
                nytReviewURL(undefined);
                nytByline(undefined);
                nytHeadline(undefined);
                //movies.nytimes.com was not loading, copying their url structure instead
                function fasterReviewUrl(fullUrl) {
                    var urlString = fullUrl;
                    var myRegexp = /\.(.*)$/; // get everything after first period
                    var match = myRegexp.exec(urlString);
                    var urlResult = 'http://www.' + match[1]; //it works just not while on local server
                    return urlResult;
                }

                $.ajax({
                    type: "GET",
                    url: nyTimesMovieAPI,
                    timeout: 2000,
                    dataType: "json",
                    beforeSend: function() {},
                    complete: function() {},
                    success: function(data) {
                        console.log("data from NYTimes", data);
                        if ((data.results[0].display_title).toLowerCase().trim() == chosenFilm.toLowerCase().trim() || ('the ' + (data.results[0].display_title).toLowerCase().trim()) == chosenFilm.toLowerCase().trim()) {
                            nytReviewURL(fasterReviewUrl(data.results[0].link.url));
                            nytByline(data.results[0].byline); // byline also wrote capsule_review
                            if (data.results[0].capsule_review) {
                                // capsule_review is for the movies they don't write a full review for
                                nytCapsuleReview(data.results[0].capsule_review);
                            } else if (data.results[0].summary_short) {
                                // headline goes with summary_short
                                nytSummary(data.results[0].summary_short);
                            } else if (data.results[0].headline) {
                                nytSummary(data.results[0].headline);
                            }

                        }
                    },
                    fail: function(jqxhr, textStatus, error) {
                        console.log("New York Times Article Could Not Be Loaded: ", error);
                    }
                });
            },
            loadMovieDbData = function(encodedFilm) {

                // TODO: set one up for TV, example: 'Looking' is a tv show about gay men but this is turning
                // up this: Dreams, memories and hallucinations unleash a past that Cecilia had left behind.
                // Def. not the same. THe Bridge is tv too.
                theMovieDb.search.getMovie({ "query": encodedFilm },
                    (function(data) {
                        var dbStore = JSON.parse(data);
                        movieDbData(dbStore);
                        //'this' is window
                        var posterPath = movieDbData().results[0].poster_path;
                        var posterHTML = '<img class="poster img-responsive" src="https://image.tmdb.org/t/p/w370/' + posterPath + '" >';
                        var overview = movieDbData().results[0].overview;
                        var filmID = movieDbData().results[0].id;

                        theMovieDb.movies.getTrailers({ "id": filmID },
                            (function(data) {
                                var theTrailer = JSON.parse(data);
                                my.vm.trailerVideo(theTrailer);
                                if (trailerVideo().youtube.length === 0) {
                                    trailerVideo(undefined);
                                } else {
                                    var trailerIframe = '<div class="embed-responsive embed-responsive-16by9"><iframe class="embed-responsive-item" width="1280" height="720" src="https://www.youtube.com/embed/' +
                                        trailerVideo().youtube[0].source + '?rel=0&amp;showinfo=0" allowfullscreen></iframe></div>';
                                    trailerHTML(trailerIframe);
                                }
                            }),
                            (function() {
                                console.log("you fail!");
                            }));
                        theMovieDb.movies.getById({ "id": filmID },
                            (function(data) {
                                var movieInfo = JSON.parse(data);
                                var tagline = movieInfo.tagline;
                                my.vm.tagline(tagline);
                                console.log("self", self);
                            }),
                            (function() {
                                console.log("you fail!");
                            }));
                        // 'this' in this context is the window
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
                var matchedScene;
                var matchedTitle;
                this.checkReset();

                //TODO change to foreach
                for (var i = 0; i < this.scenes().length; i++) {
                    if (requestedFilm().toLowerCase().trim() === this.scenes()[i].filmTitle().toLowerCase().trim()) {
                        matchedScene = this.scenes()[i];
                        matchedTitle = this.scenes()[i].filmTitle();
                        var geocoder = new google.maps.Geocoder();

                        if (this.scenes()[i].place()) {

                            address = this.scenes()[i].streetAddress();
                            place = this.scenes()[i].place();
                        } else {
                            address = this.scenes()[i].fullAddress();
                            place = undefined;
                        }

                        currentScenes.push(this.scenes()[i]);

                        var geocodeOptions = {
                            address: address + ', San Francisco, CA',
                            componentRestrictions: {
                                country: 'US'
                            }
                        };
                        masterGeocoder(geocodeOptions, place, geocoder);
                    } // end of master if statement
                }
                this.currentTitle(matchedTitle);
                this.currentYear(matchedScene.year());
                this.currentDirector(matchedScene.director());
                this.currentWriter(matchedScene.writer());
                this.currentActor1(matchedScene.actor1());
                this.currentActor2(matchedScene.actor2());
                this.currentActor3(matchedScene.actor3());
                this.currentStudio(matchedScene.studio());
                loadNYTData(matchedTitle);
                loadMovieDbData(encodeURIComponent(matchedTitle));
                //Todo: do an alert for the wrong film
                // <div class="alert alert-danger" role="alert">...</div>
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
            panToMarker: panToMarker,
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
            nytCapsuleReview: nytCapsuleReview,
            nytByline: nytByline,
            nytReviewURL: nytReviewURL,
            tagline: tagline,
            checkReset: checkReset,
            nytSummary: nytSummary,
            nytHeadline: nytHeadline
        };
    }();

    my.vm.loadSceneFM();
    ko.applyBindings(my.vm);

    ko.observable.fn.equalityComparer = function(a, b) {
        return a === b;
    };

});