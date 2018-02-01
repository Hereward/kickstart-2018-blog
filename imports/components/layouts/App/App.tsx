import { Meteor } from "meteor/meteor";
import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import Header from "../../partials/Header";
import Main from "../../routes/Main";

interface IProps {
  signedIn: boolean;
  enhancedAuth: boolean;
  Email: string;
  MainTitle: string;
  ShortTitle: string;
  authVerified: boolean,
  EmailVerified: boolean,
  verificationEmailSent: number
}

class App extends React.Component<IProps> {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <BrowserRouter>
        <div>
          <div className="container-fluid header">
            <Header {...this.props} />
          </div>
          <div className="container main">
          <Main {...this.props} />
          </div>
        </div>
      </BrowserRouter>
    );
  }
}

export default withTracker(() => {
  let userDataReady = Meteor.subscribe("userData");
  let ProfilesDataReady = Meteor.subscribe("profiles");
  let authDataReady = Meteor.subscribe("enhancedAuth");
  let enhancedAuth: boolean = true;
  if (Meteor.settings.public.enhancedAuth.active === 0) {
    enhancedAuth = false;
  }

  let Email = " - Guest";
  let authVerified = false;
  let EmailVerified = Meteor.user() ? Meteor.user().emails[0].verified : false;
  let signedIn = false;
  let verificationEmailSent = 0;

  if (Meteor.loggingIn()) {
    Email = ` - logging in...`;
  } else if (Meteor.user()) {
    signedIn = true;
    let objData = JSON.stringify(Meteor.user());
    console.log(`USER = ${objData}`);
    Email = ` - ${Meteor.user().emails[0].address}`;

    if (userDataReady && typeof Meteor.user().enhancedAuth !== "undefined") {
      verificationEmailSent = Meteor.user().verificationEmailSent;
      authVerified = Meteor.user().enhancedAuth.verified;
    }
  }

  return {
    signedIn: signedIn,
    Email: Email,
    MainTitle: Meteor.settings.public.MainTitle,
    ShortTitle: Meteor.settings.public.ShortTitle,
    enhancedAuth: enhancedAuth,
    authVerified: authVerified,
    EmailVerified: EmailVerified,
    verificationEmailSent: verificationEmailSent
  };
})(App);

// && typeof Meteor.user().enhancedAuth !== "undefined"
