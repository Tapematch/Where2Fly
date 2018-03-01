import { Template } from 'meteor/templating';
import { Places } from '../../api/places.js';
import './newplaceinfo.html';


this.searchmarker = null;
this.searchPosition = new ReactiveDict();
Template.newplaceinfo.helpers({
    searchLat() {
        return searchPosition.get("searchLat");
    },
    searchLng() {
        return searchPosition.get("searchLng");
    }
});

Template.newplaceinfo.events({
    'submit .place-form'(event) {
        // Prevent default browser form submit
        event.preventDefault();

        // Get value from form element
        const target = event.target;
        const title = target.title.value;
        const lat = target.lat.value;
        const lng = target.lng.value;

        Places.insert({
            title,
            lat,
            lng
        });
        searchmarker.setMap(null);
        searchmarker = null;
    },
});