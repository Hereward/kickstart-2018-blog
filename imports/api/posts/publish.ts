import { Meteor } from "meteor/meteor";
//import { Mongo } from "meteor/mongo";
declare var Mongo: any;

export const Posts = new Mongo.Collection("posts");

if (Meteor.isServer) {
  Meteor.publish("posts", function pagesPublication() {
    return Posts.find();
  });

  Meteor.startup(() => {
    
  });
}
