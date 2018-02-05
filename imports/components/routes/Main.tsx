import * as React from "react";
import { PrivateRoute, PublicRoute  } from 'react-router-with-props';
import { Redirect, Switch, Route } from "react-router-dom";
import Index from "../pages/Index/Index";
import About from "../pages/Index/About";
import ForgotPassWord from "../pages/User/ForgotPassWord";
import Authenticator from "../pages/User/Authenticator";
import SignIn from "../pages/User/SignIn";
import VerifyEmail from "../pages/User/VerifyEmail";
import ForgotPassWordReset from "../pages/User/ForgotPassWordReset";
import Register from "../pages/User/Register";

// boo
//const path = yourIsLoggedInCheck ? '/loggedInHome' : '/login';
//<Redirect to={path} />;

/*
const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      Meteor.user() ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: "/signin"
          }}
        />
      )
    }
  />
);
*/

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

const Main = props => (
  <main>
    <Switch>
      <Route exact path="/" component={Index} />
      <Route path="/about" component={About} />
      <PublicRoute redirectTo="/" authed={(Meteor.user())} path="/signin" component={SignIn} {...props} />
      <PrivateRoute redirectTo="/" authed={(Meteor.user())} path="/authenticate" component={Authenticator} />
      <Route path="/forgot-password" render={() => (<ForgotPassWord {...props} />)} />
      <Route path="/verify-email" render={() => (<VerifyEmail {...props} />)} />
      <Route path="/forgot-password-reset" render={() => (<ForgotPassWordReset {...props} />)} />
      <Route path="/register" render={() => (<Register {...props} />)} />
    </Switch>
  </main>
);
 
export default Main;

