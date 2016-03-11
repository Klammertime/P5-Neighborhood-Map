
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
