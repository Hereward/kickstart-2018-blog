import * as React from "react";
import { Redirect, Switch, Route } from "react-router-dom";
import Index from "../pages/Index/Index";
import About from "../pages/About/AboutIndex";
import Profile from "../pages/Profile/ProfileIndex";
import ForgotPassWord from "../pages/User/ForgotPassWord";
import Authenticator from "../pages/User/Authenticator";
import Register from "../pages/User/Register";
import SignIn from "../pages/User/SignIn";
import Locked from "../pages/Notification/Locked";
import VerifyEmail from "../pages/User/VerifyEmail";
import ForgotPassWordReset from "../pages/User/ForgotPassWordReset";
import ChangePassword from "../pages/User/ChangePassword";
import * as User from "../../modules/user";
import * as Library from "../../modules/library";

const RedirectRoute = ({ path, ...rest }) => {
  return <Route {...rest} render={props => <Redirect to={path} />} />;
};

const AuthRoute = ({ component: Component, type, cProps, ...rest }) => {
  let authRequired = User.authRequired(cProps);
  let emailVerified = Library.nested(["userData", "emails", 0, "verified"], cProps);
  let locked = Library.nested(["userSettings", "locked"], cProps);
  let path = cProps.location.pathname;
  let redirectTo: string;

  if (locked && path !== "/locked") {
    redirectTo = "/locked";
  } else if (authRequired && path !== "/authenticate") {
    redirectTo = "/authenticate";
  } else if (cProps.userId && locked === false && path === "/locked") {
    redirectTo = "/";
  } else if (!authRequired && path === "/authenticate") {
    redirectTo = "/";
  } else if (emailVerified === true && type === "emailVerify") {
    redirectTo = "/";
  } else if (!cProps.userId && type === "user") {
    redirectTo = "/";
  } else if (cProps.userId && type === "guest") {
    redirectTo = "/";
  }

  if (redirectTo) {
    return <RedirectRoute {...rest} path={redirectTo} />;
  } else {
    return <Route {...rest} render={props => <Component {...cProps} {...props} />} />;
  }
};

const MainRouter = props => (
  <Switch>
    <AuthRoute exact path="/" cProps={props} component={Index} type="any" />
    <AuthRoute path="/about" cProps={props} component={About} type="any" />
    <AuthRoute path="/verify-email" cProps={props} component={VerifyEmail} type="emailVerify" />
    <AuthRoute path="/forgot-password-reset" cProps={props} component={ForgotPassWordReset} type="guest" />
    <AuthRoute path="/forgot-password" cProps={props} component={ForgotPassWord} type="guest" />
    <AuthRoute path="/register" cProps={props} component={Register} type="guest" />
    <AuthRoute path="/signin" cProps={props} component={SignIn} type="guest" />
    <AuthRoute path="/authenticate" cProps={props} component={Authenticator} type="user" />
    <AuthRoute path="/profile" cProps={props} component={Profile} type="user" />
    <AuthRoute path="/locked" cProps={props} component={Locked} type="user" />
    <AuthRoute path="/change-password" cProps={props} component={ChangePassword} type="user" />
  </Switch>
);

export default MainRouter;
