import { Meteor } from "meteor/meteor";
//import { Mongo } from "meteor/mongo";
declare var Mongo: any;

export const Posts = new Mongo.Collection("posts");

if (Meteor.isServer) {
  Meteor.publish("posts", function posts() {
    return Posts.find();
  });

  Meteor.publish("publishedPosts", function postsPublic() {
    return Posts.find({
      $or: [{ publish: true }, { authorId: this.userId }]
    });
  });

  Meteor.startup(() => {});
}
