import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { Accounts } from "meteor/accounts-base";
import * as RLocalStorage from "meteor/simply:reactive-local-storage";
import * as React from "react";
import { Helmet } from "react-helmet";
import { connect } from "react-redux";
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
import Snackbar from "../../partials/Snackbar";
import Meta from "../../partials/Meta";
import Splash from "../../partials/Splash";

interface IProps {
  history: any;
  signedIn: boolean;
  enhancedAuth: boolean;
  Email: string;
  sessionToken: string;
  sessionReady: boolean;
  connected: boolean;
  connectionRetryCount: number;
  systemSettings: any;
  miniAlert: any;
  loggingIn: boolean;
  userId: string;
  dispatch: any;
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

  closeMiniAlert = () => {
    this.props.dispatch({ type: "MINI_ALERT_OFF" });
  };

  mainContent() {
    const path = this.props.history.location.pathname;
    const meta = this.props.systemSettings ? <Meta location={path} settings={this.props.systemSettings} /> : "";
    return (
      <div className="router-parent d-flex flex-column">
        {meta}
        <Header {...this.props} />
        <main>
          <MainRouter {...this.props} />
        </main>
        {!path.match(/admin/) ? <Footer {...this.props} /> : ""}
        <Snackbar message={this.props.miniAlert.message} close={this.closeMiniAlert} isOpen={this.props.miniAlert.on} />
      </div>
    );
  }

  getLayout() {
    if (!this.props.systemSettings) {
      return <Splash />;
    } else {
      return this.mainContent();
    }
  }

  render() {
    return this.getLayout();
  }
}

export default withRouter(
  connect(state => {
    return { reduxState: state };
  })(
    withTracker(props => {
      let isClient = Meteor.isClient;
      let userSettingsRec: any;
      let profilesHandle = Meteor.subscribe("profiles-public");
      let userSettingsHandle = Meteor.subscribe("userSettings");
      let userSessionHandle = Meteor.subscribe("userSessions");
      let systemSettingsHandle = Meteor.subscribe("systemSettings");

      let systemSettingsRec = systemSettings.findOne();
      let sessionReady = false;
      let userSession: any;
      let sessionActive: boolean = false;
      let sessionExpired: boolean = false;
      let enhancedAuth = Meteor.settings.public.enhancedAuth.active === false ? false : true;
      let sessionToken: string;
      let loggingOut = props.reduxState.loggingOut;
      let miniAlert = props.reduxState.miniAlert;
      let userId = User.id();
      let loggingIn = User.loggingIn();
      let userData = User.data();
      let connected: boolean;
      let connectionRetryCount: number = 0;
      connected = Meteor.status().connected;
      connectionRetryCount = Meteor.status().retryCount;

      let profilePublic: any;

      if (userId && userData) {
        sessionToken = User.sessionToken("get");
        let hashedToken = sessionToken ? User.hash(sessionToken) : "";

        profilePublic = Profiles.findOne({ owner: userId });

        userSettingsRec = userSettings.findOne({ owner: userId });

        userSession = userSessions.findOne({ owner: userId, sessionToken: hashedToken, active: true });

        if (userSession) {
          sessionActive = userSession.active;
          sessionExpired = userSession.expired;
        }

        if (
          profilesHandle.ready() &&
          connected &&
          userId &&
          userSettingsHandle.ready() &&
          userSessionHandle.ready() &&
          systemSettingsHandle.ready() &&
          userData &&
          !loggingIn
        ) {
          sessionReady = true;
        }
      }

      return {
        enhancedAuth: enhancedAuth,
        userSettings: userSettingsRec,
        userSession: userSession,
        userData: userData,
        userId: userId,
        sessionActive: sessionActive,
        sessionExpired: sessionExpired,
        loggingIn: loggingIn,
        profilePublic: profilePublic,
        sessionToken: sessionToken,
        sessionReady: sessionReady,
        connected: connected,
        connectionRetryCount: connectionRetryCount,
        systemSettings: systemSettingsRec,
        loggingOut: loggingOut,
        miniAlert: miniAlert,
        isClient: isClient
      };
    })(App)
  )
);
