import { Meteor } from "meteor/meteor";
import * as React from "react";
import { Link } from "react-router-dom";

const Footer = props => (
    <footer className="mt-auto d-flex flex-column"><p className="m-auto">{Meteor.settings.public.copyright}</p></footer>
);

export default Footer;
