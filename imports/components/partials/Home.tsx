import * as React from "react";
import { Link } from "react-router-dom";

const HomeContent = props => (
  <div className="jumbotron">
    <div className="container">
      <h1 className="display-4">A starter platform for Meteor projects</h1>
      <div>
        <p>
          This project is intended to be starting point for Meteor projects. It utilises a collection of packages
          which may assist you in building a website or app.
        </p>
        <p>All code is in Typescript. The front-end is React.</p>
        <p>
          The project contains a complete user registration process using custom templates including email verification
          and (optionally) 2 factor authentication.
        </p>
        <p>The project uses both Bootstrap 4 and Material UI design elements.</p>
        <p>The Home page also contains an implementation of the simple todos example from the Meteor Guide.</p>
        <p>
          For more information please visit the:{" "}
          <Link to="https://github.com/Hereward/meteor-react-kickstart-2018">github page</Link>.
        </p>
      </div>
    </div>
  </div>
);

export default HomeContent;
