import { Meteor } from 'meteor/meteor';
import { Places } from '../imports/api/places.js';

Meteor.startup(() => {
    Places.remove({});
    Places.insert({"owner": "e6yTjXhMN6XbGwg2o", "username": "Tapematch", "privateProperty" : false, "flightLight" : 3, "title" : "Störmthaler See", "lat" : "51.233509", "lng" : "12.448221900000021" });
    Places.insert({"owner": "e6yTjXhMN6XbGwg2o", "username": "Tapematch", "privateProperty" : false, "flightLight" : 2, "title" : "Leipzig Völkerschlachtdenkmal", "lat" : "51.3149325", "lng" : "12.411391099999946" });
    Places.insert({"owner": "e6yTjXhMN6XbGwg2o", "username": "Tapematch", "privateProperty" : false, "flightLight" : 3, "title" : "Markkleeberger See", "lat" : "51.2663298", "lng" : "12.402565500000037" });
    Places.insert({"owner": "e6yTjXhMN6XbGwg2o", "username": "Tapematch", "privateProperty" : false, "flightLight" : 3, "title" : "Zwenkau Hafen", "lat" : "51.23442935651453", "lng" : "12.334731403735304" });
    Places.insert({"owner": "e6yTjXhMN6XbGwg2o", "username": "Tapematch", "privateProperty" : false, "flightLight" : 2, "title" : "Pier 1 am Cospudener See", "lat" : "51.263894371359065", "lng" : "12.344558153896855" });
    Places.insert({"owner": "e6yTjXhMN6XbGwg2o", "username": "Tapematch", "privateProperty" : true, "flightLight" : 1, "title" : "BELANTIS", "lat" : "51.25528126559785", "lng" : "12.317390952392543" });
    Places.insert({"owner": "e6yTjXhMN6XbGwg2o", "username": "Tapematch", "privateProperty" : true, "flightLight" : 1, "title" : "Helios Park-Klinikum Leipzig", "lat" : "51.306282", "lng" : "12.439227999999957" });
});
