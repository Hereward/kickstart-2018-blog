import * as React from "react";
import { Link, Redirect } from "react-router-dom";

const About = props => (
  <div className="about">
    <h1>This Is the About Page! Current Signed In Status = [{JSON.stringify(props.signedIn)}]</h1>
  </div>
);

export default About;
