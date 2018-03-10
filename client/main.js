import 'bootstrap-sass';
import '/imports/startup/client/routes.js';
import '/imports/startup/client/accounts.js';

if (Meteor.isClient) {
    Meteor.startup(function() {
        GoogleMaps.load({key: 'AIzaSyAfg1bHhw_1xJzHVBcHoVy7TKbGizKQCUM', libraries: 'places,geometry'});
    });
}