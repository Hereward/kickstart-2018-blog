import { Meteor } from "meteor/meteor";

log = require("loglevel");
log.setLevel(Meteor.settings.public.logLevel);

