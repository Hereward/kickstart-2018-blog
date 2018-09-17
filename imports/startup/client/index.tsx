import * as React from "react";
import * as ReactDOM from "react-dom";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { BrowserRouter } from "react-router-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";
import * as jquery from "jquery";
import App from "../../components/layouts/App/App";
import { keepAliveUserSession } from "../../api/sessions/methods";
import * as User from "../../modules/user";
import rootReducer from "../../redux/reducers";

declare var window: any;

const store = createStore(rootReducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());

const Launch = props => {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <App />
      </Provider>
    </BrowserRouter>
  );
};

const keepAlive = function keepAlive(activityDetected: any) {
  if (User.id()) {
    keepAliveUserSession.call(
      { activityDetected: activityDetected, sessionToken: User.sessionToken("get") },
      (err, res) => {
        if (err) {
          console.log(`keepAliveUserSession client error`, err.reason);
        }
      }
    );
  }
};

Accounts.onLogin(() => {
  let userData: any;
  userData = User.data();
  User.setUserDataCache(userData);
});

Accounts.onLogout(() => {
  log.info(`Client Logout`, User.sessionToken("get"));
  User.clearLocalStorage();
  store.dispatch({ type: "LOGOUT_DONE" });
});

Meteor.startup(() => {
  ReactDOM.hydrate(<Launch />, document.getElementById("react-root"));
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

window.onfocus = () => {
  Meteor.reconnect();
};
