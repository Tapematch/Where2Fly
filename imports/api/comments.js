import { Mongo } from 'meteor/mongo';
import {Photos} from "./photos";
import {Places} from "./places";

export const Comments = new Mongo.Collection('comments');

Meteor.methods({
    'comments.insert'(place, comment) {
        var user = Meteor.user();
        var username = user.username;
        var owner = user._id;
        Comments.insert({
            username,
            owner,
            place,
            comment,
            createdAt: new Date(), // current time
        });
    },
    'comments.update'(id, comment) {
        Places.update(id, {
            $set: {
                comment
            },
        });
    },
    'comments.remove'(id) {
        Comments.remove(id);
    }
});