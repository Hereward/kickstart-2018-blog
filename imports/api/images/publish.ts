//import { Mongo } from "meteor/mongo";
//import { FilesCollection } from "meteor/ostrio:files";
//import axios from "axios";
//import * as ProfileMethods from "./methods";
import { Meteor } from "meteor/meteor";
import { Images } from "./methods";

//declare var Images:any;
//declare var Meteor: any;

// Meteor.Files

/*
export const Images = new FilesCollection({
  debug: true,
  collectionName: "Images",
  allowClientCode: false, // Disallow remove files from Client
  storagePath: "../../../../../.storage/images",
  onBeforeUpload: function(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 1024 * 1024 * 10 && /png|jpg|jpeg/i.test(file.extension)) {
      return true;
    } else {
      return "Please upload image, with size equal or less than 10MB";
    }
  }
});
*/

if (Meteor.isServer) {
  Images.denyClient();
  Meteor.publish("allImages", function allImages() {
    return Images.find().cursor;
  });
}


