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
declare var FB: any;

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
  //log.info(`Client login`, User.id(), userData, User.sessionToken("get"));
});

Accounts.onLogout(() => {
  log.info(`Client Logout`, User.sessionToken("get"));
  User.clearLocalStorage();
  store.dispatch({ type: "LOGOUT_DONE" });
});

/*
const initFB = () => {

  window.fbAsyncInit = function() {
    FB.init({
      appId      : '537172216737060',
      xfbml      : true,
      version    : 'v3.1'
    });
    FB.AppEvents.logPageView();
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "https://connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
  
}; 
*/

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
  //initFB();
});

window.onfocus = () => {
  log.info("Reconnecting Meteor...");
  Meteor.reconnect();
};
