import { Meteor } from "meteor/meteor";
import * as React from "react";
import { BrowserRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import Header from "../../partials/Header";
import Footer from "../../partials/Footer";
import MainRouter from "../../routes/Main";
import { Profiles } from "../../../api/profiles/publish";

interface IProps {
  signedIn: boolean;
  enhancedAuth: boolean;
  Email: string;
  MainTitle: string;
  ShortTitle: string;
  authVerified: boolean;
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
          <main>
            <MainRouter {...this.props} />
          </main>
          <Footer {...this.props} />
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

  let signedIn = false;
  let profile: any;

  if (Meteor.user()) {
    signedIn = true;
    if (ProfilesDataReady) {
      profile = Profiles.findOne({ owner: Meteor.userId() });
    }
  }

  return {
    signedIn: signedIn,
    MainTitle: Meteor.settings.public.MainTitle,
    ShortTitle: Meteor.settings.public.ShortTitle,
    enhancedAuth: enhancedAuth,
    profile: profile,
    sillyProp: "banana"
  };
})(App);
