import 'bootstrap-sass';
import '/imports/startup/client/routes.js';
import '/imports/startup/client/accounts.js';

const userLanguage = () => {
    // If the user is logged in, retrieve their saved language
    if (Meteor.user()) return Meteor.user().profile.language;
};

if (Meteor.isClient) {
    Meteor.startup(function() {
        GoogleMaps.load({key: 'AIzaSyAfg1bHhw_1xJzHVBcHoVy7TKbGizKQCUM', libraries: 'places,geometry'});
        Tracker.autorun(() => {
            let lang;

            // URL Language takes priority
            const urlLang = FlowRouter.getQueryParam('lang');
            if (urlLang) {
                lang = urlLang;
            } else if (userLanguage()) {
                // User language is set if no url lang
                lang = userLanguage();
            } else {
                // If no user language, try setting by browser (default en)
                const localeFromBrowser = window.navigator.userLanguage || window.navigator.language;
                let locale = 'en';

                if (localeFromBrowser.match(/en/)) locale = 'en';
                if (localeFromBrowser.match(/de/)) locale = 'de';

                lang = locale;
            }
            TAPi18n.setLanguage(lang);
            T9n.setLanguage(lang);
        });
    });

    TAPi18n._afterUILanguageChange = function () {
        var lang = TAPi18n.getLanguage()
        T9n.setLanguage(lang);
        Meteor.users.update({_id: Meteor.userId()}, {
            $set: {
                'profile.language': lang
            }
        });
    }
}