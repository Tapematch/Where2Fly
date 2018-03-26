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

Template.newplaceinfo.onRendered(function () {
    var slider = new Slider("#ex22", {
        reversed: false,
        rangeHighlights: [{"start": 1, "end": 2, "class": "category1"},
            {"start": 2, "end": 3, "class": "category2"}],
        formatter: function (value) {
            switch (value) {
                case 1:
                    return "Erlaubt"
                case 2:
                    return "Nach Absprache"
                case 3:
                    return "Verboten"
                default:
                    return "Fehler"
            }
        },
    });
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
        const flightLight = parseInt(target.newflightLight.value);
        const privateProperty = target.newprivateProperty.checked;

        Meteor.call('places.insert', title, flightLight, privateProperty, lat, lng, (error, result) => {
            searchmarker.setMap(null);
            searchmarker = null;
            FlowRouter.go('/place/' + result);
        });

    },
});