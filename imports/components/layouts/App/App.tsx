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

  componentDidUpdate(prevProps, prevState, snapshot) {
      User.checkSessionToken(prevProps, this.props);
      //log.info(`App`, this.props);
  }

  componentWillMount() {}

  

  render() {
    //this.checksessionToken();
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
  let ProfilesDataReady = Meteor.subscribe("profiles");
  let authDataReady = Meteor.subscribe("enhancedAuth");
  let userSettingsDataReady = Meteor.subscribe("userSettings");
  let sessionDataReady = Meteor.subscribe("userSessions");

  let authData: any;
  let userSession: any;
  let userSettingsRec: any;
  //let userSettings: any;
  let userData: any;
  let sessionActive: boolean = false;
  let sessionExpired: boolean = false;
  let enhancedAuth = Meteor.settings.public.enhancedAuth.active === false ? false : true;
  let sessionToken: string;

  //let oldToken = Accounts._lastsessionTokenWhenPolled;

  let loggingIn: boolean;
  loggingIn = User.loggingIn();
  userData = User.data();
  let admin = false;
  let profile: any;

  if (userData && !loggingIn) {
    //sessionToken = User.sessionToken("get");
    sessionToken = User.sessionToken("get"); 
    let hashedToken = User.hash(sessionToken);

    //RLocalStorage.getItem("Meteor.Kickstart2018.SessionToken");
    //log.info(`App - LOGIN TOKEN:`, sessionToken, enhancedAuth);
    //  if (ProfilesDataReady) {
    profile = Profiles.findOne({ owner: userData._id });
    if (profile) {
      admin = profile.admin;
    }
    //  }

    // if (sessionDataReady && authDataReady && userSettingsDataReady) {
    userSettingsRec = userSettings.findOne({ owner: userData._id });
    // let token = localStorage.getItem("Meteor.sessionToken");

    userSession = userSessions.findOne({ owner: userData._id, sessionToken: hashedToken });

    if (userSession) {
      sessionActive = userSession.active;
      sessionExpired = userSession.expired;
      authData = Auth.findOne({ owner: userData._id, sessionId: userSession._id });
      //log.info(`App userSession FOUND!!!`, userSession._id, authData, sessionToken);
    }
    //  }
  }

  //let userId = User.id();

  return {
    MainTitle: Meteor.settings.public.MainTitle,
    ShortTitle: Meteor.settings.public.ShortTitle,
    enhancedAuth: enhancedAuth,
    userSettings: userSettingsRec,
    authData: authData,
    userSession: userSession,
    userData: userData,
    sessionActive: sessionActive,
    sessionExpired: sessionExpired,
    loggingIn: loggingIn,
    profile: profile,
    admin: admin,
    sessionToken: sessionToken
  };
})(App);
