import { Meteor } from "meteor/meteor";
import { ProfileImages, EditorialImages } from "./methods";

if (Meteor.isServer) {
  ProfileImages.denyClient();
  Meteor.publish("profileImages", function profileImages() {
    return ProfileImages.find().cursor;
  });

  EditorialImages.denyClient();
  Meteor.publish("editorialImages", function editorialImages() {
    return EditorialImages.find().cursor;
  });
}
