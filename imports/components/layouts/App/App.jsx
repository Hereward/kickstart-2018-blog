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
          <div className="container header">
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
  let UserName = " - Guest";
  let AuthVerified = false;
  let SignedIn = false;

  if (Meteor.loggingIn()) {
    UserName = ` - logging in...`;
  } else if (Meteor.user()) {
    UserName = ` - ${Meteor.user().username}`;
    AuthVerified = Meteor.user().auth_verified;
    SignedIn = true;
  }

  return {
    SignedIn: SignedIn,
    UserName: UserName,
    MainTitle: Meteor.settings.public.MainTitle,
    ShortTitle: Meteor.settings.public.ShortTitle,
    EnhancedAuth: Meteor.settings.public.EnhancedAuth,
    AuthVerified: AuthVerified,
    mySillyProp: "boo"
  };
})(App);
