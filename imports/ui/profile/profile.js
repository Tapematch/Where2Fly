import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze'
import { Places } from "../../api/places.js"
import './profile.html';
import '../map/placeinfo.js';

var visiblemarkers = [];

Template.profile.onCreated(function () {
    var userId = FlowRouter.getQueryParam("userId");
    if (typeof userId == 'undefined') {
        userId = Meteor.userId();
    }
    var places = Places.find({"owner": userId});

    // We can use the `ready` callback to interact with the map API once the map is ready.
    GoogleMaps.ready('myprofileMap', function (map) {

        var bounds = new google.maps.LatLngBounds();

        places.observe({
            added(place) {
                var marker = placeMarkerOnMap(place, map);
                bounds.extend(marker.getPosition());
            },
            removed(oldPlace) {
                deleteMarker(oldPlace._id);
            }
        });

        map.instance.fitBounds(bounds);
    });
});

function placeMarkerOnMap(place, map) {
    var image = '/img/marker-icon.png';
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
    marker.addListener('click', function() {
        infowindow.open(map.instance, marker);
        if (renderedView === undefined) {
            renderedView = Blaze.renderWithData(Template.placeinfo, {place}, document.getElementById(place._id + 'info'));
        }
    });
    infowindow.addListener('closeclick', function() {
        Blaze.remove(renderedView);
        renderedView = undefined;
    });

    return marker;
}

function deleteMarker(placeId) {
    visiblemarkers.forEach(function(marker) {
        if (marker.id === placeId) {
            marker.setMap(null);
        }
    });
}

Template.profile.onRendered(function () {
    GoogleMaps.load({key: 'AIzaSyAfg1bHhw_1xJzHVBcHoVy7TKbGizKQCUM'});
});

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
        console.log(userId);
        if (typeof userId == 'undefined' || userId == Meteor.userId()) {
            return Meteor.user();
        } else {
            return Meteor.users.findOne(userId);
        }
    }
});

Template.profile.events({

    'click .edit'() {
        Modal.show('editProfileModal');
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