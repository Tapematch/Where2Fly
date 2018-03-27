import './photo.html';
import {Template} from "meteor/templating";
import {Places} from "../../api/places";
import {Photos} from "../../api/photos";

Template.photo.helpers({
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
    },
    toThumbnail(imageUrl) {
        return Imgur.toThumbnail(imageUrl, Imgur.BIG_SQUARE);
    }
});

Template.photo.events({
    'click .delete'() {
        Meteor.call('photos.remove', this.deleteHash, this._id);
    },
    'click .report'() {
        Modal.show('reportModal', Template.currentData());
    },
});