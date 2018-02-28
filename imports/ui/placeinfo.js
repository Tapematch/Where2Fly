import { Template } from 'meteor/templating';
import { Places } from '../api/places.js';
import './placeinfo.html';

Template.placeinfo.events({
    'submit .place-form'(event) {
        // Prevent default browser form submit
        event.preventDefault();

        console.log(this._id);
        // Get value from form element
        const target = event.target;
        const title = target.title.value;
        const lat = target.lat.value;
        const lng = target.lng.value;

        if(this._id === undefined) {
            Places.insert({
                title,
                lat,
                lng
            });
        } else {
            Places.update(this._id, {
                $set: {
                    title,
                    lat,
                    lng },
            });
        }
    },
    'click .delete'() {
        Places.remove(this._id);
    },
});