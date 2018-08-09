import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Tasks } from "./publish";

let task: any;

const authCheck = (methodName, userId) => {
  let auth = true;
  if (!userId) {
    auth = false;
    console.log(`authCheck (${methodName}) - NO USER ID`);
    throw new Meteor.Error(`not-authorized [${methodName}]`, "Must be logged in to access this function.");
  }
  return auth;
};

export const wipeContent = new ValidatedMethod({
  name: "tasks.wipeContent",
  validate: new SimpleSchema({}).validator(),
  run() {
    authCheck("tasks.wipeContent", this.userId);
    if (!this.isSimulation) {
      Tasks.remove({ owner: this.userId, private: false });
      return true;
    }
  }
});

export const refreshDefaultContent = () => {
  wipeContent.call({}, err => {
    if (err) {
      console.log(`tasks wipeContent failed`, err);
    }
  });
};

export const create = new ValidatedMethod({
  name: "tasks.create",
  validate: new SimpleSchema({
    text: { type: String }
  }).validator(),
  run(fields) {
    authCheck("tasks.create", this.userId);
    let text = fields.text;
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    Tasks.insert({
      text: text,
      created: new Date(),
      owner: this.userId,
      private: true,
      checked: false,
      username: Meteor.users.findOne(this.userId).username
    });
  }
});

export const remove = new ValidatedMethod({
  name: "tasks.remove",
  validate: new SimpleSchema({
    taskId: { type: String }
  }).validator(),
  run(fields) {
    authCheck("tasks.remove", this.userId);
    task = Tasks.findOne(fields.taskId);

    if (task.private && task.owner !== this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.remove(fields.taskId);
  }
});

export const setChecked = new ValidatedMethod({
  name: "tasks.setChecked",
  validate: new SimpleSchema({
    taskId: { type: String },
    checked: { type: Boolean }
  }).validator(),
  run(fields) {
    authCheck("tasks.setChecked", this.userId);
    task = Tasks.findOne(fields.taskId);

    if (task.private && task.owner !== this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(fields.taskId, { $set: { checked: fields.checked } });
  }
});

export const setPrivate = new ValidatedMethod({
  name: "tasks.setPrivate",
  validate: new SimpleSchema({
    taskId: { type: String },
    private: { type: Boolean }
  }).validator(),
  run(fields) {
    authCheck("tasks.setPrivate", this.userId);
    task = Tasks.findOne(fields.taskId);

    if (task.private && task.owner !== this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(fields.taskId, { $set: { private: fields.private } });
  }
});
