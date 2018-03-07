import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import '../../ui/header/header.js';
import '../../ui/footer/footer.js';
import '../../ui/map/map.js';
import '../../ui/placelist/placelist.js';
import '../../ui/profile/profile.js';

FlowRouter.route('/', {
    name: 'home',
    action() {
        console.log("Home");
        BlazeLayout.render('body', { header: 'header', body: 'map', footer: 'footer' });
    },
});

FlowRouter.route('/places', {
    name: 'placelist',
    action() {
        console.log("placelist");
        BlazeLayout.render('body', { header: 'header', body: 'placelist', footer: 'footer' });
    },
});

FlowRouter.route('/profile', {
    name: 'profile',
    action() {
        console.log("profile");
        BlazeLayout.render('body', { header: 'header', body: 'profile', footer: 'footer' });
    },
});