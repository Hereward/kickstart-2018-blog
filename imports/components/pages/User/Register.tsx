import { Meteor } from "meteor/meteor";
import * as React from "react";
import * as PropTypes from "prop-types";
import { Accounts } from "meteor/accounts-base";
import ReactRouterPropTypes from "react-router-prop-types";
import { withTracker } from "meteor/react-meteor-data";
import { Roles } from "meteor/alanning:roles";
import Transition from "../../partials/Transition";
import RegistrationForm from "../../forms/RegistrationForm";
import * as ProfileMethods from "../../../api/profiles/methods";
import * as AuthMethods from "../../../api/auth/methods";
import * as Library from "../../../modules/library";
import * as SessionMethods from "../../../api/sessions/methods";
import * as PagesMethods from "../../../api/pages/methods";
import * as User from "../../../modules/user";
import * as userSettingsMethods from "../../../api/settings/methods";
import { configureNewUser } from "../../../api/admin/methods";

import SignInForm from "../../forms/SignInForm";

interface IProps {
  history: any;
  enhancedAuth: boolean;
  signedIn: boolean;
  sessionToken: string;
}

interface IState {
  [x: number]: any;
  email: string;
  password1: string;
  password2: string;
  allowSubmit: boolean;
  keepMeLoggedIn: boolean;
}

class Register extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password1: "",
      password2: "",
      allowSubmit: true,
      keepMeLoggedIn: false
    };
    this.registerUser = this.registerUser.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
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

  handleCheck(isInputChecked) {
    this.setState({ keepMeLoggedIn: isInputChecked });
    log.info(`Register - handleCheck`, isInputChecked);
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
            this.setState({ allowSubmit: true });
            Library.modalErrorAlert({
              message: err.reason,
              title: `Registration Failed`
            });
            console.log(`createUser error`, err);
          } else {
            //User.configureNewUser({type: "register"});
            const userId = User.id();
            //const newSessionToken = sessionToken("create");
            const sessionToken = User.sessionToken("create");

            configureNewUser.call({ userId: userId, sessionToken: sessionToken, type: "register" }, (err, res) => {
              if (err) {
                log.error(`configureNewUserMethod error: [${err.reason}]`, err);
              } else {
                this.props.history.push("/");
              }
            });

            /*

            assignRolesNewUser.call({}, (err, res) => {
              if (err) {
                console.log(`assignRolesNewUser error: [${err.reason}]`, err);
              }
            });

            let allowMultiSession = Meteor.settings.public.session.allowMultiSession || false;

            let sessionToken = User.sessionToken("create");
            log.info(`registerUser`, sessionToken);

            userSettingsMethods.createUserSettings.call({}, (err, res) => {
              if (err) {
                console.log(`createUserSettings error: [${err.reason}]`, err);
                Library.modalErrorAlert(err.reason);
              }
            });

            SessionMethods.createUserSession.call({ sessionToken: sessionToken, keepMeLoggedIn: true }, (err, res) => {
              if (err) {
                console.log(`createSession error: [${err.reason}]`, err);
                Library.modalErrorAlert(err.reason);
              }
              if (!allowMultiSession) {
                Accounts.logoutOtherClients();
                SessionMethods.purgeAllOtherSessions.call({ sessionToken: sessionToken }, (err, res) => {
                  if (err) {
                    Library.modalErrorAlert(err.reason);
                    console.log(`purgeAllOtherSessions error`, err);
                  }
                });
                log.info(`Register - logout other clients - DONE`);
              }
            });
            
            PagesMethods.createPages.call({}, (err, id) => {
              if (err) {
                this.setState({ allowSubmit: true });
                Library.modalErrorAlert(err.reason);
                console.log(`createPages error`, err);
              }
            });


            ProfileMethods.createProfile.call(
              {
                fname: "",
                initial: "",
                lname: ""
              },
              (err, id) => {
                if (err) {
                  this.setState({ allowSubmit: true });
                  Library.modalErrorAlert(err.reason);
                  console.log(`createProfile error`, err);
                } else {
                  this.sendVerificationEmail(id);
                }
              }
            );

            AuthMethods.createAuth.call({}, (err, id) => {
              if (err) {
                this.setState({ allowSubmit: true });
                Library.modalErrorAlert(err.reason);
                console.log(`createAuth error: [${err.reason}]`, err);
              } else {
                console.log(`auth successfully created. res = [${id}]`);
              }
            });

            */
          }
        }
      );
    } else {
      Library.modalErrorAlert({
        message: "Please try again",
        title: "Password must be at least 6 characters."
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
        handleCheck={this.handleCheck}
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

export default withTracker(() => {
  return {};
})(Register);
