import * as React from "react";
import * as ReactDOM from "react-dom";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import * as jquery from "jquery";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import App from "../../components/layouts/App/App";
import { addMeta } from "./meta";
import * as Library from "../../modules/library";
import * as AuthMethods from "../../api/auth/methods";
import * as ContentManagement from "../../modules/contentManagement";
import { keepAliveUserSession, restoreUserSession } from "../../api/sessions/methods";
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
  if (User.data()) {
    keepAliveUserSession.call({ id: User.id(), activityDetected: activityDetected }, (err, res) => {
      if (err) {
        console.log(`keepAliveUserSession client error`, err.reason);
      }
    });
  }
};

const restoreSession = function restoreSession() {
  if (User.data()) {
    //console.log(`restoreSession`, User.id(), User.data());
    restoreUserSession.call({ id: User.id() }, (err, res) => {
      if (err) {
        console.log(`restoreUserSession client error`, err.reason);
      }
    });
  }
};

Accounts.onLogout(() => {
  console.log(`(Client) Logout`, User.id(), User.data());

  /*
  restoreUserSession.call({ id: User.id() }, (err, res) => {
    if (err) {
      console.log(`restoreUserSession client error`, err.reason);
    }
  });
  */

  /*
  destroySession.call({ id: id}, (err, res) => {
    if (err) {
      console.log(`SERVER destroySession error`, err.reason);
    }
  });
  */
});

Meteor.startup(() => {
  ReactDOM.render(<Launch />, document.getElementById("react-root"));
  addMeta();

  let timeOutOn = Meteor.settings.public.session.timeOutOn === false ? false : true;
  if (timeOutOn === true) {
    restoreSession();
    let heartbeatInterval = Meteor.settings.public.session.heartbeatInterval || 300000;
    let inactivityTimeout = Meteor.settings.public.session.inactivityTimeout || 3600000;
    let activityDetected = false;

    let activityEvents = "mousemove click keydown";
    //Meteor.setInterval(keepAlive(activityDetected), heartbeatInterval);

    Meteor.setInterval(function keepMeAlive() {
      keepAlive(activityDetected);
      activityDetected = false;
    }, heartbeatInterval);

    jquery(document).on(activityEvents, function monitorActivity() {
      activityDetected = true;
    });
  }
});
