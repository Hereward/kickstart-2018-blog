import { Meteor } from "meteor/meteor";
import { ProfileImages, EditorialImages, AvatarImages } from "./methods";

if (Meteor.isServer) {
  ProfileImages.denyClient();
  Meteor.publish("profileImages", function profileImages() {
    return ProfileImages.find().cursor;
  });

  EditorialImages.denyClient();
  Meteor.publish("editorialImages", function editorialImages() {
    return EditorialImages.find().cursor;
  });

  AvatarImages.denyClient();
  Meteor.publish("avatarImages", function avatarImages() {
    return AvatarImages.find().cursor;
  });
}
