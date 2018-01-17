import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import PropTypes from "prop-types";
import ReactRouterPropTypes from "react-router-prop-types";
import { withTracker } from 'meteor/react-meteor-data';
import React, { Component } from "react";
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

class VerifyEmail extends Component<IProps, IState> {
  //export default class SignIn extends Component {

  token: string;

 declare function swal: any;

  constructor(props) {
    super(props);

    let url = jquery(location).attr("href");
    this.token = url.substr(url.lastIndexOf("/") + 1);

    this.state = {
     
    };
  }

  static propTypes = {
    SignedIn: PropTypes.bool,
    EnhancedAuth: PropTypes.number,
    history: ReactRouterPropTypes.history
  };

  checkToken() {
    Accounts.verifyEmail(
      this.token,
      function reset(err) {
        if (!err) {
          Meteor.call(
            "authenticator.updateAuthVerified",
            false,
            (error, response) => {
              if (error) {
                console.warn(error);
              }
            }
          );

          /*
          let userId = Meteor.userId();
          if (userId) {
            console.log("Updating User Profile");
            Meteor.users.update(userId, {
              $set: {
                auth_verified: false
              }
            });
          }
          */
          //console.log('Password reset');
          swal({
            title: "Success!",
            text: "Your password was reset.",
            showConfirmButton: true,
            type: "success"
          });
          if (this.props.EnhancedAuth) {
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
    )
  }

  

  getLayout() {
    return <div>YAHOOOO!</div>
   
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


