import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Accounts } from "meteor/accounts-base";
import * as PropTypes from 'prop-types';
import ReactRouterPropTypes from "react-router-prop-types";

//import React, { Component } from "react";
import * as React from "react";
import { withRouter } from "react-router-dom";
//import * as jquery from 'jquery';
//import jquery from "jquery";

import Transition from "../../partials/Transition";

interface IProps {
  history: any;
  AuthVerified: boolean;
  enhancedAuth: boolean;
}

interface IState {}

//declare var swal: any;
//declare var location: any;
//declare var Accounts: any;


class VerifyEmail extends React.Component<IProps, IState> {

  token: string;

  constructor(props) {
    super(props);
    this.checkToken = this.checkToken.bind(this);
    //let boo = jquery(location).attr("href");
    let url = window.location.href; //jquery(location).attr("href");
    this.token = url.substr(url.lastIndexOf("/") + 1);
  }

  componentDidMount() {
    this.checkToken();
  }

  static propTypes = {
    history: ReactRouterPropTypes.history,
    enhancedAuth: PropTypes.boolean
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

          if (this.props.enhancedAuth) {
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
  //export default class SignIn extends Component {

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


