import {Template} from 'meteor/templating';
import {Blaze} from 'meteor/blaze'
import {Tracker} from 'meteor/tracker'
import {Places} from "../../api/places.js"
import './profile.html';
import '../map/placeinfo.js';
import {Photos} from "../../api/photos";
import {Comments} from "../../api/comments";

var visiblemarkers = [];

Template.profile.onCreated(function () {
    // We can use the `ready` callback to interact with the map API once the map is ready.
    GoogleMaps.ready('myprofileMap', function (map) {
        var places;
        var likedPlaces;
        var bounds = new google.maps.LatLngBounds();

        Tracker.autorun(() => {
            var userId = FlowRouter.getQueryParam("userId");
            if (typeof userId == 'undefined') {
                userId = Meteor.userId();
            }
            places = Places.find({"owner": userId});
            places.observe({
                added(place) {
                    var marker = placeMarkerOnMap(false, place, map);
                    bounds.extend(marker.getPosition());
                },
                removed(oldPlace) {
                    deleteMarker(oldPlace._id);
                }
            });

            var user = Meteor.users.findOne(userId);
            if (typeof user !== 'undefined') {
                var profile = user.profile;
                if (typeof profile !== 'undefined') {
                    var likes = user.profile.likes;
                    likedPlaces = Places.find({_id: {$in: likes}});

                    likedPlaces.observe({
                        added(place) {
                            var marker = placeMarkerOnMap(true, place, map);
                            bounds.extend(marker.getPosition());
                        },
                        removed(oldPlace) {
                            deleteMarker(oldPlace._id);
                        }
                    });
                }
            }

            map.instance.fitBounds(bounds);
        });
    });
});

function placeMarkerOnMap(like, place, map) {
    var image;
    if (like) {
        image = '/img/marker-icon-like.png';
    } else {
        image = '/img/marker-icon.png';
    }
    var myLatlng = new google.maps.LatLng(place.lat, place.lng);
    var marker = new google.maps.Marker({
        position: myLatlng,
        map: map.instance,
        //animation: google.maps.Animation.DROP,
        title: place.title,
        icon: image
    });
    marker.id = place._id;
    visiblemarkers.push(marker);

    var contentString = '<div id="' + place._id + 'info"></div>';
    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });
    var renderedView;
    marker.addListener('click', function () {
        infowindow.open(map.instance, marker);
        if (renderedView === undefined) {
            renderedView = Blaze.renderWithData(Template.placeinfo, {place}, document.getElementById(place._id + 'info'));
        }
    });
    infowindow.addListener('closeclick', function () {
        Blaze.remove(renderedView);
        renderedView = undefined;
    });

    return marker;
}

function deleteMarker(placeId) {
    visiblemarkers.forEach(function (marker) {
        if (marker.id === placeId) {
            marker.setMap(null);
        }
    });
}

Template.profile.helpers({
    myprofileMapOptions: function () {
        // Make sure the maps API has loaded
        if (GoogleMaps.loaded()) {
            // Map initialization options
            return {
                center: new google.maps.LatLng(0, 0),
                zoom: 1,
                maxZoom: 15
            };
        }
    },
    isCurrentUser() {
        var userId = FlowRouter.getQueryParam("userId");
        return (typeof userId == 'undefined' || userId == Meteor.userId());
    },
    user() {
        var userId = FlowRouter.getQueryParam("userId");
        if (typeof userId == 'undefined' || userId == Meteor.userId()) {
            return Meteor.user();
        } else {
            return Meteor.users.findOne(userId);
        }
    },
    photos() {
        var userId = FlowRouter.getQueryParam("userId");
        if (typeof userId == 'undefined' || userId == Meteor.userId()) {
            userId = Meteor.userId();
        }
        return Photos.find({"owner": userId}, {sort: {createdAt: -1}});
    }
    ,
    comments() {
        var userId = FlowRouter.getQueryParam("userId");
        if (typeof userId == 'undefined' || userId == Meteor.userId()) {
            userId = Meteor.userId();
        }
        return Comments.find({"owner": userId}, {sort: {createdAt: -1}});
    }
});

Template.profile.events({

    'click .edit'() {
        Modal.show('editProfileModal');
    },

    'click .report'() {
        var userId = FlowRouter.getQueryParam("userId");
        var user;
        if (userId === undefined) {
            user = Meteor.user();
        } else {
            user = Meteor.users.findOne(userId);
        }
        Modal.show('reportModal', user);
    },
});


Template.editProfileModal.events({
    'submit .save'(event) {
        event.preventDefault();

        var phone = event.target.phone.value;
        var fullname = event.target.fullname.value;
        var commercial = event.target.commercial.checked;
        var uavs = event.target.uavs.value;
        var website = event.target.website.value;
        var facebook = event.target.facebook.value;
        var twitter = event.target.twitter.value;
        var instagram = event.target.instagram.value;

        Meteor.users.update({_id: Meteor.userId()}, {
            $set: {
                'profile.phone': phone,
                'profile.fullname': fullname,
                'profile.commercial': commercial,
                'profile.uavs': uavs,
                'profile.website': website,
                'profile.facebook': facebook,
                'profile.twitter': twitter,
                'profile.instagram': instagram
            }
        });

        Modal.hide('editProfileModal');
    },
});