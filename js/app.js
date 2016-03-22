$(function() {
    'use strict';
    var prev_infowindow = false,
        geocoder,
        map,
        infowindow;

    function googleSuccess() {
        var center,
            myLatLng = new google.maps.LatLng(37.77493, -122.419416);
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
        var initialCenter = mapOptions.center,
            initialZoom = mapOptions.zoom;
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
        constructor: function(director, studio, fullAddress, place, streetAddress, year, filmTitle, writer, actor1, actor2, actor3) {
            this.director = ko.observable(director);
            this.studio = ko.observable(studio);
            this.fullAddress = ko.observable(fullAddress);
            this.place = ko.observable(place);
            this.streetAddress = ko.observable(streetAddress);
            this.year = ko.observable(year);
            this.filmTitle = ko.observable(filmTitle);
            this.actor1 = ko.observable(actor1);
            this.actor2 = ko.observable(actor2);
            this.actor3 = ko.observable(actor3);
            this.writer = ko.observable(writer);
        }
    });

    function titleCheck(theData, resultsTitleProp, resultsDateProp, desiredTitle, desiredYear) {
        function justYear(longDate) {
            var match = /[^-]*/.exec(longDate);
            console.log("match", match);
            return match[0];
        }

        for (var i = 0, r = theData.results.length; i < r; i++) {
            if (((theData.results[i][resultsTitleProp]) === desiredTitle) && (justYear(theData.results[i][resultsDateProp]) === desiredYear)) {
                return i;
            }
        }
    }

    my.vm = function() {
        var scenes = ko.observableArray([]),
            allTitles = ko.observableArray([]),
            requestedFilm = ko.observable(),
            pastFilm = ko.observable(),
            markers = ko.observableArray([]),
            overview = ko.observable(),
            tagline = ko.observable(),
            trailerURL = ko.observable(),
            currentTitle = ko.observable(),
            currentYear = ko.observable(),
            currentDirector = ko.observable(),
            currentWriter = ko.observable(),
            currentActor1 = ko.observable(),
            currentActor2 = ko.observable(),
            currentActor3 = ko.observable(),
            currentStudio = ko.observable(),
            posterSRC = ko.observable(),
            nytInfo = ko.observableArray([]),
            movieDBInfo = ko.observableArray([]),
            markerStore = ko.observableArray([]),
            moviedb = ko.observable(),
            query = ko.observable(''),
            loadSceneFM = function() {
                // Returns everything before first parentheses, which is the place
                function escapeRegExp(string) {
                    var matches = /^.*?(?=\s\()/.exec(string);
                    return matches ? matches[0] : undefined;
                }

                // Returns everything between the parentheses, which is the street address
                // and is the format Google Maps JS API for Geolocation prefers
                function escapeRegExp2(string) {
                    var matches = /\(([^)]+)\)/.exec(string);
                    return matches ? matches[1] : undefined;
                }

                $.each(my.filmData.data.Scenes, function(i, s) { //s stands for 'scene'
                    if (s.film_location !== undefined) { // create more false conditions
                        scenes.push(new SceneFilmModel(s.director, s.production_company, s.film_location, escapeRegExp(s.film_location), escapeRegExp2(s.film_location), s.release_year, s.film_title, s.writer, s.actor_1, s.actor_2, s.actor_3));
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
                var index;
                nytInfo(undefined);

                function domain(fullUrl) {
                    var match = /\.(.*)$/.exec(fullUrl);
                    return 'http://www.' + match[1]; //it works just not while on local server
                }

                $.ajax({
                    type: "GET",
                    url: 'http://api.nytimes.com/svc/movies/v2/reviews/search.json?query="' +
                        encodedFilm + '"&api-key=70f203863d9c8555f9b345f32ec442e8:10:59953537',
                    timeout: 2000,
                    dataType: "json",
                    beforeSend: function() {},
                    complete: function() {},
                    success: function(data) {
                        console.log("data from NYTimes", data);
                        if ((data.results[0].display_title === nonEncodedFilm) || (data.results[0].display_title === 'The ' + nonEncodedFilm)) {
                        index = 0;
                    } else {
                        index = titleCheck(data, 'display_title', 'publication_date', nonEncodedFilm, releaseYear);

                        //TODO: should each of those be observable arrays?
                        nytInfo({
                            title: data.results[index].display_title,
                            capsuleReview: data.results[index].capsule_review,
                            summary: data.results[index].summary_short,
                            reviewURL: domain(data.results[index].link.url),
                            byline: data.results[index].byline,
                            headline: data.results[index].headline,
                            releaseYear: data.results[index].publication_date
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
                var filmID,
                    index;

                function successCB(data) {
                    var dbStore = JSON.parse(data);
                    moviedb(dbStore);

                    if ((moviedb().results[0].original_title.toLowerCase() === nonEncodedFilm.toLowerCase()) || (moviedb().results[0].original_title === ('The ' + nonEncodedFilm))) {
                        index = 0;
                    } else {
                        index = titleCheck(dbStore, 'original_title', 'release_date', nonEncodedFilm, releaseYear);
                    }

                    posterSRC('https://image.tmdb.org/t/p/w370' + moviedb().results[index].poster_path);
                    overview(moviedb().results[index].overview);
                    filmID = moviedb().results[index].id;

                    getTagline(filmID);
                    getTrailer(filmID);
                }

                function errorCB() {
                    console.log("you fail!"); //TODO: find the proper error
                }
            // How it works:
            // theMovieDb.movies.getById({"id":76203 }, successCB, errorCB)
                theMovieDb.search.getMovie({ "query": encodedFilm }, successCB, errorCB);
            },

            getTagline = function(foundfilmID) {
                function successCB(data){
                    var movieInfo = JSON.parse(data);
                    tagline(movieInfo.tagline);
                }

                function errorCB(){
                    console.log("you fail!"); //TODO: find the proper error
                }
                theMovieDb.movies.getById({ "id": foundfilmID }, successCB, errorCB);
            },

            getTrailer = function(foundfilmID2) {
                function successCB(data){
                    var theTrailer = JSON.parse(data);
                    trailerURL(theTrailer.youtube.length > 0 ? ('https://www.youtube.com/embed/' + theTrailer.youtube[0].source + '?rel=0&amp;showinfo=0') : undefined);
                }

                function errorCB(){
                    console.log("you fail!"); //TODO: find the proper error
                }

                theMovieDb.movies.getTrailers({ "id": foundfilmID2 }, successCB, errorCB);
            },

            testDB = function() {
                // http://api.themoviedb.org/3/search/multi
                // https://api.themoviedb.org/3/movie/63?api_key=###&append_to_response=credits,images
                function successCB(data) {
                }

                function errorCB(data) {
                }

                theMovieDb.collections.getCollection({ "id": 10, "append_to_response": "trailers" }, successCB, errorCB);
            },

            masterGeocoder = function(myGeocodeOptions, place, geocoder) {
                var contentString,
                    marker;
                geocoder.geocode(myGeocodeOptions, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        map.setCenter(results[0].geometry.location);

                        var streetViewImage = '<img class="streetView media-object" src="https://maps.googleapis.com/maps/api/streetview?size=300x300&location=' +
                            results[0].geometry.location + '&key=AIzaSyCPGiVjhVmpWaeyw_8Y7CCG8SbnPwwE2lE" alt="streetView">';

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

            checkReset = function() {
                if ((this.markers().length > 0) && (pastFilm() !== requestedFilm())) {
                    $.each(this.markers(), function(i, marker) {
                        marker.marker.setMap(null);
                    });
                    this.markers([]);
                    return true;
                } else if (!pastFilm()) {
                    return true;
                } else {
                    return false;
                }
            },

            codeAddress = function() {
                var address,
                    place,
                    matchedScene,
                    matchedTitle,
                    matchedYear;

                if (this.checkReset()) {
                    for (var j = 0, s = this.scenes().length; j < s; j++) {
                        if (requestedFilm().toLowerCase().trim() === this.scenes()[j].filmTitle().toLowerCase().trim()) {
                            matchedScene = this.scenes()[j];
                            matchedTitle = this.scenes()[j].filmTitle();
                            matchedYear = this.scenes()[j].year();
                            var geocoder = new google.maps.Geocoder();

                            if (this.scenes()[j].place()) {
                                address = this.scenes()[j].streetAddress();
                                place = this.scenes()[j].place();
                            } else {
                                address = this.scenes()[j].fullAddress();
                                place = undefined;
                            }

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
                    console.time("loadNYTData");
                    loadNYTData(encodeURIComponent(matchedTitle), matchedTitle, matchedYear);
                    console.timeEnd("loadNYTData");
                    console.time("loadMovieDbData");
                    loadMovieDbData(encodeURIComponent(matchedTitle), matchedTitle, matchedYear);
                    console.timeEnd("loadMovieDbData");
                    pastFilm(requestedFilm());
                }
            },

            filter = function(){
                var newArr = my.vm.markers.remove( function (item) {
                    return item.marker.title === my.vm.query();
                });
                for(var i = 0, f = my.vm.markers().length; i < f; i++){
                    my.vm.markers()[i].marker.setMap(null);
                }
                my.vm.markerStore(my.vm.markers());
                my.vm.markerStore.push(newArr[0]); //TODO: have it be a loop because might not be 0
                my.vm.markers(newArr[0]);
            },

            filterReset = function(){
                for(var i = 0; i < my.vm.markerStore().length; i++){
                    my.vm.markerStore()[i].marker.setMap(map);
                }
                my.vm.markers(my.vm.markerStore());
            };
             // if(theMarkers[x].marker.title.toLowerCase().indexOf(value.toLowerCase()) >= 0) {

        return {
            scenes: scenes,
            loadSceneFM: loadSceneFM,
            uniqueTitles: uniqueTitles,
            allTitles: allTitles,
            requestedFilm: requestedFilm,
            codeAddress: codeAddress,
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
            testDB: testDB,
            query: query,
            filter: filter,
            filterReset: filterReset,
            markerStore: markerStore
        };
    }();

    my.vm.loadSceneFM();
    ko.applyBindings(my.vm);

    ko.observable.fn.equalityComparer = function(a, b) {
        return a === b;
    };
});


 //TODO: do an alert for the wrong film, html binding? <div class="alert alert-danger" role="alert">...</div>
 // This page might help: https://www.safaribooksonline.com/library/view/knockoutjs-by-example/9781785288548/ch02s04.html