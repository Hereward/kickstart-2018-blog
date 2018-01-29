
// import jquery from "jquery";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import PropTypes from "prop-types";
import ReactRouterPropTypes from "react-router-prop-types";

import { withTracker } from "meteor/react-meteor-data";
import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import Transition from "../../partials/Transition";
import ForgotPassWordResetForm from "../../forms/ForgotPassWordResetForm";

// OLD

class ForgotPassWordReset extends Component {

  constructor(props) {
    super(props);

    //let url = jquery(location).attr("href");
    let url = window.location.href;
    this.token = url.substr(url.lastIndexOf("/") + 1);

    console.log(`TOKEN= [${this.token}]`);

    this.state = {
      password1: "",
      password2: ""
    };
    this.resetPassword = this.resetPassword.bind(this);
    this.handleChange = this.handleChange.bind(this);

    console.log(
      `ForgotPassWordReset: enhancedAuth = [${this.props.enhancedAuth}]`
    );
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.AuthVerified) {
      this.props.history.push("/");
    }
  }

  handleChange(e) {

    let target = e.target;
    let value = target.value;
    let id = target.id;

    this.setState({ [id]: value });
  }

  //&#39;

  getLayout() {
    let form = (
      <ForgotPassWordResetForm
        handleChange={this.handleChange}
        handleSubmit={this.resetPassword}
      />
    );

    return form;
  }

  resetPassword() {
    //event.preventDefault();
    console.log(`FORM SUBMIT >> EMAIL =  ${this.state.email}`);

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
      // do something!

     // reset((err) => this.a)
     // Accounts.resetPassword((this.token,) => this.a)
      Accounts.resetPassword(
        this.token,
        password1,
        function reset(err) {
          if (!err) {
            Meteor.call(
              "authenticator.updateAuthVerified",
              true,
              (error, response) => {
                if (error) {
                  console.warn(error);
                }
              }
            );

            swal({
              title: "Success!",
              text: "Your password was reset.",
              showConfirmButton: true,
              type: "success"
            });
            if (this.props.enhancedAuth) {
              console.log("password reset: redirect to /authenticate");
              this.props.history.push("/authenticate");
            } else {
              this.props.history.push("/");
              console.log("password reset: redirect to /");
            }
          } else {
            swal({
              title: "Failed",
              text: `Password reset failed: ${err}`,
              showConfirmButton: true,
              type: "error"
            });
            console.log(err);
          }
        }.bind(this)
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
  })(ForgotPassWordReset)
);


ForgotPassWordReset.propTypes = {
  history: ReactRouterPropTypes.history,
  enhancedAuth: PropTypes.bool,
  AuthVerified: PropTypes.bool
};


