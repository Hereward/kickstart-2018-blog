import React, { Component } from "react";
import PropTypes from "prop-types";
import ReactRouterPropTypes from 'react-router-prop-types';

import { Meteor } from "meteor/meteor";
import Link, { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import QRCode from "react-qr-code";
import Authenticator from "./Authenticator";
import Transition from "../../partials/Transition";
import RegistrationForm from "../../forms/Registration";

// hello

let speakeasy = require("speakeasy");

//import * as Speakeasy from 'speakeasy'

class Register extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showAuthenticator: false,
      email: "",
      password1: "",
      password2: ""
    };
    this.registerUser = this.registerUser.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    //this.setState({ showAuthenticator: true });

    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let id = target.id;

    this.setState({ [id]: value });
  }

  registerUserZ(event) {
    console.log(`FORM SUBMIT >> EMAIL =  ${this.state.email}`);
    this.setState({ showAuthenticator: true });
  }

  registerUser(event) {
    //event.preventDefault();
    console.log(`FORM SUBMIT >> EMAIL =  ${this.state.email}`);

    let email = this.state.email.trim();
    let password1 = this.state.password1.trim();
    let password2 = this.state.password2.trim();

    let isValidPassword = function isValidPassword(password1, password2) {
      if (password1 === password2) {
        return password1.length >= 6 ? true : false;
      } else {
        return swal({
          title: "Passwords don't match",
          text: "Please try again",
          showConfirmButton: true,
          type: "error"
        });
      }
    };

    if (isValidPassword(password1, password2)) {
      Accounts.createUser(
        {
          username: email,
          email: email,
          private_key: "boo",
          auth_verified: false,
          password: password1
        },
        error => {
          if (error) {
            console.log(`Error: ${error.reason}`);
            return swal({
              title: "Oops, something went wrong!",
              text:
                "There was a problem creating this account. Please try again.",
              showConfirmButton: true,
              type: "error"
            });
          } else {
            console.log("Successfully created account!");

            if (this.props.EnhancedAuth) {
              this.setState({ showAuthenticator: true });
            } else {
              this.props.history.push("/");
            }
          }
        }
      );
    } else {
      return swal({
        title: "Password must be at least 6 characters.",
        text: "Please try again",
        showConfirmButton: true,
        type: "error"
      });
    }
  }

  getLayout() {
    let layout = "";
    let form = (
      <RegistrationForm
        handleChange={this.handleChange}
        handleSubmit={this.registerUser}
      />
    );

    if (this.props.EnhancedAuth) {
      layout = this.state.showAuthenticator ? (
        <Authenticator fresh {...this.props} />
      ) : (
        form
      );
    } else {
      layout = form;
    }

    return layout;
  }

  render() {
    if (this.props.AuthVerified === true) {
      this.props.history.push("/");
    }

    let layout = this.getLayout();

    return <Transition>{layout}</Transition>;
  }
}

export default withRouter(withTracker(({ params }) => {
  Meteor.subscribe("userData");
  return {

  };
})(Register));

Register.propTypes = {
  EnhancedAuth: PropTypes.number,
  history: ReactRouterPropTypes.history,
  AuthVerified: PropTypes.bool
};
