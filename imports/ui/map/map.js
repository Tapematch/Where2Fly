import {Template} from 'meteor/templating';
import {ReactiveDict} from 'meteor/reactive-dict';
import {Blaze} from 'meteor/blaze'
import {Tracker} from 'meteor/tracker'
import {Places} from '../../api/places.js';
import './placeinfo.js';
import './newplaceinfo.js';
import './map.html';

var instance;
var visiblemarkers = [];

Template.map.onCreated(function () {
    instance = this;
    instance.state = new ReactiveDict();
    var globalMap;
    var placeIds = [];
    //get places from db
    var places = [];
    Tracker.autorun(() => {
        var flightLightFilters = [];
        if (instance.state.get('flightLight1')) {
            flightLightFilters.push({"flightLight": 1})
        }
        if (instance.state.get('flightLight2')) {
            flightLightFilters.push({"flightLight": 2})
        }
        if (instance.state.get('flightLight3')) {
            flightLightFilters.push({"flightLight": 3})
        }
        var privatePropertyFilter = {};
        switch (instance.state.get('privateProperty')) {
            case "true":
                privatePropertyFilter = {"privateProperty": true};
                break;
            case "false":
                privatePropertyFilter = {"privateProperty": false};
                break;
            default:
                break;
        }
        var filter = {};
        if (flightLightFilters.length > 0) {
            filter = {$or: flightLightFilters};
        }
        places = Places.find({$and: [privatePropertyFilter, filter]});
        console.log(places.count());
        if (globalMap !== undefined) {
            var newPlaceIds = [];
            places.forEach((place) => {
                var id = place._id;
                newPlaceIds.push(id);
                if (!placeIds.includes(id)) {
                    placeMarkerOnMap(place, globalMap);
                    placeIds.push(id);
                }
            });
            var removedPlaceIds = [];
            placeIds.forEach(function (placeId) {
                if (!newPlaceIds.includes(placeId)) {
                    deleteMarker(placeId)
                    removedPlaceIds.push(placeId);
                }
            });
            removedPlaceIds.forEach(function (placeId) {
                placeIds.splice(placeIds.indexOf(placeId), 1);
            });
        }
    });

    // We can use the `ready` callback to interact with the map API once the map is ready.
    GoogleMaps.ready('placesMap', function (map) {
        globalMap = map;
        var bounds = new google.maps.LatLngBounds();
        places.observe({
            added(place) {
                placeIds.push(place._id);
                var marker = placeMarkerOnMap(place, map);
                bounds.extend(marker.getPosition());
            },
            removed(oldPlace) {
                deleteMarker(oldPlace._id);
                placeIds.splice(placeIds.indexOf(oldPlace._id), 1);
            }
        });
        map.instance.fitBounds(bounds);

        // Create the search box and link it to the UI element.
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        input.index = 1;
        map.instance.controls[google.maps.ControlPosition.LEFT_TOP].push(input);

        // Bias the SearchBox results towards current map's viewport.
        map.instance.addListener('bounds_changed', function () {
            searchBox.setBounds(map.instance.getBounds());
        });
        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', function () {
            var places = searchBox.getPlaces();
            if (places.length == 0) {
                return;
            }
            var place = places[0];
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            var location = place.geometry.location;
            setNewMarker(map, location, place.name);
        });
        map.instance.addListener('click', function (event) {
            setNewMarker(map, event.latLng, "new Place");
        });

        var geolocationControlDiv = document.createElement('div');
        var geolocationControl = new GeolocationControl(geolocationControlDiv, map);

        geolocationControlDiv.index = 2;
        map.instance.controls[google.maps.ControlPosition.LEFT_TOP].push(geolocationControlDiv);

        var filterControlDiv = document.createElement('div');
        var filterControl = new FilterControl(filterControlDiv);

        filterControlDiv.index = 3;
        map.instance.controls[google.maps.ControlPosition.LEFT_TOP].push(filterControlDiv);

        var filterDiv = document.createElement('div');
        filterDiv.id = "filter";

        filterDiv.index = 4;
        map.instance.controls[google.maps.ControlPosition.LEFT_TOP].push(filterDiv);


        map.instance.fitBounds(bounds);
    });
});

Template.map.helpers({
    placesMapOptions: function () {
        // Make sure the maps API has loaded
        if (GoogleMaps.loaded()) {
            // Map initialization options
            return {
                center: new google.maps.LatLng(0, 0),
                zoom: 1,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.DEFAULT,
                    position: google.maps.ControlPosition.TOP_CENTER
                },
            };
        }
    }
});

Template.filter.events({
    'change .flightLight1 input'(event) {
        instance.state.set('flightLight1', event.target.checked);
    },
    'change .flightLight2 input'(event) {
        instance.state.set('flightLight2', event.target.checked);
    },
    'change .flightLight3 input'(event) {
        instance.state.set('flightLight3', event.target.checked);
    },
    'change .privatePropertyFilter': function (event) {
        instance.state.set('privateProperty', event.target.value);
    }
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

function findClosestMarker(location) {
    var lowestDistance = 999999999999;
    var marker;
    for (i = 0; i < visiblemarkers.length; i++) {
        var distance = google.maps.geometry.spherical.computeDistanceBetween(location, visiblemarkers[i].getPosition());
        if (distance < lowestDistance) {
            lowestDistance = distance;
            marker = visiblemarkers[i];
        }
    }
    console.log(marker.title);
    console.log(lowestDistance);
    //only open marker if closer than 100m
    if (lowestDistance < 100) {
        return marker;
    } else {
        return null;
    }
}

function setSearchPosition(marker) {
    searchPosition.set("searchLat", marker.getPosition().lat());
    searchPosition.set("searchLng", marker.getPosition().lng());
}

function setNewMarker(map, location, name) {
    resetFilter();
    var marker = findClosestMarker(location);
    if (marker != null) {
        //open infowindow of closest marker
        google.maps.event.trigger(marker, 'click');
    } else {
        //create new marker
        setSearchMarker(map, location, name)
    }
    map.instance.setCenter(location);
}

function setSearchMarker(map, location, name) {
    if (searchmarker != null)
        searchmarker.setMap(null);
    searchmarker = null;

    var image = '/img/marker-icon-new.png';
    searchmarker = new google.maps.Marker({
        map: map.instance,
        icon: image,
        draggable: true,
        title: name,
        position: location
    });
    setSearchPosition(searchmarker);
    searchmarker.addListener('dragend', function () {
        setSearchPosition(searchmarker);
    });

    var contentString = '<div id="newPlaceinfo"></div>';
    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });
    infowindow.addListener('closeclick', function () {
        searchmarker.setMap(null);
        searchmarker = null;
    });
    infowindow.open(map.instance, searchmarker);

    var newPlace = {title: name, lat: location.lat, lng: location.lng};
    Blaze.renderWithData(Template.newplaceinfo, {place: newPlace}, document.getElementById("newPlaceinfo"));
}

var filterTemplate;
var controlText;

function resetFilter() {
    if (filterTemplate !== undefined) {
        document.querySelector(".flightLight1 input").checked = false;
        instance.state.set('flightLight1', false);
        document.querySelector(".flightLight2 input").checked = false;
        instance.state.set('flightLight2', false);
        document.querySelector(".flightLight3 input").checked = false;
        instance.state.set('flightLight3', false);
        document.querySelector("input#both").checked = true;
        instance.state.set('privateProperty', "both");
        Blaze.remove(filterTemplate);
        filterTemplate = undefined;
        controlText.innerHTML = 'Open Filter';
    }
}

function FilterControl(controlDiv, state) {

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.margin = '12px 0 0 12px';
    controlUI.style.padding = '0 5px 0 5px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to open filters';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    controlText = document.createElement('div');
    controlText.style.color = '#333';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '15px';
    controlText.style.fontWeight = '300';
    controlText.style.lineHeight = '32px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Open Filter';
    controlUI.appendChild(controlText);

    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener('click', function () {
        if (filterTemplate === undefined) {
            filterTemplate = Blaze.renderWithData(Template.filter, {state}, document.getElementById("filter"));
            controlText.innerHTML = 'Reset Filter';
        } else {
            resetFilter();
        }
    });

}

function GeolocationControl(controlDiv, map) {

    // Set CSS for the control border.
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#fff';
    controlUI.style.border = '2px solid #fff';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.margin = '12px 0 0 12px';
    controlUI.style.padding = '0 5px 0 5px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to find your location';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior.
    var controlText = document.createElement('div');
    controlText.style.color = '#333';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '15px';
    controlText.style.fontWeight = '300';
    controlText.style.lineHeight = '32px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = '<i class="fa fa-crosshairs" aria-hidden="true"></i>';
    controlUI.appendChild(controlText);

    // Setup the click event listeners: simply set the map to Chicago.
    controlUI.addEventListener('click', function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                setNewMarker(map, location, 'new Place');
            }, function () {
                handleLocationError(true);
            });
        } else {
            // Browser doesn't support Geolocation
            handleLocationError(false);
        }

        function handleLocationError(browserHasGeolocation) {
            alert(browserHasGeolocation ?
                'Error: The Geolocation service failed.' :
                'Error: Your browser doesn\'t support geolocation.');
        }
    });

}

