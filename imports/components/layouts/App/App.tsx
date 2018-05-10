import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Accounts } from "meteor/accounts-base";
import * as RLocalStorage from "meteor/simply:reactive-local-storage";
import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import Header from "../../partials/Header";
import Footer from "../../partials/Footer";
import MainRouter from "../../routes/Main";
import { Profiles } from "../../../api/profiles/publish";
import * as User from "../../../modules/user";
import { userSessions } from "../../../api/sessions/publish";
import { userSettings } from "../../../api/settings/publish";
import { Auth } from "../../../api/auth/publish";
import Spinner from "../../partials/Spinner";

interface IProps {
  signedIn: boolean;
  enhancedAuth: boolean;
  Email: string;
  MainTitle: string;
  ShortTitle: string;
  sessionToken: string;
  status: any;
  sessionReady: boolean;
}

interface IState {}

class App extends React.Component<IProps, IState> {
  tokenCheckDone: boolean;

  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {}

  componentWillUpdate() {}

  componentDidUpdate(prevProps, prevState, snapshot) {}

  componentWillMount() {}

  render() {
    if (!this.props.sessionReady && this.props.status && !this.props.status.connected && this.props.status.retryCount>1) { 
      return <Spinner caption="connecting" type='page' />;
    } else {
      return (
        <BrowserRouter>
          <div className="router-parent d-flex flex-column">
            <Header {...this.props} />
            <main>
              <MainRouter {...this.props} />
            </main>
            <Footer {...this.props} />
          </div>
        </BrowserRouter>
      );
    }
  }
}

export default withTracker(() => {
  let profilesHandle = Meteor.subscribe("profiles");
  let userSettingsHandle = Meteor.subscribe("userSettings");
  let userSessionHandle = Meteor.subscribe("userSessions");
  let sessionReady = false;
  let userSession: any;
  let userSettingsRec: any;
  //let userData: any;
  let sessionActive: boolean = false;
  let sessionExpired: boolean = false;
  let enhancedAuth = Meteor.settings.public.enhancedAuth.active === false ? false : true;
  let sessionToken: string;
  //let loggingIn: boolean;
  let userId = User.id();
  let loggingIn = User.loggingIn();
  let userData = User.data();
  let status = Meteor.status();

  

  let admin = false;
  let profile: any;

  if (userId && userData) {
    sessionToken = User.sessionToken("get");
    let hashedToken = sessionToken ? User.hash(sessionToken) : "";

    profile = Profiles.findOne({ owner: userId });
    if (profile) {
      admin = profile.admin;
    }

    userSettingsRec = userSettings.findOne({ owner: userId });

    userSession = userSessions.findOne({ owner: userId, sessionToken: hashedToken });

    if (userSession) {
      sessionActive = userSession.active;
      sessionExpired = userSession.expired;
    }

    if (
      userId &&
      profilesHandle.ready() &&
      userSettingsHandle.ready() &&
      userSessionHandle.ready() &&
      userData &&
      !loggingIn
    ) {
      sessionReady = true;
    }

    // log.info(`Meteor vars: sessionReady userId loggingIn userData status`, sessionReady, userId, loggingIn, userData, status);
  }

  return {
    MainTitle: Meteor.settings.public.MainTitle,
    ShortTitle: Meteor.settings.public.ShortTitle,
    enhancedAuth: enhancedAuth,
    userSettings: userSettingsRec,
    userSession: userSession,
    userData: userData,
    userId: userId,
    sessionActive: sessionActive,
    sessionExpired: sessionExpired,
    loggingIn: loggingIn,
    profile: profile,
    admin: admin,
    sessionToken: sessionToken,
    sessionReady: sessionReady,
    status: status
  };
})(App);
