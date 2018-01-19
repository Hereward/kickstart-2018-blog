import { Meteor } from "meteor/meteor";
//import { Accounts } from "meteor/accounts-base";
import PropTypes from "prop-types";
import ReactRouterPropTypes from "react-router-prop-types";
import { withTracker } from "meteor/react-meteor-data";
//import React, { Component } from "react";
import * as React from "react";
import { withRouter } from "react-router-dom";
import * as jquery from 'jquery';
//import jquery from "jquery";

import Transition from "../../partials/Transition";

interface IProps {
  history: any;
  AuthVerified: boolean;
  EnhancedAuth: number;
}

interface IState {}

//declare var swal: any;
declare var location: any;
declare var Accounts: any;

class VerifyEmail extends React.Component<IProps, IState> {
  //export default class SignIn extends Component {

  token: string;

  constructor(props) {
    super(props);
    this.checkToken = this.checkToken.bind(this);
    let url = jquery(location).attr("href");
    this.token = url.substr(url.lastIndexOf("/") + 1);
  }

  componentDidMount() {
    this.checkToken();
  }

  static propTypes = {
    history: ReactRouterPropTypes.history,
    EnhancedAuth: PropTypes.number,
  };

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

  checkToken() {
    Accounts.verifyEmail(
      this.token,
      function verified(err) {
        if (!err) {
          swal({
            title: "Success!",
            text: "Your email was verified.",
            showConfirmButton: true,
            type: "success"
          });

          if (this.props.EnhancedAuth) {
            console.log("password reset: redirect to /authenticate");
            this.updateAuthVerified(false);
            this.props.history.push("/authenticate");
          } else {
            this.props.history.push("/");
            console.log("password reset: redirect to /");
          }
        } else {
          swal({
            title: "Failed",
            text: `Email verification failed: ${err}`,
            showConfirmButton: true,
            type: "error"
          });
          console.log(err);
        }
      }.bind(this)
    );
  }

  getLayout() {
    return <div className="lead">Verifying....</div>;
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
  })(VerifyEmail)
);
