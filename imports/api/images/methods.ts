import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { FilesCollection } from "meteor/ostrio:files";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import axios from "axios";
import * as ProfileMethods from "./methods";
import * as User from "../../modules/user";

const imagesCollection = (name = "test") => {
  const path = `${Meteor.settings.public.images.storagePath}/${name}`;
  return new FilesCollection({
    debug: false,
    collectionName: name,
    allowClientCode: false,
    storagePath: path,
    permissions: 0o774,
    parentDirPermissions: 0o774,
    onBeforeUpload: function onBeforeUpload(file) {
      // Allow upload files under 10MB, and only in png/jpg/jpeg formats
      if (file.size <= 1024 * 1024 * 10 && /png|jpg|jpeg/i.test(file.extension)) {
        return true;
      } else {
        return "Please upload image, with size equal or less than 10MB";
      }
    }
  });
};

export const ProfileImages = imagesCollection("profile");
export const EditorialImages = imagesCollection("editorial");

function resolveImageSource(label) {
  switch (label) {
    case "editorial":
      return EditorialImages;
    case "profile":
      return ProfileImages;
    default:
      return EditorialImages;
  }
}

const authCheck = (methodName, userId) => {
  let auth = true;
  if (!userId) {
    auth = false;
    console.log(`authCheck (${methodName}) - NO USER ID`);
    throw new Meteor.Error(`not-authorized [${methodName}]`, "Must be logged in to access this function.");
  }
  return auth;
};

export const findOne = new ValidatedMethod({
  name: "images.findOne",

  validate: new SimpleSchema({
    id: { type: String }
  }).validator(),

  run(fields) {
    authCheck("images.findOne", this.userId);
    const fileCursor = EditorialImages.findOne({ _id: fields._id });
    log.info(`findOne - server`, fields, fileCursor);
    return fileCursor;
  }
});

/*
export const Images = new FilesCollection({
  debug: true,
  collectionName: "Images",
  allowClientCode: false,
  storagePath: Meteor.settings.public.images.storagePath,
  permissions: 0o774,
	parentDirPermissions: 0o774,
  onBeforeUpload: function onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg formats
    if (file.size <= 1024 * 1024 * 10 && /png|jpg|jpeg/i.test(file.extension)) {
      return true;
    } else {
      return "Please upload image, with size equal or less than 10MB";
    }
  }
});
*/

export const removeImage = new ValidatedMethod({
  name: "image.remove",
  validate: new SimpleSchema({
    id: { type: String },
    dataSource: { type: String }
  }).validator(),

  run(fields) {
    authCheck("image.remove", this.userId);
    log.info(`image.remove`, fields);

    if (!this.isSimulation) {
      const ImagesObj = resolveImageSource(fields.dataSource);

      ImagesObj.remove({ _id: fields.id }, function remove(error) {
        if (error) {
          log.error("Image wasn't removed, error: " + error.reason);
        } else {
          log.info("Image successfully removed");
        }
      });
    }

    //source = fields.dataSource ? fields.dataSource :

    return true;
  }
});

/*
removeImage(fileId, Images) {
    authCheck("removeImage", this.userId);
    check(fileId, String);
    check(Images, Object);

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
  */

Meteor.methods({
  RenameFile(fileId, Images) {
    authCheck("RenameFile", this.userId);
    check(fileId, String);
    check(Images, Object);
  },
  getImage(resourceID, myUrl, Images) {
    authCheck("getImage", this.userId);
    check(resourceID, String);
    check(Images, Object);
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
