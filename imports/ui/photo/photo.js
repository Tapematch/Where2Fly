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
    }
});

Template.photo.events({
    'click .delete'() {
        if (this.deleteHash != undefined) {
            var options = {
                apiKey: '3fc2c494c55efcf',
                deleteHash: this.deleteHash
            };
            Imgur.delete(options, function (errMsg, imgurData) {
                if (errMsg)
                    console.log(errMsg);
                else
                    console.log('Imgur Photo deleted');
            });
        }
        Photos.remove(this._id);
    },
    'click .report'() {
        Modal.show('reportModal', Template.currentData());
    },
});