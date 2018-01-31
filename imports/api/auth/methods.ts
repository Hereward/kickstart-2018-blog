import { SimpleSchema } from 'meteor/aldeed:simple-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Auth } from './publish';


export const createAuth = new ValidatedMethod({
    name: 'auth.create',

    validate: new SimpleSchema({
      owner: { type: String },
    }).validator(),

    run(fields) {

      console.log(`METHODS: auth.create fields.owner = [${fields.owner}] this.userId = [${this.userId}]`);
      if (!this.userId || this.userId !== fields.owner ) {
        console.log(`createAuth: not-authorized`);
        throw new Meteor.Error('not-authorized');
      }

      Auth.insert({
        verified: false,
        currentAttempts: 0,
        private_key: null,
        verificationEmailSent: 0,
        owner: fields.owner
      });
      console.log(`auth.create - DONE!`);
    }
  });

  export const setPrivateKey = new ValidatedMethod({
    name: 'auth.setPrivateKey',

    validate: new SimpleSchema({
      private_key: { type: String },
    }).validator(),

    run(fields) {
      let ownerId = this.userId;
      let authRecord: any;
      authRecord = Auth.findOne( { "owner": ownerId } );
      //let count = authQuery.count();
      //authRecord = authQuery.fetch();

      //console.log(`authRecord`, authRecord);
      //console.log(`METHODS: auth.setPrivateKey fields.private_key = [${fields.private_key}] authRecord._id = [${authRecord._id}] `);


      if (!ownerId || !authRecord) {
        console.log(`setPrivateKey: not-authorized`);
        throw new Meteor.Error('not-authorized');
      }

      Auth.update(authRecord._id, { $set: { private_key: fields.private_key } });
      console.log(`auth.setPrivateKey - DONE!`);
    }
  });

  export const setVerified = new ValidatedMethod({
    name: 'auth.setVerified',

    validate: new SimpleSchema({
      verified: { type: Boolean },
    }).validator(),

    run(fields) {
      let ownerId = this.userId;
      let authRecord: any;
      authRecord = Auth.findOne( { "owner": ownerId } );
      
      //console.log(`auth.setVerified: authRecord`, authRecord);
      // console.log(`METHODS: auth.setverified fields.verified = [${fields.verified}] authRecord._id = [${authRecord._id}] `);
     
      if (!ownerId || !authRecord) {
        console.log(`setPrivateKey: not-authorized`);
        throw new Meteor.Error('not-authorized');
      }

      Auth.update(authRecord._id, { $set: { verified: fields.verified } });
      console.log(`auth.setVerified - DONE!`);
    }


  });