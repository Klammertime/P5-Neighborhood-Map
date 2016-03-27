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
            return match[0];
        }

        for (var i = 0, r = theData.results.length; i < r; i++) {
            if (((theData.results[i][resultsTitleProp]) === desiredTitle) && (justYear(theData.results[i][resultsDateProp]) === desiredYear)) {
                return i;
            }
        }
    }

    function strConverter(theStr) {
        var re = /&rdquo;/gi;
        var str = theStr;
        str = str.replace(re, '”');

        re = /&ldquo;/gi;
        str = str.replace(re, '“');

        re = /&rsquo;/gi;
        str = str.replace(re, '’');

        re = /&lsquo;/gi;
        str = str.replace(re, '‘');
        return str;
    }

    function capitalizeName(name) {
        var idx,
            lastIdx,
            first,
            last;

        idx = name.indexOf(" ");
        lastIdx = name.lastIndexOf(" ");
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

    my.vm = function() {
        var scenes = ko.observableArray([]),
            uniqueTitlesResults = ko.observable(),
            filmTest = ko.observableArray([]),
            favLoc = ko.observableArray([]),
            allTitles = ko.observableArray([]),
            requestedFilm = ko.observable(),
            pastFilm = ko.observable(),
            markers = ko.observableArray([]),
            markerTitles = ko.observableArray([]),
            overview = ko.observable(),
            tagline = ko.observable(),
            trailerURL = ko.observable(),
            currentTitle = ko.observable(),
            posterSRC = ko.observable(),
            nytInfo = ko.observableArray([]),
            movieDBInfo = ko.observableArray([]),
            markerStore = ko.observableArray([]),
            moviedb = ko.observable(),
            query = ko.observable(),
            resetBool = true,
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

                var uniqueTitles = ko.computed(function() {
                    return ko.utils.arrayGetDistinctValues(allTitles().sort());
                });

                uniqueTitlesResults(uniqueTitles());

                $('#autocomplete').autocomplete({
                    lookup: my.vm.uniqueTitlesResults(),
                    showNoSuggestionNotice: true,
                    noSuggestionNotice: 'Sorry, no matching results',
                    onSelect: function(suggestion) {
                        my.vm.requestedFilm(suggestion.value);
                    }
                });
            },

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
                // Bounce once
                clickedLocation.marker.setAnimation(google.maps.Animation.BOUNCE);
                clickedLocation.marker.setAnimation(null);
                // Without this, it doesn't work
                clickedLocation.infowindow.open(map, clickedLocation.marker);
            },

            loadNYTData = function(encodedFilm, nonEncodedFilm, releaseYear) {
                var index;
                nytInfo(null);

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
                        }

                        nytInfo({
                            title: strConverter(data.results[index].display_title),
                            capsuleReview: strConverter(data.results[index].capsule_review),
                            summary: strConverter(data.results[index].summary_short),
                            reviewURL: domain(data.results[index].link.url),
                            byline: capitalizeName(data.results[index].byline),
                            headline: strConverter(data.results[index].headline),
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
                posterSRC(null);
                overview(null);
                tagline(null);
                trailerURL(null);
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
                function successCB(data) {
                    var movieInfo = JSON.parse(data);
                    tagline(movieInfo.tagline);
                }

                function errorCB() {
                    console.log("you fail!"); //TODO: find the proper error
                }
                theMovieDb.movies.getById({ "id": foundfilmID }, successCB, errorCB);
            },

            getTrailer = function(foundfilmID2) {
                function successCB(data) {
                    var theTrailer = JSON.parse(data);
                    trailerURL(theTrailer.youtube.length > 0 ? ('https://www.youtube.com/embed/' + theTrailer.youtube[0].source + '?rel=0&amp;showinfo=0') : undefined);
                }

                function errorCB() {
                    console.log("you fail!"); //TODO: find the proper error
                }

                theMovieDb.movies.getTrailers({ "id": foundfilmID2 }, successCB, errorCB);
            },

            testDB = function() {
                // http://api.themoviedb.org/3/search/multi
                // https://api.themoviedb.org/3/movie/63?api_key=###&append_to_response=credits,images
                function successCB(data) {}

                function errorCB(data) {}

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
                                '<span data-bind="click: $parent.fav" class="glyphicon glyphicon-heart" aria-hidden="true"></span></div></div>';

                            marker = new google.maps.Marker({
                                map: map,
                                position: results[0].geometry.location,
                                title: place + ", " + myGeocodeOptions.address, // intended address
                                animation: google.maps.Animation.DROP,
                                optimized: false
                            });
                            markerTitles.push({ value: place + ", " + myGeocodeOptions.address });

                        } else {
                            contentString = '<div class="media contentString"><div class="content-left"><a href="#">' +
                                streetViewImage + '</a></div><div class="content-body"><p>' +
                                results[0].formatted_address + '</p>' +
                                '<span data-bind="click: $parent.fav" class="glyphicon glyphicon-heart" aria-hidden="true"></span></div></div>';

                            marker = new google.maps.Marker({
                                map: map,
                                position: results[0].geometry.location,
                                title: myGeocodeOptions.address, // intended address
                                animation: google.maps.Animation.DROP,
                                optimized: false
                            });
                            markerTitles.push({ value: myGeocodeOptions.address });
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
                console.log("this in masterGeocoder", this);

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
                            matchedScene = this.scenes()[j];
                            matchedTitle = this.scenes()[j].filmTitle();
                            matchedYear = this.scenes()[j].year();
                            var geocoder = new google.maps.Geocoder();

                            if (this.scenes()[j].place()) {
                                address = this.scenes()[j].streetAddress();
                                place = this.scenes()[j].place();
                            } else {
                                address = this.scenes()[j].fullAddress();
                                place = null;
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
                    filmTest({
                        currentTitle: matchedTitle,
                        currentYear: matchedYear,
                        currentDirector: matchedScene.director(),
                        currentWriter: matchedScene.writer(),
                        currentActor1: matchedScene.actor1(),
                        currentActor2: matchedScene.actor2(),
                        currentActor3: matchedScene.actor3(),
                        currentStudio: matchedScene.studio()
                    });

                    $('#autocomplete2').autocomplete({
                        lookup: my.vm.markerTitles(),
                        showNoSuggestionNotice: true,
                        noSuggestionNotice: 'Sorry, no matching results',
                        onSelect: function(suggestion) {
                            my.vm.query(suggestion.value);
                            my.vm.filter();
                        }
                    });

                    this.currentTitle(matchedTitle);
                    console.time("loadNYTData");
                    loadNYTData(encodeURIComponent(matchedTitle), matchedTitle, matchedYear);
                    console.timeEnd("loadNYTData");
                    console.time("loadMovieDbData");
                    loadMovieDbData(encodeURIComponent(matchedTitle), matchedTitle, matchedYear);
                    console.timeEnd("loadMovieDbData");
                    pastFilm(requestedFilm());
                }
            },

            fav = function(value) {
                this.favLoc.push(value);
            },

            filter = function() {
                resetBool = true;
                var newArr = this.markers.remove(function(item) {
                    var markerTitle = item.marker.title;
                    var queryMatches = markerTitle.toLowerCase().indexOf(this.query().toLowerCase()) != -1;
                    return queryMatches;
                });
                for (var i = 0, f = this.markers().length; i < f; i++) {
                    this.markers()[i].marker.setMap(null);
                }
                this.markers(newArr);
            },

            filterReset = function() {
                if (resetBool) {
                    var filtered = ko.observable(this.markers()[0]);
                    this.markers(this.markerStore());
                    this.markers.push(filtered());
                    for (var i = 0, m = this.markerStore().length; i < m; i++) {
                        this.markers()[i].marker.setMap(map);
                    }
                    resetBool = false;
                }
                this.query('');
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
            markerStore: markerStore,
            filmTest: filmTest,
            fav: fav,
            favLoc: favLoc,
            uniqueTitlesResults: uniqueTitlesResults,
            markerTitles: markerTitles
        };
    }();

    my.vm.loadSceneFM();
    ko.applyBindings(my.vm);

    my.vm.requestedFilm.subscribe(function(newValue) {
        my.vm.codeAddress(newValue);
    });

    ko.observable.fn.equalityComparer = function(a, b) {
        return a === b;
    };
});


//TODO: do an alert for the wrong film, html binding? <div class="alert alert-danger" role="alert">...</div>
// This page might help: https://www.safaribooksonline.com/library/view/knockoutjs-by-example/9781785288548/ch02s04.h