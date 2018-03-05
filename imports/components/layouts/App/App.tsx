import { Meteor } from "meteor/meteor";
import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import Header from "../../partials/Header";
import MainRouter from "../../routes/Main";
import { Profiles } from "../../../api/profiles/publish";

interface IProps {
  signedIn: boolean;
  enhancedAuth: boolean;
  Email: string;
  MainTitle: string;
  ShortTitle: string;
  authVerified: boolean;
  EmailVerified: boolean;
}

class App extends React.Component<IProps> {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <BrowserRouter>
        <div className="router-parent d-flex flex-column">
            <Header {...this.props} />
          <main className="container main mb-auto">
            <MainRouter {...this.props} />
          </main>
          <footer className="mt-auto">{Meteor.settings.public.footerText}</footer>
        </div>
      </BrowserRouter>
    );
  }
}

export default withTracker(() => {
  let ProfilesDataReady = Meteor.subscribe("profiles");
  let enhancedAuth: boolean = true;
  let authData: any;
  if (Meteor.settings.public.enhancedAuth.active === 0) {
    enhancedAuth = false;
  }

  let emailDashDisplay = " - Guest";
  let EmailVerified = false;
  let signedIn = false;
  let profile: any;

  if (Meteor.loggingIn()) {
    emailDashDisplay = ` - logging in...`;
  } else if (Meteor.user()) {
    EmailVerified = Meteor.user().emails[0].verified;
    signedIn = true;
    emailDashDisplay = ` - ${Meteor.user().emails[0].address}`;

    if (ProfilesDataReady) {
      profile = Profiles.findOne({ owner: Meteor.userId() });
    }
  }

  return {
    signedIn: signedIn,
    emailDashDisplay: emailDashDisplay,
    MainTitle: Meteor.settings.public.MainTitle,
    ShortTitle: Meteor.settings.public.ShortTitle,
    enhancedAuth: enhancedAuth,
    EmailVerified: EmailVerified,
    profile: profile,
    sillyProp: "banana"
  };
})(App);
