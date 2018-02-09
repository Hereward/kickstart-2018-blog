import { Meteor } from "meteor/meteor";
import * as React from "react";
//import * as url from "url";

import { Accounts } from "meteor/accounts-base";
import PropTypes from "prop-types";
import ReactRouterPropTypes from "react-router-prop-types";
import { withTracker } from "meteor/react-meteor-data";


import { Link, withRouter } from "react-router-dom";

//import 'react-block-ui/style.css';
import Authenticator from "./Authenticator";
import Transition from "../../partials/Transition";
import ForgotPassWordForm from "../../forms/ForgotPassWordForm";
import * as Library from "../../../modules/library";

/*
 signedIn: PropTypes.bool,
  EnhancedAuth: PropTypes.bool,
  history: ReactRouterPropTypes.history
  */

interface IProps {
  signedIn: boolean;
  history: any;
  enhancedAuth: boolean;
}

interface IState {
  email: string;
}

class ForgotPassWord extends React.Component<IProps, IState> {
  //export default class SignIn extends Component {

  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.state = { 
      email: '',
    };
  }

  handleSubmit() {
    //e.preventDefault();
    //console.log(`Forgot Password: handleSubmit`);

    this.sendResetPassWordLink();
  }

  handleChange(e) {
    
    //this.setState({ showAuthenticator: true });
    let target = e.target;
    let value = target.value;
    let id = target.id;

    //console.log(`handleChange PARENT [${target}] [${value}]`);

    this.setState({ [id]: value });
  }

  getLayout() {
    if (!this.props.signedIn) {
      return (
        <ForgotPassWordForm
          handleChange={this.handleChange}
          handleSubmit={this.handleSubmit}
        />
      );
    } else {
      return <div>Already signed in.</div>;
    }
  }

  sendResetPassWordLink() {
    let email = this.state.email;

    console.log(`Sending reset forgot password email: [${email}]`);
    Accounts.forgotPassword(
      { email: email },
      function fp(e, r) {
        if (e) {
          let msg = "";
          console.log(e.reason);
          if (e.reason === "User not found") {
            msg = "That email address does not seem to be in our system.";
          } else {
            msg =
              "There was an error sending the email (message was rejected) Please check your email server settings.";
          }

          return Library.modalErrorAlert(
            {message: msg, title: "Oops..."}
          );

        } else {

          Library.modalSuccessAlert(
            {message: 'Instructions for resetting your password have been emailed to you.'}
          );
          
          this.props.history.push("/");
        }
      }.bind(this)
    );
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

/*
ForgotPassWord.propTypes = {
  signedIn: PropTypes.bool,
  EnhancedAuth: PropTypes.bool,
  history: ReactRouterPropTypes.history
};
*/
