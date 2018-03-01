import { Template } from 'meteor/templating';
import { Places } from '../../api/places.js';
import './placelist.html';

Template.placelist.helpers({
    places() {
        return Places.find({});
    }
});