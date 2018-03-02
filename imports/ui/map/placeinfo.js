import { Template } from 'meteor/templating';
import { Places } from '../../api/places.js';
import './placeinfo.html';

Template.placeinfo.events({
    'submit .place-form'(event) {
        // Prevent default browser form submit
        event.preventDefault();

        console.log(this.place._id);
        // Get value from form element
        const target = event.target;
        const title = target.title.value;
        const lat = target.lat.value;
        const lng = target.lng.value;
        const flightLight = parseInt(target.flightLight.value);
        const privateProperty = target.privateProperty.checked;

        Places.update(this.place._id, {
            $set: {
                privateProperty,
                flightLight,
                title,
                lat,
                lng
            },
        });
    },
    'click .delete'() {
        Places.remove(this.place._id);
    },
});