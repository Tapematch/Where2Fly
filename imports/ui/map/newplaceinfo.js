import { Template } from 'meteor/templating';
import './newplaceinfo.html';


this.searchmarker = null;
this.searchPosition = new ReactiveDict();
Template.newplaceinfo.helpers({
    searchLat() {
        return searchPosition.get("searchLat");
    },
    searchLng() {
        return searchPosition.get("searchLng");
    }
});

Template.newplaceinfo.onRendered(function () {
    var slider = new Slider("#ex22", {
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


Template.newplaceinfo.events({
    'submit .place-form'(event) {
        // Prevent default browser form submit
        event.preventDefault();

        if(event.keyCode == 13) {
            return false;
        }

        // Get value from form element
        const target = event.target;
        const title = target.title.value;
        const lat = searchPosition.get("searchLat");
        const lng = searchPosition.get("searchLng");
        const flightLight = parseInt(target.newflightLight.value);
        const privateProperty = target.newprivateProperty.checked;

        Meteor.call('places.insert', title, flightLight, privateProperty, lat, lng, (error, result) => {
            searchmarker.setMap(null);
            searchmarker = null;
            FlowRouter.go('/place/' + result);
        });

    },
});