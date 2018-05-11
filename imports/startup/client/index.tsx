import * as React from "react";
import * as ReactDOM from "react-dom";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import * as RLocalStorage from "meteor/simply:reactive-local-storage";
import * as jquery from "jquery";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import App from "../../components/layouts/App/App";
import { addMeta } from "./meta";
import * as Library from "../../modules/library";
import * as ContentManagement from "../../modules/contentManagement";
import { keepAliveUserSession } from "../../api/sessions/methods";
//import { validateUserLogin } from "../../api/auth/methods";
import * as User from "../../modules/user";


class Launch extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <MuiThemeProvider>
        <App />
      </MuiThemeProvider>
    );
  }
}


const keepAlive = function keepAlive(activityDetected: any) {
  if (User.id()) {
    keepAliveUserSession.call({ activityDetected: activityDetected, sessionToken: User.sessionToken('get')}, (err, res) => {
      if (err) {
        console.log(`keepAliveUserSession client error`, err.reason);
      }
    });
  }
};

Accounts.onLogin(() => {
  let userData: any;
  userData = User.data();
  User.setUserDataCache(userData);
  log.info(`Client login`, User.id(), userData, User.sessionToken('get'));
});

Accounts.onLogout(() => {
  log.info(`Client Logout`, User.sessionToken('get'));
});

Meteor.startup(() => {
  log.info(`Meteor.startup`, User.sessionToken('get'));

  //let token = localStorage.getItem('Meteor.sessionToken');
  ReactDOM.render(<Launch />, document.getElementById("react-root"));
  addMeta();
  //validateLogin();

  let timeOutOn = Meteor.settings.public.session.timeOutOn === false ? false : true;
  if (timeOutOn === true) {
    keepAlive(false);
    let heartbeatInterval = Meteor.settings.public.session.heartbeatInterval || 300000;
    let inactivityTimeout = Meteor.settings.public.session.inactivityTimeout || 3600000;
    let activityDetected = false;
    let activityEvents = "mousemove click keydown";
    Meteor.setInterval(function keepMeAlive() {
      keepAlive(activityDetected);
      activityDetected = false;
    }, heartbeatInterval);

    jquery(document).on(activityEvents, function monitorActivity() {
      activityDetected = true;
    });
  }
});
