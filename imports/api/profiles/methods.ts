import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Profiles } from './publish';

export const createProfile = new ValidatedMethod({

    name: 'profiles.create',

    validate: new SimpleSchema({
      fname: { type: String },
      initial: { type: String },
      lname: { type: String },
    }).validator(),

    run() {

      
      console.log(`profiles.create [SERVER]`);
      if (!this.userId) {
        throw new Meteor.Error('not-authorized');
      }

      Profiles.insert({
        fname: "Adolf",
        initial: "K",
        lname: "Hitler",
        street1: "",
        street2: "",
        city: "",
        region: "",
        postcode: "",
        country: "",
        createdAt: new Date(),
        owner: this.userId
      });

      console.log(`profiles.create - DONE!`);
    }
  });

