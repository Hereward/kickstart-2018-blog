import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

export const Pages = new Mongo.Collection("pages");

if (Meteor.isServer) {
  Meteor.publish("pages", function pagesPublication() {
    return Pages.find();
  });

  Meteor.startup(function() {
    if (Pages.find().count() === 0) {
      Pages.insert({
        name: "about",
        heading: "About Page",
        body: "<div> This is the About page.</>",
        createdAt: new Date(),
        owner: ""
      });
      Pages.insert({
        name: "home",
        heading: "Home Page",
        body: "<div> This is the Home page.</>",
        createdAt: new Date(),
        owner: ""
      });
    }
  });
}
