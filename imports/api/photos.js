import { Mongo } from 'meteor/mongo';

export const Photos = new Mongo.Collection('photos');

Meteor.methods({
    'photos.insert'(place, url, deleteHash) {
        var user = Meteor.user();
        var username = user.username;
        var owner = user._id;
        Photos.insert({
            username,
            owner,
            place,
            url,
            deleteHash,
            createdAt: new Date(), // current time
        });
    },
    'photos.remove'(deleteHash, id) {
        if (deleteHash != undefined) {
            var options = {
                apiKey: '3fc2c494c55efcf',
                deleteHash: deleteHash
            };
            Imgur.delete(options, function (errMsg, imgurData) {
                if (errMsg)
                    console.log(errMsg);
                else
                    console.log('Imgur Photo deleted');
            });
        }
        Photos.remove(id);
    }
});