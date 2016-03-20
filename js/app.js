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

    function titleCheck(theData, resultsTitleProp, resultsDateProp, desiredTitle, desiredYear) {
        var resultsLength = theData.results.length;

        function justYear(longDate) {
            var myRegexp = /[^-]*/;
            var match = myRegexp.exec(longDate);
            return match;
        }

        for (var i = 0; i < resultsLength; i++) {
            var resultsTitle = theData.results[i][resultsTitleProp];
            var resultsYear = justYear(theData.results[i][resultsDateProp]);
            resultsYear = resultsYear[0];

            if ((resultsTitle == desiredTitle) && (resultsYear == desiredYear)) {
                return i;
            }
        }
    }

    my.vm = function() {
        var scenes = ko.observableArray([]);
        var currentScenes = ko.observableArray([]); //put current selected film locs
        var favoritedScenes = ko.observableArray([]);
        var allTitles = ko.observableArray([]);
        var requestedFilm = ko.observable();
        var markers = ko.observableArray([]);
        var overview = ko.observable();
        var tagline = ko.observable();
        var trailerURL = ko.observable();
        var currentTitle = ko.observable();
        var currentYear = ko.observable();
        var currentDirector = ko.observable();
        var currentWriter = ko.observable();
        var currentActor1 = ko.observable();
        var currentActor2 = ko.observable();
        var currentActor3 = ko.observable();
        var currentStudio = ko.observable();
        var posterSRC = ko.observable();
        var nytInfo = ko.observableArray([]);
        var movieDBInfo = ko.observableArray([]);
        var moviedb = ko.observable();

        var loadSceneFM = function() {
                // Returns everything before first parentheses, which is the place
                function escapeRegExp(string) {
                    var regExp = /^.*?(?=\s\()/;
                    var matches = regExp.exec(string);
                    return matches ? matches[0] : undefined;
                }

                // Returns everything between the parentheses, which is the street address
                // and is the format Google Maps JS API for Geolocation prefers
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
                // Without this it still works but doesn't open the infowindow, it goes to it and drops the marker
                map.panTo(clickedLocation.marker.getPosition());
                // Without this, it doesn't work
                clickedLocation.infowindow.open(map, clickedLocation.marker);
            },

            loadNYTData = function(encodedFilm, nonEncodedFilm, releaseYear) {
                var index1;
                var nytKey = '70f203863d9c8555f9b345f32ec442e8:10:59953537';
                var nytAPI = "http://api.nytimes.com/svc/movies/v2/reviews/search.json?query='" +
                    encodedFilm + "'&api-key=" + nytKey;
                nytInfo(undefined);


                function domain(fullUrl) {
                    var myRegexp = /\.(.*)$/; // get everything after first period
                    var match = myRegexp.exec(fullUrl);
                    return 'http://www.' + match[1]; //it works just not while on local server
                }

                $.ajax({
                    type: "GET",
                    url: nytAPI,
                    timeout: 2000,
                    dataType: "json",
                    beforeSend: function() {},
                    complete: function() {},
                    success: function(data) {
                        console.log("data from NYTimes", data);
                        if ((data.results[0].display_title == nonEncodedFilm) || (data.results[0].display_title == 'The ' + nonEncodedFilm)) {
                            index1 = 0;
                        } else {
                            index1 = titleCheck(data, 'display_title', 'publication_date', nonEncodedFilm, releaseYear);
                        }
                        //TODO: should each of those be observable arrays?
                        nytInfo({
                            title: data.results[index1].display_title,
                            capsuleReview: data.results[index1].capsule_review,
                            summary: data.results[index1].summary_short,
                            reviewURL: domain(data.results[index1].link.url),
                            byline: data.results[index1].byline,
                            headline: data.results[index1].headline,
                            releaseYear: data.results[index1].publication_date
                        });

                    },
                    fail: function(jqxhr, textStatus, error) {
                        console.log("New York Times Article Could Not Be Loaded: ", error);
                    }
                });
            },
            loadMovieDbData = function(encodedFilm, nonEncodedFilm, releaseYear) {
                posterSRC(null); //TODO: is there a diff. btwn using null and undefined here?
                overview(null);
                tagline(undefined);
                trailerURL(undefined);

                theMovieDb.search.getMovie({ "query": encodedFilm },
                    (function(data) {
                        var filmID;
                        var index;
                        var dbStore = JSON.parse(data);
                        moviedb(dbStore);
                        console.log("moviedb()", moviedb());
                        if ((moviedb().results[0].original_title.toLowerCase() == nonEncodedFilm.toLowerCase()) || (moviedb().results[0].original_title == ('The ' + nonEncodedFilm))) {
                            index = 0;
                        } else {
                            index = titleCheck(dbStore, 'original_title', 'release_date', nonEncodedFilm, releaseYear);
                            console.log("index in moviedb", index);
                            if(index === undefined) {

                            }
                        }

                        posterSRC('https://image.tmdb.org/t/p/w370' + moviedb().results[index].poster_path);
                        overview(moviedb().results[index].overview);
                        filmID = moviedb().results[index].id;
                        theMovieDb.movies.getTrailers({ "id": filmID },
                            (function(data) {
                                var theTrailer = JSON.parse(data);
                                var url = theTrailer.youtube.length > 0 ? ('https://www.youtube.com/embed/' + theTrailer.youtube[0].source + '?rel=0&amp;showinfo=0') : undefined;
                                trailerURL(url);
                            }),
                            (function() {
                                console.log("you fail!"); //TODO: find the proper error
                            }));

                        theMovieDb.movies.getById({ "id": filmID },
                            (function(data) {
                                var movieInfo = JSON.parse(data);
                                tagline(movieInfo.tagline);
                            }),
                            (function() {
                                console.log("you fail!"); //TODO: find the proper error
                            }));
                    }),
                    (function() {
                        console.log("you fail!"); //TODO: find the proper error
                    }));
            testDB();

            },

           testDB = function() {
                function successCB(data){
                    console.log("test data", data);
                }
                function errorCB(data){
                    console.log("test errorCB");
                }

                theMovieDb.collections.getCollection({"id": 10, "append_to_response": "trailers"}, successCB, errorCB);

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
                var matchedYear;
                var scenesLength = this.scenes().length;
                this.checkReset();
                    //TODO change to foreach
                    for (var i = 0; i < scenesLength; i++) {
                        if (requestedFilm().toLowerCase().trim() == this.scenes()[i].filmTitle().toLowerCase().trim()) {
                            matchedScene = this.scenes()[i];
                            matchedTitle = this.scenes()[i].filmTitle();
                            matchedYear = this.scenes()[i].year();
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
                this.currentYear(matchedYear);
                this.currentDirector(matchedScene.director());
                this.currentWriter(matchedScene.writer());
                this.currentActor1(matchedScene.actor1());
                this.currentActor2(matchedScene.actor2());
                this.currentActor3(matchedScene.actor3());
                this.currentStudio(matchedScene.studio());
                loadNYTData(encodeURIComponent(matchedTitle), matchedTitle, matchedYear);
                loadMovieDbData(encodeURIComponent(matchedTitle), matchedTitle, matchedYear);
                //TODO: do an alert for the wrong film, html binding? <div class="alert alert-danger" role="alert">...</div>
                // This page might help: https://www.safaribooksonline.com/library/view/knockoutjs-by-example/9781785288548/ch02s04.html
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
            overview: overview,
            googleInit: googleInit,
            currentTitle: currentTitle,
            currentYear: currentYear,
            currentDirector: currentDirector,
            currentWriter: currentWriter,
            currentActor1: currentActor1,
            currentActor2: currentActor2,
            currentActor3: currentActor3,
            currentStudio: currentStudio,
            tagline: tagline,
            checkReset: checkReset,
            trailerURL: trailerURL,
            posterSRC: posterSRC,
            nytInfo: nytInfo,
            movieDBInfo: movieDBInfo,
            testDB: testDB
        };
    }();

    my.vm.loadSceneFM();
    ko.applyBindings(my.vm);

    ko.observable.fn.equalityComparer = function(a, b) {
        return a === b;
    };
});