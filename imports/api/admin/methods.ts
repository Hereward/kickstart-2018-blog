///<reference path="../../../index.d.ts"/>
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Auth } from "../auth/publish";
import { userSessions } from "../sessions/publish";
import { Profiles } from "../profiles/publish";
import { Images } from "../images/methods";

const authCheck = (methodName, userId) => {
  let auth = false;
  if (userId) {
    let email = Meteor.user().emails[0].address;

    if (email === Meteor.settings.private.adminEmail) {
      auth = true;
    }
  }

  if (!auth) {
    console.log(`authCheck (${methodName}) - NOT AUTHORISED FOR ADMIN`);
    throw new Meteor.Error(
      `not-authorized for admin [${methodName}]`,
      "Must be administrator to access this function."
    );
  }
  return auth;
};

export const deleteUser = new ValidatedMethod({
  name: "admin.deleteUser",
  validate: null,
  run(fields) {
    if (!this.isSimulation) {
      authCheck("admin.deleteUser", this.userId);
      Meteor.users.remove(fields.id);
    }
    return true;
  }
});

export const deleteAllUsers = new ValidatedMethod({
  name: "admin.deleteAllUsers",
  validate: null,

  run(fields) {
    if (!this.isSimulation) {
      authCheck("admin.deleteAllUsers", this.userId);

      let profileRecord: any;
      profileRecord = Profiles.findOne({ owner: this.userId });
      let imageId = profileRecord.image_id;

      let email = Meteor.user().emails[0].address;
      Meteor.users.remove({ _id: { $ne: this.userId } });
      Auth.remove({ owner: { $ne: this.userId } });
      userSessions.remove({ owner: { $ne: this.userId } });
      Profiles.remove({ owner: { $ne: this.userId } });

      if (imageId) {
        let imagesCursor = Images.find({ _id: { $ne: imageId } });
        let imagesCount = imagesCursor.count();
        let imagesArray = imagesCursor.fetch();

        if (imagesCount) {
          console.log(`deleteAllUsers - image found! [${imagesCount}]`, imagesArray);
          Images.remove({ _id: { $ne: imageId } }, function remove(error) {
            if (error) {
              console.error("IMAGE File wasn't removed, error: " + error.reason);
            } else {
              console.info("IMAGE File successfully removed");
            }
          });
        }
      }
    }

    console.log(`admin.deleteAllUsers -DONE!`);

    return true;
  }
});
