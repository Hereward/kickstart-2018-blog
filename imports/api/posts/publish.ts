import { Meteor } from "meteor/meteor";
//import { Mongo } from "meteor/mongo";
declare var Mongo: any;

export const Posts = new Mongo.Collection("posts");

if (Meteor.isServer) {
  Meteor.publish("posts", function pagesPublication() {
    return Posts.find();
  });

  Meteor.startup(() => {
    const myPosts = Posts.find();
    if (!myPosts.count()) {
      Posts.insert({
        summary: Meteor.settings.public.defaultContent.about.title,
        image_id: "",
        slug: "about",
        title: Meteor.settings.public.defaultContent.about.title,
        body: Meteor.settings.public.defaultContent.about.body,
        allowComments: false,
        closeComments: false,
        modified: new Date(),
        published: new Date(),
      });
    }
  });
}
