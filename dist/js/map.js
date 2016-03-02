$(function () {

  // Location construction
  var Scene = function() {
      this.filmLocation = ko.observable();
      this.filmTitle = ko.observable();
      this.year = ko.observable();
      this.director = ko.observable();
      this.productionCompany = ko.observable();
      this.writer = ko.observable();
      // this.latLng = ko.computed(function() {
      //   return geocode(this.location());
      // }, this);
      this.latLng = null;
      this.description = null;
      this.wikipedia = null;
      this.flickr = null;
      this.nyTimes = null;
      this.review = null;
  };

  my.vm = function() {
    var metadata = {},
    scenes = ko.observableArray([]),
    selectedScenes = ko.observableArray([]),
    favoritedScenes = ko.observableArray([]),
    allTitles = ko.observableArray([]),
    selectedFilm = ko.observableArray([]),

    load = function() {
      $.each(my.filmData.data.Scenes, function(i, p) {
        my.vm.scenes.push(new Scene()
                .filmLocation(p.film_location)
                .filmTitle(p.film_title)
                .year(p.release_year)
                .director(p.director)
                .productionCompany(p.production_company)
                .writer(p.writer)
                );
        my.vm.allTitles.push(p.film_title);
      });
    },
    uniqueTitles = ko.computed(function() {
      return ko.utils.arrayGetDistinctValues(allTitles().sort());
    });

  return {
    scenes: scenes,
    selectedScenes: selectedScenes,
    load: load,
    uniqueTitles: uniqueTitles,
    allTitles: allTitles,
    selectedFilm:selectedFilm
  };
} ();


  my.vm.load();
  ko.applyBindings(my.vm);
});

