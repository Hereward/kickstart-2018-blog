import { Meteor } from "meteor/meteor";
import { Images } from "./methods";

if (Meteor.isServer) {
  Images.denyClient();
  Meteor.publish("allImages", function allImages() {
    return Images.find().cursor;
  });
}
