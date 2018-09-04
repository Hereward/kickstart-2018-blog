//import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { can as userCan, can } from "../../modules/user";

declare var Mongo: any;

export const Profiles = new Mongo.Collection("profiles");

if (Meteor.isServer) {
  Meteor.publish("profiles.public", function profilesPublicSubscription() {
    return Profiles.find(
      {},
      {
        fields: {
          screenName: 1,
          about: 1,
          fname: 1,
          initial: 1,
          lname: 1,
          owner: 1,
          avatarId: 1
        }
      }
    );
  });

  Meteor.publish("profiles", function profilesSubscription() {
    if (!this.userId) {
      return this.ready();
    }

    const options = can({threshold: "super-admin"}) ? {} : { owner: this.userId };

    return Profiles.find(
      options,
      {
        fields: {
          screenName: 1,
          about: 1,
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
          avatarId: 1,
          new: 1,
          created: 1,
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
