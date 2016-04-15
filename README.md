# SF Film Map - Neighborhood Map Project

##View it live here: 
[http://klammertime.github.io/map/](http://klammertime.github.io/map/)

Usage
-----
Navigate to page hosted on github.com [here](http://klammertime.github.io/map/)

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
address information. I corrected the misspellings and tried to use the addresses to get as close to the correct location as the Google Geolocation API
would allow. Because the movie titles and info will not change and the quality was so poor and needed a lot of manual editing, I downloaded it as a JSON file.

###Film Trailers, Images, and Reviews

* TMDb API at themoviedb.org is free to use and very thorough. [https://www.themoviedb.org/documentation/api](https://www.themoviedb.org/documentation/api)I'm using this library created by Franco Cavestri: [https://github.com/cavestri/themoviedb-javascript-library/wiki](https://github.com/cavestri/themoviedb-javascript-library/wiki)

* The [New York Times API - The Movie Reviews API](http://developer.nytimes.com/docs/movie_reviews_api/) is great and easy to use. I include their movie reviews.

####Other APIs I tried:
* IMDB is not free anymore, sadly, as they provide the most comprehensive film information.

* Rotten Tomatoes is free for 6 months but they approved my API too late to use for this project.

* omdbapi.com is free but has very limited data.

* [YouTube Data API](https://developers.google.com/youtube/v3/docs/videos/insert#parameters) has trailers but the results were often wrong even with 
an exact match, which was suprising. Also, it uses the same API
as Google Maps so it was eating up my API keys. I decided against
using it for something so specific as a movie trailer, despite the
fact that the API is easy-to-use and well-documented. I would use
their API if my project required more general videos that merely
required categories. 

Here was the API call layout I tried using:
https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=Godzilla+Official+Extended+Trailer+(2014)&relevanceLanguage=en&type=video&videoEmbeddable=true&key={YOUR_API_KEY}

* Wikipedia does not provide the film images since they often
use copyrighted images under a fair use law that I doubt my app 
also falls under.

* Flickr provided inconsistent image results. If I was able to spend more time refining my query I might be able to get great results. I can have a list of frequently used locations like [http://www.filmsf.org/sf-locations](http://www.filmsf.org/sf-locations) has
on their main site where they link to flickr: [https://www.flickr.com/search/?q=alamo+square](https://www.flickr.com/search/?q=alamo+square)

* Netflix no longer has a free API. 

* [Trailer Addict API](http://www.traileraddict.com/trailerapi) is used by The NY Times for their trailers. You don't need a key but given how slow it is, I imagine the free and public version is why it's mainly used by publishers.  

####Other APIs I would like to try:

* Yelp, even though I've heard of people struggling with it, the data they provide is great.

* SendGrid - SendGrid is for transactional email and MailChimp is for marketing emails. A user sending themselves movie favorites in this app would be transactional.

* Rotten Tomatos API now that I have access for 6 months. I'd use ratings, reviews, actor images, and more.

* Other APIs Udacity says are great: Foursquare, Instagram, & Twitter.

####Knockout

We were required to use [Knockout.js](http://knockoutjs.com/) for our MVVM since Udacity said "Angular was too magical". Most of the resources I found were 3 years old. I think this project shows that I can learn a framework in 1 week even with limited current resources and follow directions :) Below I've listed the resources I used to learn how
to use Knockout and the Google Maps JavaScript API.

###Resources

* Autocomplete provided by devbridge: [https://github.com/devbridge/jQuery-Autocomplete](https://github.com/devbridge/jQuery-Autocomplete)

* Autocomplete with devbridge instructions:
[http://designshack.net/articles/javascript/create-a-simple-autocomplete-with-html5-jquery/](http://designshack.net/articles/javascript/create-a-simple-autocomplete-with-html5-jquery/)

Originally I had used the HTML5 data list tag, but it does not have good support in Safari. This autocomplete plugin is great.

* Online tutorials from: Udacity, Pluralsight, Treehouse, Lynda.com and safaribooksonline.com.

*[Safari Books Online - KnockoutJS by Example](https://www.safaribooksonline.com/library/view/knockoutjs-by-example/9781785288548/)

*[Safari Books Online - Google Maps JavaScript API Cookbook]
(https://www.safaribooksonline.com/library/view/google-maps-javascript/9781849698825/)

*[Safari Books Online - Building a Single Page Web Application with Knockout.js](https://www.safaribooksonline.com/library/view/building-a-single/9781783284054/)

*Removing markers - [https://developers.google.com/maps/documentation/javascript/examples/marker-remove](https://developers.google.com/maps/documentation/javascript/examples/marker-remove)

*[Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/)

* [Pluralsight - Google Maps API: Get Started](https://app.pluralsight.com/library/courses/google-maps-api-get-started/table-of-contents)

While the general instructions are all relevant, this is from 2014, therefore
some of the Google Maps API code has changed. Refer to the docs
for specific code but you can use this for general tips and advice as I 
did. He's a good teacher. 

* [Treehouse - Adding a Dynamic Map by Andrew Chalkey](https://teamtreehouse.com/library/build-an-interactive-website/google-maps-integration/adding-a-dynamic-map-2)

* This tutorial is also helpful but old.
Video -  Adding a Dynamic Map:
This showed me how to make the map responsive and move its center based on the window resize event. When the map is idle, the current center is stored.  

JS Fiddle
* http://jsfiddle.net/stesta/2T3Db/

* stackoverflow

http://stackoverflow.com/questions/332872/encode-url-in-javascript

http://stackoverflow.com/questions/23935758/gradient-over-img-tag-using-css

* Lynda.com - Bootstrap Layouts: Responsive Single-Page Design
Specifically for navbar.

###Possible Future Plans:

* Real-Time Geolocation Service with Node.js
[http://tympanus.net/codrops/2012/10/11/real-time-geolocation-service-with-node-js/](http://tympanus.net/codrops/2012/10/11/real-time-geolocation-service-with-node-js/)

* Favorite locations instead of just movies. Add this to content string on infowindows: <span data-bind="click: $parent.fav" class="glyphicon glyphicon-heart" aria-hidden="true"></span>

* themoviedb.org: Take advantage of this more encompassing API call, the multi or append_to_response which allows you to make one call instead of several. Otherwise it only allows 40 calls/10 seconds. This is the perfect place to use localStorage or Firebase:
 testDB = function() {
                // http://api.themoviedb.org/3/search/multi
                // https://api.themoviedb.org/3/movie/63?api_key=###&append_to_response=credits,images
                function successCB(data) {}

                function errorCB(data) {}

                theMovieDb.collections.getCollection({ "id": 10, "append_to_response": "trailers" }, successCB, errorCB);
}

- Also add TV. There are at least 5 tv shows that come up with zero results: 
Hemingway & Gelhorn, CSI, Alcatraz
* "Plan My Route" button using Geolocation.
* Slide out menu similar to that on Google Maps. Material design and Polymer. Drawer system. Polymer has a starter kit.
* Spinner when film loads with either: a)that resembles countdown on older films b)http://msurguy.github.io/ladda-bootstrap/ c)http://chadkuehn.com/animated-font-spinners/
* Map out blocks. The SF Data file provided it in an inconsistent format where it gives you 3 streets, but usually it will say, "between" or "from" between the streets.
* History API for unique urls.
* Add ability to zoom in on poster.
* Click street view and go to street view on Google Maps.
* LocalStorage, Firebase, web workers and IndexDB.
* [Custom Controls](https://developers.google.com/maps/documentation/javascript/controls#CustomControls): 'Back to original position'. You can right click but that's not obvious to the user.

###Keyhole Markup Language (KML) Layer
*[KML Layer Overview](https://developers.google.com/maps/documentation/javascript/kmllayer#overview)
*[KML Docs](https://developers.google.com/kml/documentation/)
*[KML Interactive Sampler](https://kml-samples.googlecode.com/svn/trunk/interactive/index.html) 
*[SF Historic View](http://www.davidrumsey.com/blog/2014/11/7/georeferencer-added-to-online-library)
*If only there were more resources like this one for [Lord of the Rings film location map] (https://www.google.com/maps/d/viewer?mid=zh4EujB5Riwo.kTrEeXC1k-lY&hl=en_US)
To find KML data you search in Google like this: filetype: kml "Lord of the Rings"
* Heatmap Layer or Polyline (great for giving people a tour).

##Refactor Options
* Take advantage of [underscore.string library.](http://gabceb.github.io/underscore.string.site/#capitalize)
