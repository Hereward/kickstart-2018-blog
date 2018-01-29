
import { Meteor } from "meteor/meteor";
import * as React from "react";
import * as PropTypes from 'prop-types';
import { Accounts } from "meteor/accounts-base";
import ReactRouterPropTypes from "react-router-prop-types";
import Link, { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import QRCode from "react-qr-code";

import { Alert } from "reactstrap";
import Authenticator from "./Authenticator";
import Transition from "../../partials/Transition";
import RegistrationForm from "../../forms/RegistrationForm";
import { createProfile } from "../../../api/profiles/methods";
import { Profiles } from "../../../api/profiles/publish";


import SignInForm from "../../forms/SignInForm";

//let speakeasy = require("speakeasy");

//let RegistrationForm: any;

//let Accounts: any;

interface IProps {
  history: any;
  AuthVerified: boolean;
  enhancedAuth: boolean;
  signedIn: boolean;
  verificationEmailSent: number;
}

interface IState {
  showAuthenticator: boolean;
  email: string;
  password1: string;
  password2: string;
}


class Register extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      showAuthenticator: false,
      email: "",
      password1: "",
      password2: ""
    };
    this.registerUser = this.registerUser.bind(this);
    this.handleChange = this.handleChange.bind(this);

    let objData = JSON.stringify(this.props);
    console.log(`Register: objData: [${objData}]`);
  }

  static propTypes = {
    enhancedAuth: PropTypes.bool,
    history: ReactRouterPropTypes.history,
    verificationEmailSent: PropTypes.number,
  };

  componentDidUpdate() {}

  sendVerificationEmail() {
    Meteor.call("user.sendVerificationEmail", (error, response) => {
      if (error) {
        console.warn(error);
        swal({
          title: "Verification email not sent.",
          text: "There was a problem sending the verification email.",
          showConfirmButton: true,
          type: "error"
        });
      }
      console.log(`sendVerificationEmail: done. response =[${response}]`);
    });
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let id = target.id;

    this.setState({ [id]: value });
  }

  registerUserZ(event) {
    console.log(`FORM SUBMIT >> EMAIL =  ${this.state.email}`);
    this.setState({ showAuthenticator: true });
  }

  registerUser(event) {
    //event.preventDefault();
    console.log(`FORM SUBMIT >> EMAIL =  ${this.state.email}`);

    let email = this.state.email.trim();
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
      Accounts.createUser(
        {
          email: email,
          enhancedAuth: {
            verified: false,
            currentAttempts: 0,
            private_key: null
          },
          verificationEmailSent: 0,
          password: password1
        },
        error => {
          if (error) {
            console.log(`Error: ${error.reason}`);
            return swal({
              title: "Oops, something went wrong!",
              text:
                "There was a problem creating this account. Please try again.",
              showConfirmButton: true,
              type: "error"
            });
          } else {
            console.log("createUser: done");

            let profileFields = {
              fname: "Adolf",
              initial: "K",
              lname: "Hitler"
            };

            createProfile.call(profileFields, (err, res) => {
              console.log("createProfile.call");
              if (err) {
                swal({
                  title: "Oops, something went wrong!",
                  text: "There was a problem creating the User Profile.",
                  showConfirmButton: true,
                  type: "error"
                });
              } else {
                console.log(`profile successfully created`);
              }
            });

            console.log("Successfully created account!");
            this.sendVerificationEmail();

            if (this.props.enhancedAuth) {
              //this.props.history.push("/");
              this.setState({ showAuthenticator: true });
            } else {
              this.props.history.push("/");
            }
          }
        }
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

  verificationNotice() {
    if (this.props.verificationEmailSent) {
      return (
        <div className="messages">
          <Alert color="success">
            A verification email has been sent. Please check your email and
            click on the verification link.
          </Alert>
        </div>
      );
    }
  }



  getLayout() {
    let layout: any;
    let form = (
      <RegistrationForm handleChange={this.handleChange} handleSubmit={this.registerUser} />
    );

    if (this.props.enhancedAuth) {
      layout = this.state.showAuthenticator ? <Authenticator fresh /> : form;
    } else {
      layout = form;
    }

    return <div>{layout}</div>;
  }

  render() {
    let layout = this.getLayout();

    return <Transition>{layout}</Transition>;
  }
}

export default withRouter(
  withTracker(({ params }) => {
    Meteor.subscribe("userData");
    return {};
  })(Register)
);
