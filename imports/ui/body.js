import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';
import { Blaze } from 'meteor/blaze'
import { Places } from '../api/places.js';
import './placeinfo.js';
import './newplaceinfo.js';
import './body.html';


var visiblemarkers = [];

function placeMarkerOnMap(place, map) {
    var myLatlng = new google.maps.LatLng(place.lat, place.lng);
    var marker = new google.maps.Marker({
        position: myLatlng,
        map: map.instance,
        animation: google.maps.Animation.DROP,
        title: place.title
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

function deleteMarker(place) {
    visiblemarkers.forEach(function(marker) {
        if (marker.id === place._id) {
            marker.setMap(null);
        }
    });
}

function setSearchMarker(marker) {
    newPlaceMarker = marker;
    searchPosition.set("searchLat", marker.getPosition().lat());
    searchPosition.set("searchLng", marker.getPosition().lng());
}

Template.body.onCreated(function() {
    // We can use the `ready` callback to interact with the map API once the map is ready.
    GoogleMaps.ready('placesMap', function(map) {
        //add markers from mongodb
        var bounds = new google.maps.LatLngBounds();
        const places = Places.find({});

        places.forEach((place) => {
            var marker = placeMarkerOnMap(place, map);
            bounds.extend(marker.getPosition());
        });
        map.instance.fitBounds(bounds);
        places.observe({
            added(place) {
                placeMarkerOnMap(place, map);
            },
            removed(oldPlace) {
                deleteMarker(oldPlace);
            }
        });

        // Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        map.instance.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // Bias the SearchBox results towards current map's viewport.
        map.instance.addListener('bounds_changed', function() {
            searchBox.setBounds(map.instance.getBounds());
        });

        var searchmarker;
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function() {
            var places = searchBox.getPlaces();

            if (places.length == 0) {
                return;
            }

            if(searchmarker != null)
                searchmarker.setMap(null);
            searchmarker = null;

            // For each place, get the icon, name and location.
            var bounds = new google.maps.LatLngBounds();
            var place = places[0];
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }

            var symbolThree = {
                path: 'M -6,-6 6,6 M 6,-6 -6,6',
                strokeColor: '#292',
                strokeWeight: 3
            };
            searchmarker = new google.maps.Marker({
                map: map.instance,
                icon: symbolThree,
                draggable:true,
                title: place.name,
                position: place.geometry.location
            });
            setSearchMarker(searchmarker);
            searchmarker.addListener('dragend', function()
            {
                setSearchMarker(searchmarker);
            });

            var contentString = '<div id="newPlaceinfo"></div>';
            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });
            infowindow.open(map.instance, searchmarker);

            var newPlace = {title: place.name, lat: place.geometry.location.lat, lng: place.geometry.location.lng};
            Blaze.renderWithData(Template.newplaceinfo, {place: newPlace}, document.getElementById("newPlaceinfo"));

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.instance.fitBounds(bounds);
    });
});


Template.body.onRendered(function() {
    GoogleMaps.load({key: 'AIzaSyAfg1bHhw_1xJzHVBcHoVy7TKbGizKQCUM', libraries: 'places'});
});

Template.body.helpers({
    places() {
        return Places.find({});
    },
    placesMapOptions: function() {
        // Make sure the maps API has loaded
        if (GoogleMaps.loaded()) {
            // Map initialization options
            return {
                center: new google.maps.LatLng(0, 0),
                zoom: 1
            };
        }
    }
});