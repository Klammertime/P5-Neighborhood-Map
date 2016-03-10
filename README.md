##View it live here: 
[http://klammertime.github.io/map/](http://klammertime.github.io/map/)

##Challenges

####Film Location Data Quality
I used [SF Open Data - Film Locations in San Francisco](https://data.sfgov.org/Culture-and-Recreation/Film-Locations-in-San-Francisco/yitu-d5am), provided by the San Francisco Film Commission. This data contained many misspellings and incomplete
address information. I corrected the misspellings and tried to use the addresses to get as close to the correct location as the Google Geolocation API
would allow. 

https://data.sfgov.org/Culture-and-Recreation/Film-Locations-in-San-Francisco/yitu-d5am

####Film Trailers, Images, and Reviews

* Right now I am exploring https://www.themoviedb.org which
appears to be the most promising. I'm using this library created by Franco Cavestri: https://github.com/cavestri/themoviedb-javascript-library/wiki

Other APIs I tried:
* IMDB is not free anymore. They provide the most comprehensive film information,
including film IDs which can then be used to get images etc. using x api.

* Rotten Tomatoes is free but they said they can take up to 60 days
to activate your API and a week later I still haven't gotten it
approved, so I am not using it right now.

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

* New York Times API

####Knockout

We were required to use Knockout and most of the resources I found were 3 years old. I think this project shows that I can learn a framework in 1 week even with limited current resources and follow directions :) Below I've listed the resources I used to learn how
to use Knockout and the Google Maps JavaScript API.

###Resources

Google Maps JavaScript API Cookbook
https://www.safaribooksonline.com/library/view/google-maps-javascript/9781849698825/

* Removing markers

https://developers.google.com/maps/documentation/javascript/examples/marker-remove

* Autocomplete Form

https://blogs.oracle.com/geertjan/entry/html5_datalist_with_knockout_js

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

This tutorial is also helpful but old.
Video -  Adding a Dynamic Map:
This showed me how to make the map responsive and move its center based on the window resize event. When the map is idle, the current center is stored.  

JS Fiddle
* http://jsfiddle.net/stesta/2T3Db/

* stackoverflow

Encode URL in JavaScript -
http://stackoverflow.com/questions/332872/encode-url-in-javascript
"You have three options:

escape() will not encode: @*/+

encodeURI() will not encode: ~!@#$&*()=:/,;?+'

encodeURIComponent() will not encode: ~!*()'

But in your case, if you want to pass a URL into a GET parameter of other page, you should use escape or encodeURIComponent, but not encodeURI.

See Stack Overflow question Best practice: escape, or encodeURI / encodeURIComponent for further discussion."


