import { Meteor } from "meteor/meteor";
import * as React from "react";
import { Link } from "react-router-dom";

const Footer = props => (
  <footer className="mt-auto d-flex flex-column">
    <p className="m-auto">{props.systemSettings ? props.systemSettings.copyright : ""}</p>
  </footer>
);

export default Footer;
