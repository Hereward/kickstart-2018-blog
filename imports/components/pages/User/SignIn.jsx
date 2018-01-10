import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import ReactRouterPropTypes from 'react-router-prop-types';
import { withTracker } from "meteor/react-meteor-data";
import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import Authenticator from "./Authenticator";
import Transition from "../../partials/Transition";

class SignIn extends Component {
  //export default class SignIn extends Component {

  constructor(props) {
    super(props);
  }

  getLayout() {
    if (!this.props.SignedIn) {
      return (
        <div>
          <h2>Sign In</h2>
          <form onSubmit={this.SignInUser.bind(this)}>
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
              <label htmlFor="password">Password</label>
              <input
                type="password"
                className="form-control"
                ref="password"
                id="password"
                placeholder="Password"
              />
            </div>

            <div className="form-group">
              <button type="submit" className="btn btn-default">
                Submit
              </button>
            </div>

            <div className="form-group">
            <Link href="/" to="/register">Click here to register...</Link>
            </div>
            <div className="form-group">
            <Link href="/" to="/forgot-password">Forgot Password ?</Link>
            </div>
          </form>
        </div>
      );

    } else if (this.props.EnhancedAuth) {
      return <Authenticator />;
    } else {
      this.props.history.push("/");
      return (<div />);
    }
  }

  SignInUser(event) {
    event.preventDefault();
    let email = this.refs.email.value.trim();
    let password = this.refs.password.value.trim();
    console.log(`Login [${email}] [${password}]`);

    Meteor.loginWithPassword(email, password, error => {
      if (error) {
        return swal({
          title: "Email or password incorrect",
          text: "Please try again",
          timer: 2500,
          showConfirmButton: false,
          type: "error"
        });
      } else {
        let key = Meteor.user().private_key;
        let name = Meteor.user().username;
        this.updateAuthVerified(false);
        console.log(`Successfull Login: [${name}] [${key}]`);
        console.log(`SignInUser: props.SignedIn: [${this.props.SignedIn}]`);
      }
    });
  }

  updateAuthVerified(state) {
    Meteor.call(
      "authenticator.updateAuthVerified",
      state,
      (error, response) => {
        if (error) {
          console.warn(error);
        }
      }
    );
  }

/*
  zzupdateAuthVerified(state) {
    //let privateKey = this.state.keyBase32;
    let userId = Meteor.userId();
    //console.log(`updateAuthVerified: verified = [${state}]`);
    if (userId) {
      console.log("Updating User Profile");
      Meteor.users.update(userId, {
        $set: {
          auth_verified: false
        }
      });
    }
  }

  */

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
  })(SignIn)
);

SignIn.propTypes = {
  SignedIn: PropTypes.bool,
  EnhancedAuth: PropTypes.number,
  AuthVerified: PropTypes.bool,
  history: ReactRouterPropTypes.history
};
