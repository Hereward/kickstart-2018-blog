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
import { restoreUserSession } from "../../../api/sessions/methods";

interface IProps {
  signedIn: boolean;
  enhancedAuth: boolean;
  Email: string;
  MainTitle: string;
  ShortTitle: string;
  authVerified: boolean;
  sessionToken: string;
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

export default withTracker(() => {
  let profilesHandle = Meteor.subscribe("profiles");
  let userSettingsHandle = Meteor.subscribe("userSettings");
  let userSessionHandle = Meteor.subscribe("userSessions");
  let sessionReady = false;
  let userSession: any;
  let userSettingsRec: any;
  let userData: any;
  let sessionActive: boolean = false;
  let sessionExpired: boolean = false;
  let enhancedAuth = Meteor.settings.public.enhancedAuth.active === false ? false : true;
  let sessionToken: string;
  let loggingIn: boolean;
  let userId = User.id();
  loggingIn = User.loggingIn();
  userData = User.data();

  let admin = false;
  let profile: any;

  if (userData && !loggingIn) {
    sessionToken = User.sessionToken("get");
    let hashedToken = sessionToken ? User.hash(sessionToken) : "";

    profile = Profiles.findOne({ owner: userData._id });
    if (profile) {
      admin = profile.admin;
    }

    userSettingsRec = userSettings.findOne({ owner: userData._id });

    userSession = userSessions.findOne({ owner: userData._id, sessionToken: hashedToken });

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
    userSessionDataReady: userSessionHandle.ready()
  };
})(App);
