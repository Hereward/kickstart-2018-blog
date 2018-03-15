import * as React from "react";
import { Redirect, Switch, Route } from "react-router-dom";
import Index from "../pages/Index/Index";
import About from "../pages/About/AboutIndex";
import Profile from "../pages/Profile/ProfileIndex";
import ForgotPassWord from "../pages/User/ForgotPassWord";
import Authenticator from "../pages/User/Authenticator";
import Register from "../pages/User/Register";
import SignIn from "../pages/User/SignIn";
import VerifyEmail from "../pages/User/VerifyEmail";
import ForgotPassWordReset from "../pages/User/ForgotPassWordReset";
import ChangePassword from "../pages/User/ChangePassword";

const AuthRoute = ({ component: Component, redirect, condition, cProps, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      condition ? (
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

const MainRouter = props => (
  <Switch>
    <Route exact path="/" component={Index} />
    <Route path="/about" render={() => <About {...props} />} />
    <Route path="/profile" render={() => <Profile {...props} />} />
    <Route path="/verify-email" render={() => <VerifyEmail {...props} />} />
    <AuthRoute
      path="/forgot-password"
      cProps={props}
      component={ForgotPassWord}
      condition={!Meteor.user()}
      redirect="/"
    />
    <AuthRoute path="/signin" cProps={props} component={SignIn} condition={!Meteor.user()} redirect="/" />
    <AuthRoute
      path="/forgot-password-reset"
      cProps={props}
      component={ForgotPassWordReset}
      condition={!Meteor.user()}
      redirect="/"
    />
    <AuthRoute
      path="/change-password"
      cProps={props}
      component={ChangePassword}
      condition={Meteor.user()}
      redirect="/"
    />
    <AuthRoute path="/register" cProps={props} component={Register} condition={!Meteor.user()} redirect="/" />
    <AuthRoute path="/authenticate" cProps={props} component={Authenticator} condition={Meteor.user()} redirect="/" />
  </Switch>
);

export default MainRouter;
