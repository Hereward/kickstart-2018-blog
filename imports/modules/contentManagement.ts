import { Meteor } from "meteor/meteor";
import * as PageMethods from "../api/pages/methods";
import * as TaskMethods from "../api/tasks/methods";

export function refreshDefaultContent() {
    PageMethods.refreshDefaultContent();
    TaskMethods.refreshDefaultContent();
}
  

