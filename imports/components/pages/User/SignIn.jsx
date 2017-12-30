import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import React, { Component } from "react";
import CSSTransitionGroup from "react-transition-group/CSSTransitionGroup";
import { Link } from "react-router-dom";
import Authenticator from "./Authenticator";

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
              <Link to="/register">Click here to register...</Link>
            </div>
          </form>
        </div>
      );
    } else {
      return <Authenticator />;
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
        console.log(`Successfull Login: [${name}] [${key}]`);
        console.log(`SignInUser: props.SignedIn: [${this.props.SignedIn}]`);

        //this.props.history.push("/");
      }
    });
  }

  render() {
    return (
      <CSSTransitionGroup
        component="div"
        transitionName="route"
        transitionEnterTimeout={600}
        transitionAppearTimeout={600}
        transitionLeaveTimeout={400}
        transitionAppear={true}
      >
        <div>{this.getLayout()}</div>
      </CSSTransitionGroup>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe("userData");

  return {};
})(SignIn);

SignIn.propTypes = {
  SignedIn: PropTypes.bool
};
