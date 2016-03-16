
function wikipediaHTMLResult(data) {
  console.log(data);
}


function callWikipediaAPI(wikipediaPage) {
  // http://www.mediawiki.org/wiki/API:Parsing_wikitext#parse
    $.getJSON('http://en.wikipedia.org/w/api.php?action=parse&format=json&callback=?', {page:wikipediaPage, prop:'text|images', uselang:'en'}, wikipediaHTMLResult);
}
callWikipediaAPI('Godzilla');

https://en.wikipedia.org/w/api.php?action=opensearch&search=Godzilla&format=json&callback=wikiCallback
prop=info|revisions&list=backlinks|embeddedin|allimages&meta=userinfo

https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&format=jsonfm&titles=Godzilla


http://www.omdbapi.com/?t=Godzilla&y=2014&plot=short&r=json


http://img.omdbapi.com/?apikey=[yourkey]&

http://www.omdbapi.com/?t=Godzilla&y=2014&plot=short&r=json

this looks best:
/search - Text based search is the most common way. You provide a query string and we provide the closest match. Searching by text takes into account all original, translated, alternative names and titles.


http://api.themoviedb.org/3/search/movie

http://api.themoviedb.org/3/search/movie

Joy%20Luck%20Club

811DjJTon9gD6hZ8nCjSitaIXFQ.jpg

https://image.tmdb.org/t/p/w370/811DjJTon9gD6hZ8nCjSitaIXFQ.jpg
https://api.themoviedb.org/3/movie/550?api_key=0568b9a19dbc4adda399b2d12875588c

https://api.themoviedb.org/3/search/movie/550?api_key=0568b9a19dbc4adda399b2d12875588c







    http://api.nytimes.com/svc/movies/v2/reviews/search.json?query=Copycat&page=2&sort=oldest&api-key=70f203863d9c8555f9b345f32ec442e8:10:59953537







// heatmap code not using but want to later
       // function animate() {
        //     var theData = [];
        //     for (site = 0; site < 60; site++){
        //         if(month == 0) {
        //             data.push({location: new google.maps.LatLng(precipitationData[site].coords[0],
        //                                       )})
        //         }
        //     }
        // }


        // heatmap = new google.maps.visualization.HeatmapLayer({
        //    map: map,
        //    data: theData,
        //    radius: 40,
        //    dissipate: true,
        //    maxIntensity: 700,
        //    opacity: 1,
        //    gradient: [
        //     'rgba(0, 0, 0, 0)',
        //     'rgba(255, 255, 0, 0.50)',
        //     'rgba(0, 0, 255, 1.0)'
        //    ]
        // });


        //Film Model class not using but want to later

    // var UniqueFilmModel = Base.extend({
    //     constructor: function(title, year, director, studio, writer, poster, trailer, actors, overview, imdbID) {
    //         this.title = ko.observable(title);
    //         this.year = ko.observable(year);
    //         this.director = ko.observable(director);
    //         this.studio = ko.observable(studio);
    //         this.writer = ko.observable(writer);
    //         this.poster = ko.observable(poster);
    //         this.trailer = ko.observable(trailer);
    //         this.actors = ko.observable(actors);
    //         this.overview = ko.observable(overview);
    //         this.imdbID = ko.observable(imdbID);
    //         this.favorite = ko.observable(false);
    //         this.locations = ko.observableArray([]);
    //     }
    // });