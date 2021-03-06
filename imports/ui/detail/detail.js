import {Template} from 'meteor/templating';
import {Blaze} from 'meteor/blaze'
import {Places} from '../../api/places.js';
import {Photos} from '../../api/photos.js';
import {Comments} from '../../api/comments.js';
import '../map/placeinfo.js';
import '../photo/photo.js';
import '../comment/comment.js';
import '../report/report.js';
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

Template.editPlaceModal.onRendered(function () {
    var slider = new Slider("#ex21", {
        reversed: false,
        rangeHighlights: [{"start": 1, "end": 2, "class": "category1"},
            {"start": 2, "end": 3, "class": "category2"}],
        formatter: function (value) {
            switch (value) {
                case 1:
                    return TAPi18n.__('allowed');
                case 2:
                    return TAPi18n.__('arrangement');
                case 3:
                    return TAPi18n.__('denied');
                default:
                    return TAPi18n.__('error');
            }
        },
    });
    function setSliderColor(){
        var sliderHandle = $('.slider-handle');
        var tickSliderSelection = $('.slider-selection.tick-slider-selection');
        var sliderTick = $('.slider-tick');
        var inSelection = $('.slider-tick.in-selection');
        switch (slider.getValue()) {
            case 1:
                sliderHandle.css('background', '#00ff00');
                tickSliderSelection.css('background', '#bbffbb');
                sliderTick.css('background', '');
                inSelection.css('background', '#75ff75');
                break;
            case 2:
                sliderHandle.css('background', '#FFA500');
                tickSliderSelection.css('background', '#ffe2af');
                sliderTick.css('background', '');
                inSelection.css('background', '#ffcc70');
                break;
            case 3:
                sliderHandle.css('background', '#ff0000');
                tickSliderSelection.css('background', '#ffbbbb');
                sliderTick.css('background', '');
                inSelection.css('background', '#ff7575');
                break;
        }
    }
    setSliderColor();
    slider.on("change", function(slideEvt) {
        setSliderColor()
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
        return pid;
    },
    displayValues() {
        return getPlace();
    },
    getColor: function (flightLight) {

        switch (flightLight) {
            case 1:
                return "green";
            case 2:
                return "orange";
            case 3:
                return "red";
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
                return TAPi18n.__("privateProperty");
            case false:
                return TAPi18n.__("publicProperty");
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

    comments() {
        var pid = FlowRouter.getParam("pid");
        return Comments.find({"place": pid}, {sort: {createdAt: -1}});
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
        return (userId == Meteor.userId());
    }
});

Template.detail.events({

    'click .unlike'() {
        var pid = FlowRouter.getParam("pid");
        Meteor.users.update({_id: Meteor.userId()}, {
            $pull: { 'profile.likes': pid }
        });
    },

    'click .like'() {
        var pid = FlowRouter.getParam("pid");
        Meteor.users.update({_id: Meteor.userId()}, {
            $addToSet: { 'profile.likes': pid }
        });
    },

    'click .edit'() {
        Modal.show('editPlaceModal');
    },

    'click .write-comment'() {
        Modal.show('commentModal');
    },

    'click .upload-photo'() {
        Modal.show('uploadPhotoModal');
    },

    'click .report'() {
        Modal.show('reportModal', getPlace());
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

        Meteor.call('places.update', pid, title, flightLight, privateProperty);

        Modal.hide('editPlaceModal');
    },
});

Template.commentModal.events({
    'submit #commentForm'(event)  {
        event.preventDefault();

        var place = FlowRouter.getParam("pid");
        var comment = event.target.comment.value;
        Meteor.call('comments.insert', place, comment);

        Modal.hide('commentModal');
    }
});


Template.uploadPhotoModal.events({
    'submit .save'(event) {
        event.preventDefault();
        Modal.hide('uploadPhotoModal');
        setTimeout(function(){

            Modal.show('uploadingModal');

            function uploadOptions(image) {
                return {
                    apiKey: '3fc2c494c55efcf',
                    image: image
                };
            }

            var imgurCallback = function (errMsg, imgurData) {
                if (errMsg) return alert('File upload failed. Please upload an image of a smaller file size');
                var place = FlowRouter.getParam("pid");
                var url = imgurData.link;
                var deleteHash = imgurData.deletehash;
                Meteor.call('photos.insert', place, url, deleteHash);
                Modal.hide('uploadingModal');
            };

            if (event.target.photo.files.length != 0) {
                var file = event.target.photo.files[0];
                var reader = new FileReader();
                reader.onload = function (e) {
                    Imgur.upload(uploadOptions(e.target.result), imgurCallback);
                };
                reader.readAsDataURL(file);
            } else {
                Imgur.upload(uploadOptions(event.target.url.value), imgurCallback);
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

