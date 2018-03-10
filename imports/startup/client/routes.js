import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import '../../ui/header/header.js';
import '../../ui/login/login.js';
import '../../ui/footer/footer.js';
import '../../ui/detail/detail.js';
import '../../ui/map/map.js';
import '../../ui/feed/feed.js';
import '../../ui/profile/profile.js';

FlowRouter.route('/', {
    name: 'home',
    action() {
        console.log("Home");
        BlazeLayout.render('body', {header: 'header', body: 'map', footer: 'footer'});
    },
});

FlowRouter.route('/login', {
    name: 'login',
    action() {
        console.log("Login");
        BlazeLayout.render('body', {header: 'header', body: 'login', footer: 'footer'});
    },
});

FlowRouter.route('/logout', {
    name: 'login',
    action() {
        console.log("Logout");
        Meteor.logout();
        FlowRouter.go('/');
    },
});

FlowRouter.route('/feed', {
    name: 'feed',
    action() {
        console.log("placelist");
        BlazeLayout.render('body', { header: 'header', body: 'feed', footer: 'footer' });
    },
});

FlowRouter.route('/profile', {
    name: 'profile',
    action() {
        console.log("profile");
        BlazeLayout.reset();
        BlazeLayout.render('body', { header: 'header', body: 'profile', footer: 'footer' });
    },
});

FlowRouter.route('/place/:pid', {
    name: 'details',
    action() {
        console.log("detail");
        BlazeLayout.render('body', {header: 'header', body: 'detail', footer: 'footer'});
    },
});