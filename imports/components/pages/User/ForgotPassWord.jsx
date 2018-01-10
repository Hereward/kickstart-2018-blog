import { Meteor } from "meteor/meteor";
//import * as url from "url";

import { Accounts } from "meteor/accounts-base";
import PropTypes from "prop-types";
import ReactRouterPropTypes from "react-router-prop-types";
import { withTracker } from "meteor/react-meteor-data";
import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import Authenticator from "./Authenticator";
import Transition from "../../partials/Transition";

class ForgotPassWord extends Component {
  //export default class SignIn extends Component {

  constructor(props) {
    super(props);
  }

  //&#39;

  getLayout() {
    if (!this.props.SignedIn) {
      return (
        <div>
          <h2>Forgot Your Password ?</h2>

          <p>
            Let&#8217;s recover it! Please enter your email address below. You
            will receive an email with further instructions.
          </p>

          <form onSubmit={this.sendResetPassWordLink.bind(this)}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                className="form-control"
                ref="email"
                id="email"
                placeholder="Email"
              />
            </div>

            <div className="form-group">
              <button type="submit" className="btn btn-default">
                Submit
              </button>
            </div>

            <div className="form-group">
              <Link href="/" to="/register">
                Click here to register...
              </Link>
            </div>
          </form>
        </div>
      );
    } else if (this.props.EnhancedAuth) {
      return <Authenticator />;
    } else {
      this.props.history.push("/");
      return <div />;
    }
  }

  sendResetPassWordLink(event) {
    event.preventDefault();
    let email = this.refs.email.value.trim();

  

    console.log("Sending reset forgot password email...");
    Accounts.forgotPassword({ email: email }, function fp(e, r) {
      if (e) {
        let msg = '';
        console.log(e.reason);
        if (e.reason === "User not found") {
          msg = 'That email address does not seem to be in our system.';
        } else {
          msg = 'There was an error sending the email (message was rejected) Please check your email server settings.';
        }

        return swal({
          title: "Oops...",
          text: msg,
          showConfirmButton: true,
          type: "error"
        });
      } else {
        swal({
          title: "Success!",
          text: "Instructions for resetting your password have been emailed.",
          showConfirmButton: true,
          type: "success"
        });
        this.props.history.push("/");
      }
    }.bind(this));
  }

  render() {
    return (
      <Transition>
        <div>{this.getLayout()}</div>
      </Transition>
    );
  }
}

export default withRouter(
  withTracker(({ params }) => {
    Meteor.subscribe("userData");
    return {};
  })(ForgotPassWord)
);

ForgotPassWord.propTypes = {
  SignedIn: PropTypes.bool,
  EnhancedAuth: PropTypes.number,
  history: ReactRouterPropTypes.history
};
