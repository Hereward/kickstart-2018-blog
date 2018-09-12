import * as React from "react";
import { Link } from "react-router-dom";
import Transition from "./Transition";

let fb: any;

const HomeContent = props => (
    <Transition>
    <div className="jumbotron">
      <div className="container">
        <h1 className="display-4">A starter platform for Meteor projects</h1>

        <div>
          <p>
            This project is intended to be a starting point for Meteor projects. It utilises a collection of packages
            which may assist you in building a website or app.
          </p>
          <p>All code is in Typescript. The front-end is React.</p>
          <p>
            The project contains a complete user registration process using custom templates including email
            verification and (optionally) two factor authentication.
          </p>
          <p>
            Two factor authentication can be activated from the Members&gt;Profile page after you have verified your
            email address. In the demo the correct code is provided on screen for you to compare with the one generated
            by Google Authenticator.
          </p>
          <p>There is an About page and a Profile section.</p>
          <p>The About page features the Quill rich text editor.</p>
          <p>The Profile page features a form for uploading personal data as well as an image.</p>
          <p>The project uses both Bootstrap 4 and Material UI design elements.</p>
          <p>
            The Home page also contains an implementation of the simple todos example from the{" "}
            <a href="https://www.meteor.com/tutorials/react/creating-an-app">Meteor Guide</a>.
          </p>
          <p>
            For full documentation please visit the{" "}
            <a href="https://github.com/Hereward/kickstart-2018-blog">Github Repository</a>.
          </p>
        </div>
      </div>
    </div>
    </Transition>
);

export default HomeContent;
