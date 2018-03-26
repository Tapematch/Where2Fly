import { Mongo } from 'meteor/mongo';

export const Places = new Mongo.Collection('places');

Meteor.methods({
    'places.insert'(title, flightLight, privateProperty, lat, lng) {
        if (!Meteor.userId()) {
            throw new Meteor.Error('not-authorized');
        }

        var user = Meteor.user();
        var username = user.username;
        var owner = user._id;

        return Places.insert({
            owner,
            username,
            privateProperty,
            flightLight,
            title,
            lat,
            lng,
            createdAt: new Date(), // current time
        });
    },
    'places.update'(pid, title, flightLight, privateProperty) {
        Places.update(pid, {
            $set: {
                title,
                flightLight,
                privateProperty
            },
        });
    }
});