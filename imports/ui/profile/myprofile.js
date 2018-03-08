import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze'
import { Tracker } from 'meteor/tracker'
import { Places } from "../../api/places.js";
import './myprofile.html';
import '../map/placeinfo.js';

var visiblemarkers = [];

Template.myprofile.onCreated(function () {
    var userId = Meteor.user()._id;
    console.log(userId);
    var places = Places.find({"owner": userId});
    console.log(places.count());

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

Template.myprofile.onRendered(function () {
    GoogleMaps.load({key: 'AIzaSyAfg1bHhw_1xJzHVBcHoVy7TKbGizKQCUM'});
});

Template.myprofile.helpers({
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
    }
});