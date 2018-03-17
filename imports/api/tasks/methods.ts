import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Tasks } from "./publish";

let task: any;

export const refreshDefaultContent = () => {
  console.log(`Tasks - refreshDefaultContent`);
  wipeContent.call({}, err => {
    if (err) {
      console.log(`tasks wipeContent failed`, err);      
    }
  });
};

export const wipeContent = new ValidatedMethod({
  name: "tasks.wipeContent",
  validate: new SimpleSchema({}).validator(),
  run() {
    if (!this.isSimulation) {
      console.log(`tasks.wipeContent`,this.userId)
      Tasks.remove({owner: this.userId, private: false});
      console.log(`tasks.wipeContent - DONE!`);
      return true;
    }
  }
});

export const create = new ValidatedMethod({
  name: "tasks.create",
  validate: new SimpleSchema({
    text: { type: String }
  }).validator(),
  run(fields) {
    let text = fields.text;
    console.log(`tasks.create SERVER - [${text}] id=[${this.userId}]`);
    if (!this.userId) {
      throw new Meteor.Error("not-authorized");
    }
    Tasks.insert({
      text: text,
      createdAt: new Date(),
      owner: this.userId,
      private: true,
      checked: false,
      username: Meteor.users.findOne(this.userId).username
    });
    console.log(`tasks.create SERVER - DONE!`);
  }
});

export const remove = new ValidatedMethod({
  name: "tasks.remove",
  validate: new SimpleSchema({
    taskId: { type: String }
  }).validator(),
  run(fields) {
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
    task = Tasks.findOne(fields.taskId);

    if (task.private && task.owner !== this.userId) {
      throw new Meteor.Error("not-authorized");
    }

    Tasks.update(fields.taskId, { $set: { private: fields.private } });
  }
});
