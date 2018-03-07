import { FlowRouter } from 'meteor/kadira:flow-router';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import '../../ui/header/header.js';
import '../../ui/footer/footer.js';
import '../../ui/detail/detail.js';
import '../../ui/map/map.js';
import '../../ui/placelist/placelist.js';

FlowRouter.route('/', {
    name: 'home',
    action() {
        console.log("Home");
        BlazeLayout.render('body', {header: 'header', heroimage: 'map', body: '', footer: 'footer'});
    },
});

FlowRouter.route('/places', {
    name: 'placelist',
    action() {
        console.log("placelist");
        BlazeLayout.render('body', { header: 'header', body: 'placelist', footer: 'footer' });
    },
});

FlowRouter.route('/place/:_id', {
    name: 'details',
    action() {
        console.log("detail");
        BlazeLayout.render('body', {header: 'header', heroimage: 'map', body: 'detail', footer: 'footer'});
    },
});