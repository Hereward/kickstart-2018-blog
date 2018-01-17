import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import PropTypes from "prop-types";
import ReactRouterPropTypes from "react-router-prop-types";
import { withTracker } from 'meteor/react-meteor-data';
//import React, { Component } from "react";
import * as React from "react";
import { withRouter } from "react-router-dom";
import jquery from "jquery";

import Transition from "../../partials/Transition";

interface IProps {
  history: any;
  AuthVerified: boolean;
  SignedIn: boolean;
  EnhancedAuth: number;
}

interface IState {
 
}

//declare var swal: any;

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
    SignedIn: PropTypes.bool,
    EnhancedAuth: PropTypes.number,
    history: ReactRouterPropTypes.history
  };



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
          this.props.history.push("/");
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


