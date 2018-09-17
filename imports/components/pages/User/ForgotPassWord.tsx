import { Meteor } from "meteor/meteor";
import * as React from "react";
import { Accounts } from "meteor/accounts-base";
import * as PropTypes from "prop-types";
import ReactRouterPropTypes from "react-router-prop-types";
import { withTracker } from "meteor/react-meteor-data";
import { Link } from "react-router-dom";
import Authenticator from "./Authenticator";
import Transition from "../../partials/Transition";
import ForgotPassWordForm from "../../forms/ForgotPassWordForm";
import * as Library from "../../../modules/library";

interface IProps {
  signedIn: boolean;
  history: any;
  enhancedAuth: boolean;
}

interface IState {
  email: string;
  allowSubmit: boolean;
}

class ForgotPassWord extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      email: "",
      allowSubmit: true
    };
  }

  handleSubmit() {
    this.sendResetPassWordLink();
  }

  handleChange(e) {
    let target = e.target;
    let value = target.value;
    let id = target.id;
    this.setState({ [id]: value });
  }

  getLayout() {
    if (!this.props.signedIn) {
      return (
        <ForgotPassWordForm
          allowSubmit={this.state.allowSubmit}
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
    this.setState({ allowSubmit: false });

    console.log(`Sending reset forgot password email: [${email}]`);
    Accounts.forgotPassword(
      { email: email },
      function fp(e, r) {
        if (e) {
          this.setState({ allowSubmit: true });
          let msg = "";
          console.log(e.reason);
          if (e.reason === "User not found") {
            msg = "That email address does not seem to be in our system.";
          } else {
            msg =
              "There was an error sending the email (message was rejected) Please check your email server settings.";
          }

          return Library.modalErrorAlert({ message: msg, title: "Oops..." });
        } else {
          Library.modalSuccessAlert({ message: "Instructions for resetting your password have been emailed to you." });

          this.props.history.push("/");
        }
      }.bind(this)
    );
  }

  render() {
    return (
      <Transition>
        <div className="page-content">{this.getLayout()}</div>
      </Transition>
    );
  }
}

export default withTracker(() => {
  return {};
})(ForgotPassWord);
