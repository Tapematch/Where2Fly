import { Template } from 'meteor/templating';
import { Places } from '../../api/places.js';
import './placelist.html';

Template.placelist.helpers({
    places() {
        return Places.find({});
    }
});

Template.place.helpers({
    getColor: function(flightLight) {
        switch(flightLight) {
            case 1:
                return "red";
            case 2:
                return "orange";
            case 3:
                return "green";
            default:
                return "black";
        }
    }
});
