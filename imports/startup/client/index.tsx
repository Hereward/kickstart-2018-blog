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
import { keepAliveUserSession } from "../../api/sessions/methods";

/*
function checkSessionCookie() {
  let cookie: any;
  cookie = Library.getCookie("resume");
  if (cookie) {
    // console.log(`Session cookie found.`, cookie);
  } else {
    if (Meteor.user() || Meteor.loggingIn()) {
      Meteor.logout(() => {
        AuthMethods.setVerified.call({ verified: false }, (err, res) => {
          if (err) {
            Library.modalErrorAlert(err.reason);
          }
        });
      });
    }

    cookie = Library.setCookie("resume", "true", false);
  }
}
*/

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

Meteor.startup(() => {
  //checkSessionCookie();
  ReactDOM.render(<Launch />, document.getElementById("react-root"));
  addMeta();

  let timeOutOn = Meteor.settings.public.session.timeOutOn === false ? false : true;
  console.log(`timeOutOn=[${timeOutOn}]`);
  if (timeOutOn === true) {
    let heartbeatInterval = Meteor.settings.public.session.heartbeatInterval || 300000;
    let inactivityTimeout = Meteor.settings.public.session.inactivityTimeout || 3600000;
    let activityDetected = false;
    console.log(`heartbeatInterval=[${heartbeatInterval}] inactivityTimeout=[${inactivityTimeout}]`);

    let activityEvents = "mousemove click keydown";
    Meteor.setInterval(function keepAlive() {
      //console.log(`keepAlive !`, Meteor.userId(), activityDetected);
      if (Meteor.userId()) {
        keepAliveUserSession.call({ id: Meteor.userId(), activityDetected: activityDetected }, (err, res) => {
          if (err) {
            console.log(`keepAliveUserSession client error`, err.reason);
          }
        });
        activityDetected = false;
      }
    }, heartbeatInterval);

    jquery(document).on(activityEvents, function monitorActivity() {
      activityDetected = true;
      //console.log(`activityDetected !`);
    });
  }
});
