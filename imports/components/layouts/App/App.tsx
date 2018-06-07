import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Accounts } from "meteor/accounts-base";
import * as RLocalStorage from "meteor/simply:reactive-local-storage";
import * as React from "react";
import { connect } from "react-redux";
//import { createStore } from "redux";
//import { Provider } from "react-redux";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import Header from "../../partials/Header";
import Footer from "../../partials/Footer";
import MainRouter from "../../routes/Main";
import { Profiles } from "../../../api/profiles/publish";
import * as User from "../../../modules/user";
import { userSessions } from "../../../api/sessions/publish";
import { userSettings } from "../../../api/settings/publish";
import { systemSettings } from "../../../api/admin/publish";
import { Auth } from "../../../api/auth/publish";
import Spinner from "../../partials/Spinner";
import Offline from "../../partials/Offline";
import * as Library from "../../../modules/library";
//import rootReducer from "../../../redux/reducers";

//declare var window: any;

//const store = createStore(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
/*
store.subscribe(() => {
  log.info("REDUX STORE", store.getState());
});
*/

interface IProps {
  history: any;
  signedIn: boolean;
  enhancedAuth: boolean;
  Email: string;
  MainTitle: string;
  ShortTitle: string;
  sessionToken: string;
  sessionReady: boolean;
  connected: boolean;
  connectionRetryCount: number;
  systemSettings: any;
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
    if (prevProps.systemSettings !== this.props.systemSettings) {
      Library.addMeta(this.props.systemSettings);
    }
  }

  componentWillMount() {}

  getLayout() {
    const path = this.props.history.location.pathname;
    let admin = User.can({ threshold: "super-admin" });
    if (!this.props.sessionReady && !this.props.connected && this.props.connectionRetryCount > 1) {
      return <Spinner caption="connecting" type="page" />;
      //} else if (this.props.systemSettings && this.props.systemSettings.systemOnline !== true && !admin) {
      // return <Offline />;
    } else {
      return (
        <div className="router-parent d-flex flex-column">
          <Header {...this.props} />
          <main>
            <MainRouter {...this.props} />
          </main>
          {!path.match(/admin/) ? <Footer {...this.props} /> : ""}
        </div>
      );
    }
  }

  render() {
    return this.getLayout();
  }
}

export default withRouter(
  connect(state => state)(
    withTracker(() => {
      let profilesHandle = Meteor.subscribe("profiles");
      let userSettingsHandle = Meteor.subscribe("userSettings");
      let userSessionHandle = Meteor.subscribe("userSessions");
      let systemSettingsHandle = Meteor.subscribe("systemSettings");
      let sessionReady = false;
      let userSession: any;
      let systemSettingsRec = systemSettings.findOne();
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
      let connected: boolean;
      let connectionRetryCount: number = 0;
      connected = Meteor.status().connected;
      connectionRetryCount = Meteor.status().retryCount;

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

        userSession = userSessions.findOne({ owner: userId, sessionToken: hashedToken, active: true });

        if (userSession) {
          sessionActive = userSession.active;
          sessionExpired = userSession.expired;
        }

        if (
          connected &&
          userId &&
          profilesHandle.ready() &&
          userSettingsHandle.ready() &&
          userSessionHandle.ready() &&
          systemSettingsHandle.ready() &&
          userData &&
          !loggingIn
        ) {
          sessionReady = true;
        }

        log.info(`APP - settings`, systemSettingsRec);
      }

      /*
  log.info(
    `Meteor vars: sessionReady userId loggingIn userData`,
    sessionToken,
    sessionReady,
    userId,
    loggingIn,
    userData,
  );
  */

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
        connected: connected,
        connectionRetryCount: connectionRetryCount,
        systemSettings: systemSettingsRec
      };
    })(App)
  )
);
