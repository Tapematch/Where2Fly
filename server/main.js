import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email'
import { Places } from '../imports/api/places.js';
import { Photos } from '../imports/api/photos.js';
import {Comments} from '../imports/api/comments.js';

Meteor.methods({
    report(reason, object) {
        var text = "Someone reported an entry from Where2Fly.net!<br>Reason: " + reason + "<br>Object: " + JSON.stringify(object);

        this.unblock();
        Email.send({ to: 'philtaubert95@gmail.com', from: 'report@where2fly.net', subject: 'New report from Where2Fly.net', text });
    }
});
