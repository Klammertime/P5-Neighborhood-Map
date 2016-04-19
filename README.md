#Neighborhood Map

**Project 5:  Neighborhood Map (40 hrs)** ~ [Udacity Front End Web Developer Nanodegree Program](https://www.udacity.com/course/front-end-web-developer-nanodegree--nd001)

**Directions**: You will develop a single-page application featuring a map of your neighborhood or a neighborhood you would like to visit. You will then add additional functionality to this application, including: map markers to identify popular locations or places you’d like to visit, a search function to easily discover these locations, and a listview to support simple browsing of all locations. You will then research and implement third-party APIs that provide additional information about each of these locations (such as StreetView images, Wikipedia articles, Yelp reviews, etc).

###SF Film Map
TODO: write paragraph about how you decided to make it unique using film data

Usage
-----
Navigate to project hosted on github.com [**here**](http://klammertime.github.io/P5-Neighborhood-Map/)

**OR**

1. Clone this repository
2. Run a local server using server.js: while in the root project directory, run `node server.js`. 
3. Navigate to your local copy of index.html through your web browser  

Work
----
After cloning the project, work in the files located in the src directory.

Build
-----
1. Download and install npm by installing node.js (npm comes packaged with node.js): [node.js](https://nodejs.org/en/) 
2. While in the root project directory, run: `npm install`.
3. To build the dist folder, from the root project directory run the following: `gulp`.

##Screen Shots
TODO: add screenshots or take off

##Technologies Used

Knockoutjs, AJAX, Bootstrap, jQuery, HTML5, Google Maps, Typekit

####Knockout
The project requirements specified that we use [Knockout.js](http://knockoutjs.com/) for our organizational library. 
> Knockout is a JavaScript MVVM (a modern variant of MVC) library that makes it easier to create rich, desktop-like user interfaces with JavaScript and HTML. It uses observers to make your UI automatically stay in sync with an underlying data model, along with a powerful and extensible set of declarative bindings to enable productive development.
> 
> -[Knockout on Github](https://github.com/Klammertime/knockout)

####APIs Used
* [**SF Open Data API**](https://data.sfgov.org/Culture-and-Recreation/Film-Locations-in-San-Francisco/yitu-d5am) - Film Locations in San Francisco, provided by the [San Francisco Film Office](http://filmsf.org/sf-locations)
* [**Google Maps JavaScript API**](https://developers.google.com/maps/documentation/javascript/)
* [**Google Street View Image API**](https://developers.google.com/maps/documentation/streetview/)
* [**TMDb API**](https://www.themoviedb.org/documentation/api) at themoviedb.org is free to use and very thorough. I'm using an add-on library, [**themoviedb JavaScript Library**](https://github.com/cavestri/themoviedb-javascript-library/wiki/Collections) created by Franco Cavestri.
* [**The New York Times API - Movie Reviews API**](http://developer.nytimes.com/docs/movie_reviews_api/) is high quality and easy-to-use. I include their movie reviews.

##Challenges

####Film Location Data Quality
I used [SF Open Data - Film Locations in San Francisco](https://data.sfgov.org/Culture-and-Recreation/Film-Locations-in-San-Francisco/yitu-d5am), provided by the [San Francisco Film Office](http://filmsf.org/sf-locations). This data contained many misspellings and incomplete
address information.

####API Trial and Error:
* [**IMDB**](http://www.imdb.com/help/show_leaf?usedatasoftware) has a limited free version. I found conflicting information online which led me to believe it was not free, but recently found posts like [this](https://www.quora.com/Any-one-knows-about-reliable-IMDB-free-paid-API) that say its possible to get the information for free. Maybe I will use it in the future.
* [**Rotten Tomatoes API**](http://developer.rottentomatoes.com/) is free for 6 months but they approved my API too late to use for this project.
* [**The Open Movie Database**](http://www.omdbapi.com/) is free but has limited and/or illegally obtained data. I want to use data legally.
* [**YouTube Data API**](https://developers.google.com/youtube/v3/docs/videos/insert#parameters) has trailers but the results were often wrong even with 
an exact match. It uses the same API
as Google Maps and consumed a large percentage of my API calls. I would use
their API if my project required more general videos that merely
required categories since their API is easy-to-use and well-documented.
```
https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=Godzilla+Official+Extended+Trailer+(2014)&relevanceLanguage=en&type=video&videoEmbeddable=true&key={YOUR_API_KEY}
```
* [**MediaWiki action API used by Wikipedia**](https://www.mediawiki.org/wiki/API:Main_page) does not provide the film images since they often
use copyrighted images under a fair use law that I doubt my app 
also falls under.
* [**Flickr API**](https://www.flickr.com/services/api/) provided inconsistent image results. I like how the SF Film Office includes [frequently used locations](http://www.filmsf.org/sf-locations), for example [Alamo Square](https://www.flickr.com/search/?q=alamo+square)
* [**Netflix**](https://www.reddit.com/r/programming/comments/2mdo7y/netflix_is_shutting_down_its_public_api_today/) no longer offers a free API. 
* [**Trailer Addict API**](http://www.traileraddict.com/trailerapi), used by The New York Times and other major publishers for their trailers, offers a free version that is very slow.  

##Resources
* **Udacity Supporting Courses**: [JavaScript Design Patterns](https://classroom.udacity.com/courses/ud989/lessons/3417188540/concepts/33740985840923), [Intro to AJAX](https://classroom.udacity.com/nanodegrees/nd001/parts/00113454014/modules/271165859175460/lessons/3174548544/concepts/31591285700923)
* **Pluralsight**: [Building HTML5 and JavaScript Apps with MVVM and Knockout](https://app.pluralsight.com/library/courses/knockout-mvvm/table-of-contents), [Google Maps API: Get Started](https://app.pluralsight.com/library/courses/google-maps-api-get-started/table-of-contents), (https://app.pluralsight.com/library/courses/javascript-practical-design-patterns/table-of-contents)
* **Safari Books Online**: [KnockoutJS by Example](https://www.safaribooksonline.com/library/view/knockoutjs-by-example/9781785288548/), [Google Maps JavaScript API Cookbook](https://www.safaribooksonline.com/library/view/google-maps-javascript/9781849698825/), [Building a Single Page Web Application with Knockout.js], [Practical Design Patterns in JavaScript](https://www.safaribooksonline.com/library/view/building-a-single/9781783284054/)
* **Treehouse**: [Adding a Dynamic Map by Andrew Chalkey](https://teamtreehouse.com/library/build-an-interactive-website/google-maps-integration/adding-a-dynamic-map-2)
* **Code School**: [JavaScript Best Practices](https://www.codeschool.com/courses/javascript-best-practices)
* [**Google Maps JavaScript API Docs**](https://developers.google.com/maps/documentation/javascript/)
* **jQuery Autocomplete** provided by devbridge: [https://github.com/devbridge/jQuery-Autocomplete](https://github.com/devbridge/jQuery-Autocomplete) & [Instructions on designshack](http://designshack.net/articles/javascript/create-a-simple-autocomplete-with-html5-jquery/)
 
##Known Bugs and Issues
* At least 5 TV shows come up with zero results because I am using a movie call, but I can use the [**TV ID call**](http://docs.themoviedb.apiary.io/#reference/tv) to get the primary information about a TV series by id.
Examples of TV shows: Hemingway & Gelhorn, CSI, Alcatraz. 
* Several blocks are included in the locations list and they fail to map correctly, since they are not formatted to be geocoded, for example:  
`"film_location": "Van Ness Ave between Fell and Lombard"` or

`"film_location": "Howard St from Embarcadero to 11 St"`
Since it usually uses the words 'between' and 'from', this can be used to isolate the blocks and create a set of two intersections to then map using either **waypoints in directions** as shown on [Google's docs](https://developers.google.com/maps/documentation/javascript/examples/directions-waypoints) or **driving directions** as shown on this [gist by trtg](https://gist.github.com/trtg/3950475).

##Potential New Features:

####Possible APIs To Add:
* [**Firebase**](https://www.firebase.com/) to store geocoded locations. Here's a good resource:  [Pluralsight Firebase Fundamentals](https://app.pluralsight.com/library/courses/firebase-fundamentals/table-of-contents)
* [**SendGrid**](https://sendgrid.com/docs/API_Reference/index.html) - SendGrid is for transactional email and MailChimp is for marketing emails. A user sending themselves movie favorites in this app would be transactional.
* [**Rotten Tomatos API**](http://developer.rottentomatoes.com/) since I have 6 months access now. [Example using the API w/ Knockoutjs](http://www.webdesignermag.co.uk/create-data-driven-interfaces-with-knockoutjs/)
* **Yelp, Foursquare, Instagram, Facebook, Meetup & Twitter**.
* A user could plan a route of locations and films and share their plans on Facebook or Meetup. Then update Instagram, Facebook, and Twitter with pictures.

####Technologies To Use:
* [Real-Time Geolocation Service with Node.js](http://tympanus.net/codrops/2012/10/11/real-time-geolocation-service-with-node-js/)
* Use [Google Maps Custom Controls](https://developers.google.com/maps/documentation/javascript/controls#CustomControls): so user can click a button to return the map.setCenter to the original center. Currently, the user can right-click only.
* Take advantage of the 'multi' or 'append_to_response' themoviedb API call, which allows you to make one call instead of several. Otherwise, the API only allows 40 calls/10 seconds. For example, `http://api.themoviedb.org/3/search/multi` or `https://api.themoviedb.org/3/movie/63?api_key=###&append_to_response=credits,images`
* Use the [getCollection(options, parameter1, parameter2)](https://github.com/cavestri/themoviedb-javascript-library/wiki/Collections) and [getCollectionImages(options, parameter1, parameter2)](https://github.com/cavestri/themoviedb-javascript-library/wiki/Collections) calls provided by [themoviedb JavaScript Library](https://github.com/cavestri/themoviedb-javascript-library/wiki/Collections)
* Use the [HTML5 Geolocation API](Geolocation using device GPS) to get the user's current location and allow them to get directions to locations. 
* Use the [HTML5 History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) so the user can move back and forth through their browsing history
* IndexDB and service worker for offline access: [Udacity Offline Web Applications](https://www.udacity.com/course/offline-web-applications--ud899)
* Use of [underscore.string library](http://gabceb.github.io/underscore.string.site/#capitalize) for title and address modifications
* Add ability to favorite locations
* Add spinner when film and other items load
* Use Material design and Polymer.js: [Pluralsight Material design and Polymer.js](https://app.pluralsight.com/library/courses/building-web-application-polymer-material-design/table-of-contents)
* Rewrite in Angular, Backbone or Ember: [Udacity Front End Frameworks Backbone, Angular, Ember](https://www.udacity.com/course/front-end-frameworks--ud894)

####Keyhole Markup Language (KML) Layer
> The Google Maps JavaScript API supports the KML and GeoRSS data formats for displaying geographic information. These data formats are displayed on a map using a KmlLayer object, whose constructor takes the URL of a publicly accessible KML or GeoRSS file.
> 
> -[KML Layer Overview on developers.google.com](https://developers.google.com/maps/documentation/javascript/kmllayer#overview)

* [**KML Interactive Sampler**](https://kml-samples.googlecode.com/svn/trunk/interactive/index.html) 
* [**SF Historic View**](http://www.davidrumsey.com/blog/2014/11/7/georeferencer-added-to-online-library)
* An ideal film-themed KML resource would resemble this one for [Lord of the Rings](https://www.google.com/maps/d/viewer?mid=zh4EujB5Riwo.kTrEeXC1k-lY&hl=en_US). So far, this is the only one I found. 
