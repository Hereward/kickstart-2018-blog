import { Mongo } from "meteor/mongo";

export const Tasks = new Mongo.Collection("tasks");

if (Meteor.isServer) {
  Meteor.publish("tasks", function tasksPublication() {
    return Tasks.find({
      $or: [{ private: { $ne: true } }, { owner: this.userId }]
    });
  });
}
