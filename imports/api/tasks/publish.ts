import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";

export const Tasks = new Mongo.Collection("tasks");

if (Meteor.isServer) {
  Meteor.publish("tasks", function tasksPublication() {
    return Tasks.find({
      $or: [{ private: { $ne: true } }, { owner: this.userId }]
    });
  });

  Meteor.startup(function tasksStart() {
    Tasks.remove({});
    //console.log(`startup (tasks) - clearing content`);
  });
}
