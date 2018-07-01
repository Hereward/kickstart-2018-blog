//import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

declare var Mongo: any;

export const Profiles = new Mongo.Collection("profiles");

if (Meteor.isServer) {
  Meteor.publish("profiles", function profilesPublication() {
    if (!this.userId) return this.ready();
    //return Profiles.find({ owner: this.userId });

    return Profiles.find(
      { owner: this.userId },
      {
        fields: {
          fname: 1,
          initial: 1,
          lname: 1,
          dob: 1,
          street1: 1,
          street2: 1,
          city: 1,
          region: 1,
          postcode: 1,
          country: 1,
          image_id: 1,
          verificationEmailSent: 1,
          new: 1,
          createdAt: 1,
          owner: 1
        }
      }
    );
  });

  Profiles.deny({
    insert() {
      return true;
    },
    update() {
      return true;
    },
    remove() {
      return true;
    }
  });
}
