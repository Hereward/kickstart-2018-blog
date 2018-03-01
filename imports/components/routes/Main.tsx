import * as React from "react";
//import { PublicRoute  } from 'react-router-with-props';
import { Redirect, Switch, Route } from "react-router-dom";
import Index from "../pages/Index/Index";
import About from "../pages/About/AboutIndex";
import Profile from "../pages/Profile/ProfileIndex";
import ForgotPassWord from "../pages/User/ForgotPassWord";
import Authenticator from "../pages/User/Authenticator";
import SignIn from "../pages/User/SignIn";
import VerifyEmail from "../pages/User/VerifyEmail";
import ForgotPassWordReset from "../pages/User/ForgotPassWordReset";
import Register from "../pages/User/Register";

// boo
//const path = yourIsLoggedInCheck ? '/loggedInHome' : '/login';
//<Redirect to={path} />;


const AuthRoute = ({ component: Component, redirect, condition, cProps, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      (condition) ? (
        <Component {...cProps} {...props} />
      ) : (
        <Redirect
          to={{
            pathname: redirect
          }}
        />
      )
    }
  />
);


/*

const SignedOutRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      !Meteor.user() ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: "/"
          }}
        />
      )
    }
  />
);

*/

// <Route path="/authenticate" render={() => (<Authenticator {...props} />)} />

// <PublicRoute redirectTo="/" authed={Meteor.user()} path="/signin" component={SignIn} {...props} />
// <Route path="/signin" render={() => (<SignIn {...props} />)} />
// <PrivateRoute redirectTo="/about" authed={true} path="/authenticate" component={Authenticator} />
// <Route path="/authenticate" render={() => (<Authenticator {...props} />)} />
//<SillyRoute  path="/about" component={About} componentProps={props} />
// <Route path="/about" component={About} />

const Main = props => (
  <main>
    <Switch>
      <Route exact path="/" component={Index} />
      <Route path="/about" render={() => (<About {...props} />)} />
      <Route path="/profile" render={() => (<Profile {...props} />)} />
      <Route path="/verify-email" render={() => (<VerifyEmail {...props} />)} />
      <AuthRoute path="/forgot-password" cProps={props} component={ForgotPassWord} condition={(!Meteor.user())} redirect='/' />
      <AuthRoute path="/signin" cProps={props} component={SignIn} condition={(!Meteor.user())} redirect='/' />
      <AuthRoute path="/forgot-password-reset" cProps={props} component={ForgotPassWordReset} condition={(!Meteor.user())} redirect='/' />
      <AuthRoute path="/register" cProps={props} component={Register} condition={(!Meteor.user())} redirect='/' />
      <AuthRoute path="/authenticate" cProps={props} component={Authenticator} condition={(Meteor.user())} redirect='/' />
    </Switch>
  </main>
);
 
export default Main;

//<AuthRoute path="/forgot-password" cProps={props} component={ForgotPassWord} condition={(!Meteor.user())} redirect='/' />

