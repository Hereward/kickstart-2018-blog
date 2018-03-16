import * as React from "react";
import { Link } from "react-router-dom";

const HomeContent = props => (
  <div className="jumbotron">
    <div className="container">
      <h1 className="display-4">A starter platform for Meteor projects</h1>
      <div>
        <p>
          This project is intended to be a starting point for Meteor projects. It utilises a collection of packages which
          may assist you in building a website or app.
        </p>
        <p>All code is in Typescript. The front-end is React.</p>
        <p>
          The project contains a complete user registration process using custom templates including email verification
          and (optionally) 2 factor authentication.
        </p>
        <p>There is an About page and a Profile section.</p>
        <p>The About page features the Quill rich text editor.</p>
        <p>The Profile page features a form for uploading personal data as well as an image.</p>
        <p>The project uses both Bootstrap 4 and Material UI design elements.</p>
        <p>The Home page also contains an implementation of the simple todos example from the <Link to="https://www.meteor.com/tutorials/react/creating-an-app">Meteor Guide</Link>.</p>
        <p>
          For full documentation please visit the{" "}
          <Link to="https://github.com/Hereward/meteor-react-kickstart-2018">Github Repository</Link>.
        </p>
      </div>
    </div>
  </div>
);

export default HomeContent;
