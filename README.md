# SF Film Map - Neighborhood Map Project
Usage
-----
Navigate to page hosted on github.com here: [http://klammertime.github.io/map/](http://klammertime.github.io/map/)

**OR**

1. Clone this repository
2. Run a local server using server.js. While in the root project directory, run: 

```
node server.js
``` 

3. Navigate to your local copy of index.html through your web browser  

Work
----
After cloning the project, work in the files located in the src directory.

Build
-----
1. Download and install npm by way of installing node.js (it comes packaged with it): [node.js](https://nodejs.org/en/) 
2. While in the root project directory, run: 
  
```
npm install
```

3. To build the dist folder, from the root project directory run the following:

```
gulp
```
##Assignment & Grading Rubric
##Screen Shots
##Technologies Used

##Challenges

####Film Location Data Quality
I used [SF Open Data - Film Locations in San Francisco](https://data.sfgov.org/Culture-and-Recreation/Film-Locations-in-San-Francisco/yitu-d5am), provided by the [San Francisco Film Office](http://filmsf.org/sf-locations). This data contained many misspellings and incomplete
address information. 

###Film Trailers, Images, and Reviews
* [TMDb API](https://www.themoviedb.org/documentation/api) at themoviedb.org is free to use and very thorough. I'm using a library created by [Franco Cavestri](https://github.com/cavestri/themoviedb-javascript-library/wiki)
* The [New York Times API - The Movie Reviews API](http://developer.nytimes.com/docs/movie_reviews_api/) is high quality and easy-to-use. I include their movie reviews.

####Other APIs I tried:
* IMDB is not free anymore, sadly, as they provide the most comprehensive film information.
* Rotten Tomatoes is free for 6 months but they approved my API too late to use for this project.
* omdbapi.com is free but has very limited data.
* [YouTube Data API](https://developers.google.com/youtube/v3/docs/videos/insert#parameters) has trailers but the results were often wrong even with 
an exact match. It uses the same API
as Google Maps and consumed a large percentage of my API calls. I would use
their API if my project required more general videos that merely
required categories since their API is easy-to-use and well-documented.
```
https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=Godzilla+Official+Extended+Trailer+(2014)&relevanceLanguage=en&type=video&videoEmbeddable=true&key={YOUR_API_KEY}
* Wikipedia does not provide the film images since they often
use copyrighted images under a fair use law that I doubt my app 
also falls under.
* Flickr provided inconsistent image results. I like how the SF Film Office includes [frequently used locations](http://www.filmsf.org/sf-locations), for example [Alamo Square](https://www.flickr.com/search/?q=alamo+square)
* Netflix no longer has a free API. 
* [Trailer Addict API](http://www.traileraddict.com/trailerapi), used by The NY Times for their trailers, is slow. I imagine the free and public version is why it's mainly used by publishers as a paid service.  

####Other APIs I would like to try:

* SendGrid - SendGrid is for transactional email and MailChimp is for marketing emails. A user sending themselves movie favorites in this app would be transactional.
* Rotten Tomatos API since I have 6 months access now.
* Yelp, Foursquare, Instagram, & Twitter.

####Knockout

We were required to use [Knockout.js](http://knockoutjs.com/) for our MVVM.

###Resources

* Autocomplete provided by devbridge: [https://github.com/devbridge/jQuery-Autocomplete](https://github.com/devbridge/jQuery-Autocomplete)
* Autocomplete with devbridge instructions:
[http://designshack.net/articles/javascript/create-a-simple-autocomplete-with-html5-jquery/](http://designshack.net/articles/javascript/create-a-simple-autocomplete-with-html5-jquery/)
* [Safari Books Online - KnockoutJS by Example](https://www.safaribooksonline.com/library/view/knockoutjs-by-example/9781785288548/)
* [Safari Books Online - Google Maps JavaScript API Cookbook]
(https://www.safaribooksonline.com/library/view/google-maps-javascript/9781849698825/)
* [Safari Books Online - Building a Single Page Web Application with Knockout.js](https://www.safaribooksonline.com/library/view/building-a-single/9781783284054/)
* [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/)
* [Pluralsight - Google Maps API: Get Started](https://app.pluralsight.com/library/courses/google-maps-api-get-started/table-of-contents): While general instructions are all relevant, this is from 2014, therefore
some of the Google Maps API code has changed.
* [Treehouse - Adding a Dynamic Map by Andrew Chalkey](https://teamtreehouse.com/library/build-an-interactive-website/google-maps-integration/adding-a-dynamic-map-2)
* stackoverflow

###Known Bugs and Issues
*There are at least 5 TV shows that come up with zero results: 
Hemingway & Gelhorn, CSI, Alcatraz. Use themoviedb API call for TV.
* Blocks fail to map. The SF Data file sometimes gives you 3 streets to show a scene on a block. Usually it will say, "between" or "from" between the streets which can be used to create a start and end location.

###Potential New Features:
* Real-Time Geolocation Service with Node.js
[http://tympanus.net/codrops/2012/10/11/real-time-geolocation-service-with-node-js/](http://tympanus.net/codrops/2012/10/11/real-time-geolocation-service-with-node-js/)
* Favorite locations.
* themoviedb.org: Take advantage of this more encompassing API call, the multi or append_to_response which allows you to make one call instead of several. Otherwise it only allows 40 calls/10 seconds:
```
 testDB = function() {
                // http://api.themoviedb.org/3/search/multi
                // https://api.themoviedb.org/3/movie/63?api_key=###&append_to_response=credits,images
                function successCB(data) {}

                function errorCB(data) {}

                theMovieDb.collections.getCollection({ "id": 10, "append_to_response": "trailers" }, successCB, errorCB);
}
```
* "Plan My Route" button with Geolocation using device GPS
* Take advantage of material design and Polymer.
* Spinner when film loads with either: 
* History API for unique urls.
* LocalStorage, Firebase, web workers and IndexDB.
* [Custom Controls](https://developers.google.com/maps/documentation/javascript/controls#CustomControls).

####Keyhole Markup Language (KML) Layer
* [KML Layer Overview](https://developers.google.com/maps/documentation/javascript/kmllayer#overview)
* [KML Docs](https://developers.google.com/kml/documentation/)
* [KML Interactive Sampler](https://kml-samples.googlecode.com/svn/trunk/interactive/index.html) 
* [SF Historic View](http://www.davidrumsey.com/blog/2014/11/7/georeferencer-added-to-online-library)
* If only there were more resources like this one for [Lord of the Rings film location map] (https://www.google.com/maps/d/viewer?mid=zh4EujB5Riwo.kTrEeXC1k-lY&hl=en_US)

###Refactor Options
* Take advantage of [underscore.string library.](http://gabceb.github.io/underscore.string.site/#capitalize)
