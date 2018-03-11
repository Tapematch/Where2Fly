import './report.html';
import {Template} from "meteor/templating";

Template.reportModal.events({
    'submit #reportForm'(event)  {
        event.preventDefault();
        console.log(Template.currentData());
        Meteor.call(
            'report',
            event.target.reason.value,
            Template.currentData()
        );

        Modal.hide('reportModal');
    },
});