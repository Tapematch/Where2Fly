import {Template} from 'meteor/templating';
import {Places} from '../../api/places.js';
import './feed.html';
import {Photos} from "../../api/photos";
import {Comments} from "../../api/comments";
import {Blaze} from "meteor/blaze";

var visiblemarkers = [];
Template.feed.onCreated(function () {
    var places = Places.find({}, {sort: {createdAt: -1}, limit: 10});

    // We can use the `ready` callback to interact with the map API once the map is ready.
    GoogleMaps.ready('feedMap', function (map) {

        var bounds = new google.maps.LatLngBounds();

        places.observe({
            addedAt(place) {
                var marker = placeMarkerOnMap(place, map);
                bounds.extend(marker.getPosition());
            },
            removedAt(oldPlace) {
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

Template.feed.helpers({
    photos() {
        return Photos.find({}, {sort: {createdAt: -1}, limit: 8});
    },
    comments() {
        return Comments.find({}, {sort: {createdAt: -1}, limit: 8});
    },
    feedMapOptions: function () {
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