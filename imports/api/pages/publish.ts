import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

export const Pages = new Mongo.Collection("pages");

if (Meteor.isServer) {
  Meteor.publish("pages", function pagesPublication() {
    return Pages.find();
  });
  Pages.remove({});
  if (Pages.find().count() === 0) {
    console.log(`startup - clearing default content`);
    
    Pages.insert({
      name: "about",
      heading: Meteor.settings.public.defaultContent.about.heading,
      body: Meteor.settings.public.defaultContent.about.body,
      createdAt: new Date(),
      owner: ""
    });
  }
}
