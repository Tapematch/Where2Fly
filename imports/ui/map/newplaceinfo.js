import { Template } from 'meteor/templating';
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

        if(event.keyCode == 13) {
            return false;
        }

        // Get value from form element
        const target = event.target;
        const title = target.title.value;
        const lat = searchPosition.get("searchLat");
        const lng = searchPosition.get("searchLng");
        const flightLight = parseInt(target.flightLight.value);
        const privateProperty = target.privateProperty.checked;

        Meteor.call('places.insert', title, flightLight, privateProperty, lat, lng, (error, result) => {
            searchmarker.setMap(null);
            searchmarker = null;
            FlowRouter.go('/place/' + result);
        });

    },
});