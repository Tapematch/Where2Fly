import {Template} from 'meteor/templating';
import {Blaze} from 'meteor/blaze'
import {Places} from '../../api/places.js';
import {Photos} from '../../api/photos.js';
import '../map/placeinfo.js';
import '../photo/photo.js';
import './detail.html';


Template.detail.onCreated(function () {
    var pid = FlowRouter.getParam("pid");
    var places = Places.find({_id: pid});

    // We can use the `ready` callback to interact with the map API once the map is ready.
    GoogleMaps.ready('detailMap', function (map) {
        var bounds = new google.maps.LatLngBounds();
        places.observe({
            added(place) {
                var marker = placeMarkerOnMap(place, map);
                bounds.extend(marker.getPosition());
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
    return marker;
}

function getPlace() {
    var pid = FlowRouter.getParam("pid");
    return Places.findOne({_id: pid});
}

Template.detail.helpers({
    displayID() {

        var pid = FlowRouter.getParam("pid");
        console.log("PID von details.js: " + pid);
        return pid;
    },
    displayValues() {
        return getPlace();
    },
    getColor: function (flightLight) {

        switch (flightLight) {
            case 1:
                return "red";
            case 2:
                return "orange";
            case 3:
                return "green";
            default:
                return "black";
        }
    },
    getPrivateProperty: function (privateProperty) {
        switch (privateProperty) {
            case true:
                return "lock";
            case false:
                return "unlock";
        }
    },
    getPrivatePropertyString: function (privateProperty) {
        switch (privateProperty) {
            case true:
                return "Private property";
            case false:
                return "Public property";
        }
    },
    detailMapOptions: function () {
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
    photos() {
        var pid = FlowRouter.getParam("pid");
        return Photos.find({"place": pid}, {sort: {createdAt: -1}});
    },
    liked() {
        var pid = FlowRouter.getParam("pid");
        var likes = Meteor.user().profile.likes;
        return (likes != undefined && likes.indexOf(pid) != -1);
    },
    isOwnPlace(userId) {
        console.log(userId);
        console.log(Meteor.userId());
        return (userId == Meteor.userId());
    }
});

Template.detail.events({

    'click .unlike'() {
        var pid = FlowRouter.getParam("pid");
        var likes = Meteor.user().profile.likes;
        var index = likes.indexOf(pid);
        if (index > -1) {
            likes.splice(index, 1);
        }
        Meteor.users.update({_id: Meteor.userId()}, {
            $set: {
                'profile.likes': likes
            }
        });
    },

    'click .like'() {
        var pid = FlowRouter.getParam("pid");
        var likes = Meteor.user().profile.likes;
        if(likes === undefined){
            likes = []
        }
        likes.push(pid);
        Meteor.users.update({_id: Meteor.userId()}, {
            $set: {
                'profile.likes': likes
            }
        });
    },

    'click .edit'() {
        Modal.show('editPlaceModal');
    },

    'click .upload-photo'() {
        Modal.show('uploadPhotoModal');
    },

    'click .delete'() {
        var pid = FlowRouter.getParam("pid");
        Places.remove(pid);

        FlowRouter.go('/');
    },
});

Template.editPlaceModal.helpers({
    displayValues() {
        return getPlace();
    },
});

Template.editPlaceModal.events({
    'submit .save'(event) {
        event.preventDefault();

        var pid = FlowRouter.getParam("pid");
        var title = event.target.title.value;
        var flightLight = parseInt(event.target.flightLight.value);
        var privateProperty = event.target.privateProperty.checked;

        Places.update(pid, {
            $set: {
                title,
                flightLight,
                privateProperty
            },
        });

        Modal.hide('editPlaceModal');
    },
});

Template.uploadPhotoModal.events({
    'submit .save'(event) {
        event.preventDefault();
        Modal.hide('uploadPhotoModal');
        setTimeout(function(){
            var url;
            var user = Meteor.user();
            var username = user.username;
            var owner = user._id;
            var place = FlowRouter.getParam("pid");
            if (event.target.photo.files.length != 0) {
                var modal = Modal.show('uploadingModal');
                console.log('upload...');
                var file = event.target.photo.files[0];
                var reader = new FileReader();
                reader.onload = function(e) {
                    var options = {
                        apiKey: '3fc2c494c55efcf',
                        image: e.target.result
                    };
                    Imgur.upload(options, function(errMsg, imgurData) {
                        if ( errMsg ) return alert('File upload failed. Please upload an image of a smaller file size');
                        url = imgurData.link;
                        var deleteHash = imgurData.deletehash;
                        Photos.insert({
                            username,
                            owner,
                            place,
                            url,
                            deleteHash,
                            createdAt: new Date(), // current time
                        });
                        Modal.hide('uploadingModal');
                    });
                };
                reader.readAsDataURL(file);
            } else {
                url = event.target.url.value;
                Photos.insert({
                    username,
                    owner,
                    place,
                    url,
                    createdAt: new Date(), // current time
                });
            }
        }, 500);
    }
});

function uint8ToString(buffer) {
    var length = buffer.length, str = ''

    for ( var i = 0; i < length; i++ ) {
        str += String.fromCharCode( buffer[i] )
    }

    return str
}