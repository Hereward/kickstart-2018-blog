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
          <h3>Recently Added Features</h3>
          <ul>
            <li>Blog (create/edit/delete)</li>
            <li>Tags (create/edit/delete)</li>
            <li>Comments (create/edit/delete)</li>
            <li>Integrated blog editing with permission system</li>
            <li>
              Added{" "}
              <a href="https://www.npmjs.com/package/react-autosuggest" rel="nofollow">
                react-autosuggest
              </a>{" "}
              &amp;{" "}
              <a href="https://www.npmjs.com/package/react-tagsinput" rel="nofollow">
                react-tagsinput
              </a>{" "}
              for tag editing
            </li>
            <li>Integrated blog &amp; page content with SSR</li>
            <li>Added OG meta data for blog &amp; page posts</li>
            <li>Replaced bootstrap navbar with material-ui Drawer component</li>
            <li>
              Implemented JSS{" ["}
              <a href="http://cssinjs.org/" rel="nofollow">
                CSSinJS
              </a>{"] "}
              - component level CSS styling - provided by{" "}
              <a href="https://material-ui.com/customization/css-in-js/" rel="nofollow">
                material-ui
              </a>
            </li>
            <li>
              Added{" "}
              <a href="https://www.npmjs.com/package/react-share" rel="nofollow">
                react-share
              </a>{" "}
              - social media share buttons
            </li>
            <li>Added tabbed profile pages for users (posts/about/settings)</li>
            <li>Automatic route creation for generated pages</li>
            <li>permissions system (meteor-roles)</li>
            <li>admin panel</li>
            <li>user management</li>
            <li>send invitations</li>
            <li>SSR (implemented for header and loading screen)</li>
            <li>ability to set HTML meta data via admin panel</li>
            <li>react-redux</li>
            <li>improved routing</li>
          </ul>
        </div>
      </div>
    </div>
  </Transition>
);

export default HomeContent;
