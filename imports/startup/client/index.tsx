import * as React from "react";
import * as ReactDOM from "react-dom";
import { Meteor } from "meteor/meteor";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import App from "../../components/layouts/App/App";
import { addMeta } from "./meta";
import * as Library from "../../modules/library";
import * as AuthMethods from "../../api/auth/methods";
import * as PageMethods from "../../api/pages/methods";

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
  checkSessionCookie();
  ReactDOM.render(<Launch />, document.getElementById("react-root"));
  addMeta();
});

function checkSessionCookie() {
  let cookie: any;
  console.log('checkSessionCookie');
  cookie = Library.getCookie("resume");
  if (cookie) {
    console.log(`Session cookie found.`, cookie);
  } else  {
    if (Meteor.user() || Meteor.loggingIn()) {
      console.log(`Logging you out as the session cookie can't be found.`);
      AuthMethods.setVerified.call({ verified: false }, (err, res) => {
        if (err) {
          //Library.modalErrorAlert(err.reason);
          console.log(`setVerified error`, err);
        }
      });
      Meteor.logout();
      PageMethods.refreshDefaultContent();
    }

    cookie = Library.setCookie("resume", "true", false);
    console.log(`Session cookie was set.`, cookie);
  }

}
