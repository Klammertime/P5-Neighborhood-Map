var mapApplication = function() {

  var map,
      geocoder,
      googleMap;

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

  vm = function() {
    var metadata = {},
    scenes = ko.observableArray([]),
    selectedScenes = ko.observableArray([]),
    favoritedScenes = ko.observableArray([]),
    allTitles = ko.observableArray([]),
    selectedFilm = ko.observableArray([]),
    singleFilm = ko.observable(),
    newFilm = ko.observable(true),

    load = function() {
      $.each(my.filmData.data.Scenes, function(i, p) {
        scenes.push(new Scene()
                .filmLocation(p.film_location)
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

    /* method to add custom binding handlers to knockout */
    var configureBindingHandlers = function() {
        ko.bindingHandlers.theMap = {
          init: function(element, valueAccessor) {
            var myLatLng = new google.maps.LatLng(37.734883, -122.363663);
            var mapOptions = {
                center: myLatLng,
                zoom: 11,
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
        geocoder = new google.maps.Geocoder();
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
  };

    var init = function() {
      configureBindingHandlers();
      vm.load();
      ko.applyBindings(vm);
      ko.applyBindings(mapApplication);
    };

    $(init);

    return {
      scenes: scenes,
      selectedScenes: selectedScenes,
      load: load,
      uniqueTitles: uniqueTitles,
      allTitles: allTitles,
      selectedFilm:selectedFilm,
      singleFilm: singleFilm,
      newFilm: newFilm
    };
  };
}();

