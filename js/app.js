$(function() {
    'use strict';
    var geocoder,
        map,
        infowindow,
        previousInfowindow = false;
    // Don't make marker global or you'll break the panning essentially opening
    // the infowindow on the current marker each time

    /**
     * Template to use for other areas
     * Google Maps gives you default controls, but if you disableDefaultUI, you can
     * manually set them in mapOptions, giving each their own options.
     *
     * @constructor
     * @param {number} x - Entity's x coordinate on canvas
     * @param {number} y - Entity's y coordinate on canvas
     * @param {string} sprite - Entity's sprite used to render entity on canvas
     */
    function googleSuccess() {
        var center,
            myLatLng = new google.maps.LatLng(37.77493, -122.419416);

        var mapOptions = {
            center: myLatLng,
            zoom: 12,
            disableDefaultUI: true,
            zoomControl: true,
            zoomControlOptions: {
                position: google.maps.ControlPosition.LEFT_BOTTOM,
                style: 'SMALL'
            },
            panControl: true,
            mapTypeControl: false,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: google.maps.ControlPosition.LEFT_BOTTOM
            },
            scaleControl: true,
            streetViewControl: true,
            streetViewControlOptions: {
                position: google.maps.ControlPosition.LEFT_BOTTOM
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

        google.maps.event.addListener(map, 'click', function() {
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
    }

    /**
     * Represents a scene, or location and accompanying movie info
     * @constructor
     */

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
            return match[0];
        }

        for (var t = 0, u = theData.results.length; t < u; t++) {
            if (((theData.results[t][resultsTitleProp]) === desiredTitle) && (justYear(theData.results[t][resultsDateProp]) === desiredYear)) {
                return t;
            }
        }
    }


    /**
     * Important to find place in location for Google Maps JSAPI
     */

    function stringBeforeParens(string) {
        var matches = /^.*?(?=\s\()/.exec(string);
        return matches ? matches[0] : undefined;
    }

    /**
     * Important to find street address, Google Maps JSAPI geocoding preferred format
     */
    function stringBetweenParens(string) {
        var matches = /\(([^)]+)\)/.exec(string);
        return matches ? matches[1] : undefined;
    }

    /**
     * Important to format several-word movie titles for NY Times Movie API
     */
    function replaceSpace(str) {
        return str.replace(/ /g, '+');
    }

   /**
     * Important to format NY Times movie review URL to format that is less error-prone
     */
    function domain(fullUrl) {
        var match = /\.(.*)$/.exec(fullUrl);
        return 'http://www.' + match[1];
    }

    /**
     * Important to format NY Times movie review bylines consistently
     */

    function capitalizeName(name) {
        var idx = name.indexOf(" "),
            lastIdx = name.lastIndexOf(" "),
            first,
            last;

        if (idx === lastIdx) {
            name = name.toLowerCase();
            first = name.substring(0, idx);
            last = name.substring(idx + 1);
            first = first[0].toUpperCase() + first.substring(1);
            last = last[0].toUpperCase() + last.substring(1);
            return first + " " + last;
        } else {
            return name;
        }
    }

    /**
     * Module export pattern used for main view model so that we keep our variables
     * from polluting the global namespace but also share specific info with
     * different parts of the app.
     */
    my.vm = function() {
        var scenes = ko.observableArray([]),
            uniqueTitlesResults = ko.observable(),
            currentFilmObj = ko.observableArray([]),
            allTitles = ko.observableArray([]),
            requestedFilm = ko.observable(),
            pastFilm = ko.observable(),
            markers = ko.observableArray([]),
            markerTitles = ko.observableArray([]),
            overview = ko.observable(),
            tagline = ko.observable(),
            trailerURL = ko.observable(),
            currentTitle = ko.observable(),
            currentFilm = ko.observableArray(),
            backdropSRC = ko.observable(),
            posterSRC = ko.observable(),
            nytReviewMsg = ko.observable("We are unable to find the review for this film."),
            nytInfo = ko.observableArray([]),
            movieDBInfo = ko.observableArray([]),
            markerStore = ko.observableArray([]),
            moviedb = ko.observable(),
            query = ko.observable(null),
            favFilms = ko.observableArray([]),
            filtered = ko.observableArray([]),
            favFilmMsg = ko.observable(),
            loadSceneFM = function() {

                /**
                 * Each film_title is pushed into allTitles so that we may get the unique titles
                 * using the ko.computed method. While there are over 1K total titles, there are
                 * only around 200 unique titles. This is then passed to the uniqueTitlesResults
                 * observable array, which is then used for the autocomplete input.
                 *
                 * @param {array} my.filmData.data.Scenes - Array from external file data.js
                 * @param {number} i - Iterator
                 * @param {string} s - Each scene in the array. The properties are mapped to the correct
                 * properties in the newly instantiated SceneFilmModel, which is then pushed into the
                 * scenes observableArray.
                 */

                var uniqueTitles;

                $.each(my.filmData.data.Scenes, function(i, s) { //s stands for 'scene'
                    if (s.film_location !== undefined) { // create more false conditions
                        scenes.push(new SceneFilmModel(s.director, s.production_company, s.film_location, stringBeforeParens(s.film_location), stringBetweenParens(s.film_location), s.release_year, s.film_title, s.writer, s.actor_1, s.actor_2, s.actor_3));
                        allTitles.push(s.film_title);
                    }
                });

                uniqueTitles = ko.computed(function() {
                    return ko.utils.arrayGetDistinctValues(allTitles().sort());
                });

                uniqueTitlesResults(uniqueTitles());

                $('#autocomplete').autocomplete({
                    lookup: my.vm.uniqueTitlesResults(),
                    showNoSuggestionNotice: true,
                    noSuggestionNotice: 'Sorry, no matching results.',
                    onSelect: function(suggestion) {
                        my.vm.requestedFilm(suggestion.value);
                    }
                });
            },

            /**
             * Async callback function for google maps. Loads 'Godzilla' as default movie
             */
            googleInit = function() {
                googleSuccess();
                this.requestedFilm('Godzilla');
            },

            // The current item will be passed as the first parameter
            panToMarker = function(clickedLocation) {
                // When click on item in list of locations takes you to marker and opens infowindow
                if (previousInfowindow) {
                    previousInfowindow.close();
                }

                previousInfowindow = clickedLocation.infowindow;
                map.setZoom(13);
                map.setCenter(clickedLocation.marker.getPosition());
                map.panTo(clickedLocation.marker.getPosition());
                // Bounce less than twice
                clickedLocation.marker.setAnimation(google.maps.Animation.BOUNCE);

                setTimeout(function() {
                    clickedLocation.marker.setAnimation(null);
                }, 700);

                clickedLocation.infowindow.open(map, clickedLocation.marker);
            },

            loadNYTData = function(encodedFilm, nonEncodedFilm, releaseYear) {
                var index;
                nytInfo(undefined);

                $.ajax({
                    type: "GET",
                    url: 'http://api.nytimes.com/svc/movies/v2/reviews/search.json?query=' +
                        encodedFilm + '&order=by-title&api-key=ibmKthvILY3rFyE0dLjppVtB8k7jT3NL',
                    timeout: 2000,
                    dataType: "json",
                    beforeSend: function() {},
                    complete: function() {},
                    success: function(data) {
                        if ((data.results[0].display_title === nonEncodedFilm) || (data.results[0].display_title === 'The ' + nonEncodedFilm)) {
                            index = 0;
                        } else {
                            index = titleCheck(data, 'display_title', 'publication_date', nonEncodedFilm, releaseYear);
                        }

                        nytInfo({
                            title: data.results[index].display_title,
                            capsuleReview: data.results[index].capsule_review,
                            summary: data.results[index].summary_short,
                            reviewURL: domain(data.results[index].link.url),
                            byline: capitalizeName(data.results[index].byline),
                            headline: data.results[index].headline,
                            releaseYear: data.results[index].publication_date,
                            suggestedLinkText: data.results[index].link.suggested_link_text
                        });
                    },
                    fail: function(jqxhr, textStatus, error) {
                        console.log("New York Times Article Could Not Be Loaded: ", error);
                    }
                });
            },

            loadMovieDbData = function(encodedFilm, nonEncodedFilm, releaseYear) {
                var filmID,
                    index;
                backdropSRC(null);
                posterSRC(null);
                overview(null);
                tagline(null);
                trailerURL(null);

                function successCB(data) {
                    var dbStore = JSON.parse(data);
                    moviedb(dbStore);

                    if ((moviedb().results[0].original_title.toLowerCase() === nonEncodedFilm.toLowerCase()) || (moviedb().results[0].original_title === ('The ' + nonEncodedFilm))) {
                        index = 0;
                    } else {
                        index = titleCheck(dbStore, 'original_title', 'release_date', nonEncodedFilm, releaseYear);
                    }
                    if (moviedb().results[index].backdrop_path) {
                        backdropSRC('https://image.tmdb.org/t/p/w780' + moviedb().results[index].backdrop_path);
                    }

                    if (moviedb().results[index].poster_path) {
                        posterSRC('https://image.tmdb.org/t/p/w1280' + moviedb().results[index].poster_path);
                    }
                    overview(moviedb().results[index].overview);
                    filmID = moviedb().results[index].id;

                    getTagline(filmID);
                    getTrailer(filmID);
                }

                function errorCB() {
                    console.log("Sorry, MovieDb did not return any results.");
                }

                theMovieDb.search.getMovie({"query": encodedFilm}, successCB, errorCB);
            },

            getTagline = function(foundfilmID) {
                function successCB(data) {
                    var movieInfo = JSON.parse(data);
                    tagline(movieInfo.tagline);
                }

                function errorCB() {
                    console.log("Sorry, MovieDb did not return any tagline results.");
                }
                theMovieDb.movies.getById({"id": foundfilmID}, successCB, errorCB);
            },

            getTrailer = function(foundfilmID2) {
                function successCB(data) {
                    var theTrailer = JSON.parse(data);
                    trailerURL(theTrailer.youtube.length > 0 ? ('https://www.youtube.com/embed/' + theTrailer.youtube[0].source + '?rel=0&amp;controls=0&amp;showinfo=0') : undefined);
                }

                function errorCB() {
                    console.log("Sorry, MovieDb did not return any results.");
                }

                theMovieDb.movies.getTrailers({"id": foundfilmID2}, successCB, errorCB);
            },

            masterGeocoder = function(myGeocodeOptions, place, geocoder) {
                geocoder.geocode(myGeocodeOptions, function(results, status) {
                    var newMarkerTitle,
                        infowindow,
                        contentString,
                        marker;

                    if (status == google.maps.GeocoderStatus.OK) {

                        map.setCenter(results[0].geometry.location);

                        newMarkerTitle = place ? place + ", " + myGeocodeOptions.address : myGeocodeOptions.address;

                        contentString = '<div class="contentString"><div class="content-left"><img class="streetview-image" ' +
                                        'src="https://maps.googleapis.com/maps/api/streetview?size=300x300&location=' +
                                        stringBetweenParens(results[0].geometry.location) +
                                        '&key=AIzaSyCPGiVjhVmpWaeyw_8Y7CCG8SbnPwwE2lE" alt="streetview-image"></div>' +
                                        '<div class="content-body">' + (place ? '<p class="content-heading">' + place +
                                        '</p><p>' + results[0].formatted_address + '</p>' : '<p>' +
                                        results[0].formatted_address + '</p>') + '</div></div>';

                        marker = new google.maps.Marker({
                            map: map,
                            position: results[0].geometry.location,
                            title: newMarkerTitle, // intended address
                            animation: google.maps.Animation.DROP
                        });
                        markerTitles.push({ value: newMarkerTitle });


                        infowindow = new google.maps.InfoWindow({
                            content: contentString
                        });

                        marker.addListener('click', function() {
                            if (previousInfowindow) {
                                previousInfowindow.close();
                            }

                            previousInfowindow = infowindow;
                            map.setZoom(13);

                            map.panTo(marker.getPosition());
                            infowindow.open(map, marker);
                        });

                        markers.push({marker: marker, infowindow: infowindow});

                    } else {
                        console.log("Geocode was not successful for the following reason: " + status);
                    }
                });
                my.vm.markerStore(my.vm.markers());
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

            codeAddress = function(newValue) {
                var address,
                    place,
                    matchedScene,
                    matchedTitle,
                    matchedYear;

                if (this.checkReset()) {
                    for (var j = 0, s = this.scenes().length; j < s; j++) {
                        if (requestedFilm().toLowerCase().trim() === this.scenes()[j].filmTitle().toLowerCase().trim()) {
                            var geocodeOptions,
                                geocoder = new google.maps.Geocoder();

                            matchedScene = this.scenes()[j];
                            matchedTitle = this.scenes()[j].filmTitle();
                            matchedYear = this.scenes()[j].year();

                            if (this.scenes()[j].place()) {
                                address = this.scenes()[j].streetAddress();
                                place = this.scenes()[j].place();
                            } else {
                                address = this.scenes()[j].fullAddress();
                                place = null;
                            }

                            geocodeOptions = {
                                address: address + ', San Francisco, CA',
                                componentRestrictions: {
                                    country: 'US'
                                }
                            };

                            masterGeocoder(geocodeOptions, place, geocoder);
                        }
                    }
                    currentFilmObj({
                        currentTitle: matchedTitle,
                        currentYear: matchedYear,
                        currentDirector: matchedScene.director(),
                        currentWriter: matchedScene.writer(),
                        currentActor1: matchedScene.actor1(),
                        currentActor2: matchedScene.actor2(),
                        currentActor3: matchedScene.actor3(),
                        currentStudio: matchedScene.studio()
                    });

                    this.currentTitle(matchedTitle);
                    this.currentFilm(this.currentFilmObj());
                    loadNYTData(replaceSpace(matchedTitle), matchedTitle, matchedYear);
                    loadMovieDbData(encodeURIComponent(matchedTitle), matchedTitle, matchedYear);
                    pastFilm(requestedFilm());
                }
            },

            //TODO: clean up with switch statement?
            fav = function(value) {
                var canFavorite = true;
                if (this.favFilms().length === 0) {
                    this.favFilmMsg("This film has been added to your favorites list.");
                    this.favFilms.push(value.currentFilm());
                } else {
                    for (var z = 0, x = this.favFilms().length; z < x; z++) {
                        if (value.currentFilm().currentTitle !== this.favFilms()[z].currentTitle) {
                            canFavorite = true;
                        } else {
                            canFavorite = false;
                            this.favFilmMsg("This film is already in your favorites list.");
                        }
                    }
                    if (canFavorite) {
                        this.favFilmMsg("This film is already in your favorites list.");
                        this.favFilms.push(value.currentFilm());
                    }
                }
            },

            filter = function() {
                var tempMarker;
                if ((my.vm.query() !== '') && (my.vm.query() !== null) && (my.vm.query() !== undefined)) {
                    var newArr = this.markers.remove(function(item) {
                        var markerTitle = item.marker.title;
                        var queryMatches = markerTitle.toLowerCase().indexOf(my.vm.query().toLowerCase()) != -1;
                        return queryMatches;
                    });
                    for (var i = 0, f = my.vm.markers().length; i < f; i++) {
                        my.vm.markers()[i].marker.setMap(null);
                    }
                    my.vm.markers(newArr);
                    my.vm.filtered(newArr);
                    tempMarker = newArr[0].marker;
                    map.panTo(tempMarker.getPosition());
                    my.vm.query(null);
                }
            },
            //TODO: use forEach below and elsewhere?
            filterReset = function() {
                if (!my.vm.query()) {
                    this.markers(this.markerStore());

                    for (var f = 0; f < my.vm.filtered().length; f++) {
                        this.markers.push(my.vm.filtered()[f]);
                    }

                    for (var v = 0, m = this.markerStore().length; v < m; v++) {
                        this.markers()[v].marker.setMap(map);
                    }
                }
            };

        return {
            scenes: scenes,
            loadSceneFM: loadSceneFM,
            allTitles: allTitles,
            requestedFilm: requestedFilm,
            codeAddress: codeAddress,
            markers: markers,
            panToMarker: panToMarker,
            overview: overview,
            googleInit: googleInit,
            currentTitle: currentTitle,
            currentFilm: currentFilm,
            tagline: tagline,
            checkReset: checkReset,
            trailerURL: trailerURL,
            backdropSRC: backdropSRC,
            posterSRC: posterSRC,
            nytInfo: nytInfo,
            nytReviewMsg: nytReviewMsg,
            movieDBInfo: movieDBInfo,
            query: query,
            filter: filter,
            filterReset: filterReset,
            markerStore: markerStore,
            currentFilmObj: currentFilmObj,
            fav: fav,
            favFilms: favFilms,
            favFilmMsg: favFilmMsg,
            filtered: filtered,
            uniqueTitlesResults: uniqueTitlesResults,
            markerTitles: markerTitles
        };
    }();

    my.vm.loadSceneFM();
    ko.applyBindings(my.vm);

    /**
     * Every time the autocomplete input is used, the new value is
     * passed to the codeAddress function which is then called. Then
     * submit button is not needed.
     * @param {callback function} - Entity's x coordinate on canvas
     * @param {string} my.vm - Target (optional) defining
     * the value of 'this' in the callback function.
     * @param {string} sprite - Entity's sprite used to render entity on canvas.
     * @param {string} change - default event.
     */
    my.vm.requestedFilm.subscribe(function(newValue) {
        this.codeAddress(newValue);
    }, my.vm);

    ko.observable.fn.equalityComparer = function(a, b) {
        return a === b;
    };
});
