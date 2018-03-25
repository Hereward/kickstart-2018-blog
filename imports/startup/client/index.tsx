import * as React from "react";
import * as ReactDOM from "react-dom";
import { Meteor } from "meteor/meteor";
import { Session } from 'meteor/session';
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import App from "../../components/layouts/App/App";
import { addMeta } from "./meta";
import * as Library from "../../modules/library";
import * as AuthMethods from "../../api/auth/methods";
import * as ContentManagement from "../../modules/contentManagement";


//declare var Meteor: any;

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

      //ContentManagement.refreshDefaultContent();
    }

    cookie = Library.setCookie("resume", "true", false);
  }
}

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
