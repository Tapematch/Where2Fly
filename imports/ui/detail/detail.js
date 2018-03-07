import {Template} from 'meteor/templating';
import {Places} from '../../api/places.js';
import './detail.html';


Template.detail.helpers({

    displayID() {

        pid = FlowRouter.getQueryParam("pid");
        console.log("PID von details.js: " + pid);
        return pid;
    },

    displayValues() {

        pid = FlowRouter.getQueryParam("pid");
        place = Places.findOne({_id: pid});
        return place;

    }


});