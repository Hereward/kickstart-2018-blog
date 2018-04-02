import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { FilesCollection } from "meteor/ostrio:files";
import axios from "axios";
import * as ProfileMethods from "./methods";
import * as User from "../../modules/user";

export const Images = new FilesCollection({
  debug: true,
  collectionName: "Images",
  allowClientCode: false,
  storagePath: Meteor.settings.public.images.storagePath,
  permissions: 0o774,
	parentDirPermissions: 0o774,
  onBeforeUpload: function(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 1024 * 1024 * 10 && /png|jpg|jpeg/i.test(file.extension)) {
      return true;
    } else {
      return "Please upload image, with size equal or less than 10MB";
    }
  }
});

Meteor.methods({
  RemoveFile(fileId) {
    check(fileId, String);

    if (!User.id()) {
      throw new Meteor.Error("not-authorized");
    }

    Images.remove({ _id: fileId }, function remove(error) {
      if (error) {
        console.error("File wasn't removed, error: " + error.reason);
      } else {
        console.info("File successfully removed");
      }
    });
  },

  RenameFile(fileId) {
    check(fileId, String);
  },
  getImage(resourceID, myUrl) {
    check(resourceID, String);
    check(myUrl, String);
    let url = myUrl || "http://placehold.it/800x450";
    console.log("Fetching image from: " + url);

    axios({
      method: "get",
      url: url,
      responseType: "arraybuffer"
    })
      .then(function writeImageData(response) {
        Images.write(
          response.data,
          {
            fileName: "sample.png",
            type: "image/png"
          },
          function writeImageDataResult(error, fileRef) {
            if (error) {
              throw error;
            } else {
              console.log(
                `${fileRef.name}
                     is successfully saved to FS. _id:  
                    ${fileRef._id}`
              );

              Meteor.call("profileImage.update", { id: resourceID, image_id: fileRef._id });
            }
          },
          false
        );
      })
      .catch(function writeImageDataError(error) {
        console.log(error);
      });
  }
});
