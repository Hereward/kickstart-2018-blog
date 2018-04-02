import { Meteor } from "meteor/meteor";

export function id() {
  const id = Meteor.userId() ? Meteor.userId() : false;
  return id;
}

export function data() {
    const user = Meteor.user();
    return user;
}