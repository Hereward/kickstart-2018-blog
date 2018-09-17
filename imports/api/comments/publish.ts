import { Meteor } from "meteor/meteor";
declare var Mongo: any;

export const Comments = new Mongo.Collection("comments");

if (Meteor.isServer) {
  Meteor.publish("comments", function pagesPublication() {
    return Comments.find();
  });

  Meteor.startup(() => {
    
  });
}
