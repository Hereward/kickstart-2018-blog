import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import * as PropTypes from "prop-types";
import ReactRouterPropTypes from "react-router-prop-types";
import { withTracker } from "meteor/react-meteor-data";
import * as React from "react";
import { Link, withRouter, Redirect } from "react-router-dom";
import * as AuthMethods from "../../../api/auth/methods";
import * as SessionMethods from "../../../api/sessions/methods";
import * as Library from "../../../modules/library";
import Transition from "../../partials/Transition";
import SignInForm from "../../forms/SignInForm";
import * as ContentManagement from "../../../modules/contentManagement";
import * as User from "../../../modules/user";

interface IProps {
  history: any;
  AuthVerified: boolean;
  enhancedAuth: boolean;
  sessionToken: string;
  userSettings: any;
}

interface IState {
  email: string;
  password: string;
  allowSubmit: boolean;
}

class SignIn extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.SignInUser = this.SignInUser.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      password: "",
      email: "",
      allowSubmit: true
    };
  }

  componentWillMount() {}

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {}

  static propTypes = {
    history: ReactRouterPropTypes.history,
    enhancedAuth: PropTypes.bool
  };

  handleChange(e) {
    let target = e.target;
    let value = target.value;
    let id = target.id;

    this.setState({ [id]: value });
  }

  getLayout() {
    let form = (
      <SignInForm
        allowSubmit={this.state.allowSubmit}
        handleChange={this.handleChange}
        handleSubmit={this.SignInUser}
      />
    );

    if (!User.data()) {
      return form;
    } else {
      return (
        <div>
          <h2>Signed In</h2>
          <div>
            You are signed in as <strong>{User.data().emails[0].address}</strong>.
          </div>
        </div>
      );
    }
  }

  createSession(destination = "") {
    let token = User.sessionToken('create'); //Accounts._storedsessionToken();
    SessionMethods.createUserSession.call({ sessionToken: token }, (err, res) => {
      if (err) {
        console.log(`createSession error: [${err.reason}]`, err);
        Library.modalErrorAlert(err.reason);
      } else if (destination) {
        this.props.history.push(destination);
      }
    });
  }

  SignInUser() {
    this.setState({ allowSubmit: false });
    let destination = "/";
    let allowMultiSession = Meteor.settings.public.session.allowMultiSession || false;
    Meteor.loginWithPassword(this.state.email, this.state.password, error => {
      this.setState({ allowSubmit: true });
      if (error) {
        return Library.modalErrorAlert({ detail: error.reason, title: "Sign In Failed" });
      } else if (!allowMultiSession) {
          Accounts.logoutOtherClients();
      }
      this.createSession();
        /*
        log.info(`SignInUser`, this.props);

        if (this.props.userSettings && this.props.userSettings.authEnabled) {
          let destination = "/authenticate";
        }

        this.createSession(destination);
        */
      
    });
  }

  render() {
    return (
      <Transition>
        <div className="container page-content">{this.getLayout()}</div>
      </Transition>
    );
  }
}

export default withRouter(
  withTracker(() => {
    //let sessionDataReady = Meteor.subscribe("userSessions");
    return {};
  })(SignIn)
);
