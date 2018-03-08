import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze'
import { Places } from '../../api/places.js';
import '../map/placeinfo.js';
import './detail.html';


Template.detail.onCreated(function () {
    var pid = FlowRouter.getParam("pid");

    place = Places.findOne({_id: pid});

    // We can use the `ready` callback to interact with the map API once the map is ready.
    GoogleMaps.ready('detailMap', function (map) {
        var bounds = new google.maps.LatLngBounds();
        var marker = placeMarkerOnMap(place, map);
        bounds.extend(marker.getPosition());
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
    place = Places.findOne({_id: pid});
    return place;
}

Template.detail.helpers({
    displayID() {

        var pid = FlowRouter.getParam("pid");
        console.log("PID von details.js: " + pid);
        return pid;
    },
    displayValues(){
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
    }
});

Template.detail.events({

    'click .edit'() {
        Modal.show('editPlaceModal');
    },

    'click .delete'() {
        var pid = FlowRouter.getParam("pid");
        Places.remove(pid);

        FlowRouter.go('/');
    },
});

Template.detail.onRendered(function () {
    GoogleMaps.load({key: 'AIzaSyAfg1bHhw_1xJzHVBcHoVy7TKbGizKQCUM'});
});


Template.editPlaceModal.helpers({
    displayValues(){
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