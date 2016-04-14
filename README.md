##View it live here: 
[http://klammertime.github.io/map/](http://klammertime.github.io/map/)

##Challenges

####Film Location Data Quality
I used [SF Open Data - Film Locations in San Francisco](https://data.sfgov.org/Culture-and-Recreation/Film-Locations-in-San-Francisco/yitu-d5am), provided by the San Francisco Film Commission. This data contained many misspellings and incomplete
address information. I corrected the misspellings and tried to use the addresses to get as close to the correct location as the Google Geolocation API
would allow. Because the movie titles and info will not change and the quality was so poor and needed a lot of manual editing, I downloaded it as a JSON file.If they add new movies, I can download those.

https://data.sfgov.org/Culture-and-Recreation/Film-Locations-in-San-Francisco/yitu-d5am

####Film Trailers, Images, and Reviews

* I'm using https://www.themoviedb.org which
appears to be the most promising. I'm using this library created by Franco Cavestri: https://github.com/cavestri/themoviedb-javascript-library/wiki

* New York Times API is great and easy to use. I include their movie reviews.

Other APIs I tried:
* IMDB is not free anymore. They provide the most comprehensive film information,
including film IDs which can then be used to get images etc. using x api.

* Rotten Tomatoes is free for 6 months but they approved my API too late to use for this project, will add it as a TODO item.

* omdbapi.com is free but has very limited data.

* YouTube has trailers but the results were often wrong even with 
an exact match, which was suprising. Also, it uses the same API
as Google Maps so it was eating up my API keys. I decided against
using it for something so specific as a movie trailer, despite the
fact that the API is easy-to-use and well-documented. I would use
their API if my project required more general videos that merely
required categories.

* Wikipedia does not provide the film images since they often
use copyrighted images under a fair use law that I doubt my app 
also falls under.

* Flickr provided inconsistent image results. If I was able to spend more time refining my query I might be able to get great results.

Other APIs I would like to try:

* Yelp, even though I've heard of people struggling with it, the data they provide is great.
* Instagram - people say this is a great and easy-to-use API.
* SendGrid - so a user can email themselves their favorites. From what I've read, SendGrid is for transactional email and MailChimp is for marketing emails. My guess is that the user sending themselves favorites is transactional.
* Rotten Tomatos API now that I have access for 6 months. I'd use ratings, reviews, actor images, and more.

####Knockout

We were required to use Knockout and most of the resources I found were 3 years old. I think this project shows that I can learn a framework in 1 week even with limited current resources and follow directions :) Below I've listed the resources I used to learn how
to use Knockout and the Google Maps JavaScript API.

###Resources

* Autocomplete provided by devbridge: https://github.com/devbridge/jQuery-Autocomplete

Instructions for use:
http://designshack.net/articles/javascript/create-a-simple-autocomplete-with-html5-jquery/

Originally I had used the HTML5 data list tag, but it does not have good support in Safari and the entire autocomplete was broken. This autocomplete plugin is great and it uses jQuery, which Knockout.js relies heavily on.

* Online tutorials from: Udacity, Pluralsight, Treehouse, Lynda.com and safaribooksonline.com.

Google Maps JavaScript API Cookbook
https://www.safaribooksonline.com/library/view/google-maps-javascript/9781849698825/

* Removing markers

https://developers.google.com/maps/documentation/javascript/examples/marker-remove

* Value vs. TextInput

http://knockoutjs.com/documentation/textinput-binding.html

* This is the best documentation I've ever used. 

[Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/)


* [Pluralsight - Google Maps API: Get Started](https://app.pluralsight.com/library/courses/google-maps-api-get-started/table-of-contents)

While the general instructions are all relevant, this is from 2014, therefore
some of the Google Maps API code has been updated. Refer to the docs
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
* 'Plan My Route' button: uses Geolocation to detect the user's current location and get directions to one of the movie locations chosen. 
* Slide out menu similar to that on Google Maps. Material design and Polymer. Drawer system. Polymer has a starter kit.
* Spinner when film loads with either: a)that resembles countdown on older films b)http://msurguy.github.io/ladda-bootstrap/ c)http://chadkuehn.com/animated-font-spinners/
* Map out blocks. The SF Data file provided it in an inconsistent format where it gives you 3 streets, but usually it will say, "between" or "from" between the streets.
* Use History API to have unique urls and ability to use back arrow
* Add ability to zoom in on poster
* Click street view and go to street view on Google Maps
* LocalStorage, Firebase, web workers and IndexDB are all options to save time
* Back to original position button. You can right click but that's not obvious to the user.
* KML Data for SF Historic View. If only there were more resources like this 

##Refactor Options
* Take advantage of underscore.string library: http://gabceb.github.io/underscore.string.site/#capitalize
