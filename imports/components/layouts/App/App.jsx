import React, { Component } from "react";
import { BrowserRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import Header from "../../partials/Header";
import Main from "../../routes/Main";

/*
const App = props => (
  <div>
    <Header />
    <Main />
  </div>
);
*/

class App extends Component {
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
  let Email = " - Guest";
  let AuthVerified = false;
  let EmailVerified =  (Meteor.user()) ? Meteor.user().emails[0].verified : false;
  let SignedIn = false;
  let EmailVerificationAlert = false;
  let verificationEmailSent = 0;
  //let EnhancedAuthObj = {verified: false, currentAttempts: 0, private_key: null};
  //let user = {Meteor.user()};

  if (Meteor.loggingIn()) {
    Email = ` - logging in...`;
  } else if (Meteor.user()) {
    verificationEmailSent = Meteor.user().verificationEmailSent;
    Email = ` - ${Meteor.user().emails[0].address}`;
    //AuthVerified = Meteor.user().auth_verified;
    AuthVerified = Meteor.user().enhancedAuth.verified;

    if (verificationEmailSent && AuthVerified && !EmailVerified) {
      EmailVerificationAlert = true;
    }
    SignedIn = true;
  }

  return {
    SignedIn: SignedIn,
    Email: Email,
    MainTitle: Meteor.settings.public.MainTitle,
    ShortTitle: Meteor.settings.public.ShortTitle,
    enhancedAuth: Meteor.settings.public.enhancedAuth.active, 
    AuthVerified: AuthVerified,
    EmailVerificationAlert: EmailVerificationAlert,
    EmailVerified: EmailVerified,
    verificationEmailSent: verificationEmailSent,
  };
})(App);
