import './placeinfo.html';

Template.placeinfo.helpers({
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
                return TAPi18n.__("privateProperty");
            case false:
                return TAPi18n.__("publicProperty");
        }
    },
});