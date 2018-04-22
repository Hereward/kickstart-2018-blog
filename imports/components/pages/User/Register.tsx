import { Meteor } from "meteor/meteor";
import * as React from "react";
import * as PropTypes from "prop-types";
import { Accounts } from "meteor/accounts-base";
import ReactRouterPropTypes from "react-router-prop-types";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import QRCode from "react-qr-code";
import { Alert } from "reactstrap";
import Transition from "../../partials/Transition";
import RegistrationForm from "../../forms/RegistrationForm";
import * as ProfileMethods from "../../../api/profiles/methods";
import * as AuthMethods from "../../../api/auth/methods";
import * as Library from "../../../modules/library";
import * as SessionMethods from "../../../api/sessions/methods";
import * as User from "../../../modules/user";

import SignInForm from "../../forms/SignInForm";

interface IProps {
  history: any;
  enhancedAuth: boolean;
  signedIn: boolean;
}

interface IState {
  email: string;
  password1: string;
  password2: string;
  allowSubmit: boolean;
}

class Register extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password1: "",
      password2: "",
      allowSubmit: true
    };
    this.registerUser = this.registerUser.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  static propTypes = {
    enhancedAuth: PropTypes.bool,
    history: ReactRouterPropTypes.history
  };

  componentDidUpdate() {}

  sendVerificationEmail(id) {
    let authFields = {
      id: id
    };

    ProfileMethods.sendVerificationEmail.call(authFields, (err, res) => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`sendVerificationEmail error`, err);
      }
    });
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let id = target.id;

    this.setState({ [id]: value });
  }

  isValidPassword(password1, password2) {
    if (password1 === password2) {
      return password1.length >= 6 ? true : false;
    } else {
      this.setState({ allowSubmit: true });
      return Library.modalErrorAlert("Passwords don't match");
    }
  }

  registerUser(event) {
    this.setState({ allowSubmit: false });
    let email = this.state.email.trim();
    let password1 = this.state.password1.trim();
    let password2 = this.state.password2.trim();

    let isValidPassword = this.isValidPassword(password1, password2);

    if (isValidPassword) {
      Accounts.createUser(
        {
          email: email,
          password: password1
        },
        err => {
          if (err) {
            console.log(`Error: ${err.reason}`);
            this.setState({allowSubmit: true});
            Library.modalErrorAlert(err.reason);
            console.log(`createUser error`, err);
            
          } else {

            SessionMethods.createUserSession.call({}, (err, res) => {
              if (err) {
                console.log(`createSession error: [${err.reason}]`, err);
                Library.modalErrorAlert(err.reason);
                console.log(`createUserSession error`, err);
              }
            });

            let profileFields = {
              fname: "",
              initial: "",
              lname: ""
            };

            ProfileMethods.createProfile.call(profileFields, (err, id) => {
              if (err) {
                this.setState({allowSubmit: true});
                Library.modalErrorAlert(err.reason);
                console.log(`createProfile error`, err);
              } else {
                this.sendVerificationEmail(id);
              }
            });


            AuthMethods.createAuth.call({}, (err, id) => {
              if (err) {
                this.setState({allowSubmit: true});
                Library.modalErrorAlert(err.reason);
                console.log(`createAuth error: [${err.reason}]`, err);
              } else {
                console.log(`auth successfully created. res = [${id}]`);
              }
            });

           

            this.props.history.push("/");
            /*
            if (this.props.enhancedAuth) {
              this.props.history.push("/authenticate");
            } else {
              this.props.history.push("/");
            }
            */
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

  getLayout() {
    let layout: any;
    let form = (
      <RegistrationForm
        allowSubmit={this.state.allowSubmit}
        handleChange={this.handleChange}
        handleSubmit={this.registerUser}
      />
    );

    layout = form;

    return <div className="container page-content">{layout}</div>;
  }

  render() {
    let layout = this.getLayout();

    return <Transition>{layout}</Transition>;
  }
}

export default withRouter(
  withTracker(({ params }) => {
    return {};
  })(Register)
);
