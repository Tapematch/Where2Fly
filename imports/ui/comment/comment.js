import './comment.html';
import {Template} from "meteor/templating";
import {Places} from "../../api/places";

Template.comment.helpers({
    isCurrentUser(userId) {
        return userId == Meteor.userId();
    },
    isUserProfile() {
        var routeName = FlowRouter.getRouteName();
        return routeName == 'profile';
    },
    isCurrentPlace(placeId) {
        var routeName = FlowRouter.getRouteName();
        var pid = FlowRouter.getParam("pid");
        return (routeName == 'details' && placeId == pid);
    },
    getPlaceName(placeId) {
        var place = Places.findOne({_id: placeId});
        return place.title;
    }
});

Template.comment.events({
    'click .delete'() {
        Meteor.call('comments.remove', this._id);
    },
    'click .report'() {
        Modal.show('reportModal', Template.currentData());
    },
});