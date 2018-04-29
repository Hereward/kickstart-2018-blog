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
import * as User from "../../modules/user";

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
    <Route exact path="/" render={() => <Index {...props} />} />
    <Route path="/about" render={() => <About {...props} />} />
    <Route path="/profile" render={() => <Profile {...props} />} />
    <Route path="/verify-email" render={() => <VerifyEmail {...props} />} />
    <AuthRoute
      path="/forgot-password"
      cProps={props}
      component={ForgotPassWord}
      condition={!User.id()}
      redirect="/"
    />

    <AuthRoute
      path="/signin"
      cProps={props}
      component={SignIn}
      condition={!User.id()}
      redirect="/"
    />

    <AuthRoute
      path="/forgot-password-reset"
      cProps={props}
      component={ForgotPassWordReset}
      condition={!User.id()}
      redirect="/"
    />
    <AuthRoute
      path="/change-password"
      cProps={props}
      component={ChangePassword}
      condition={User.id()}
      redirect="/"
    />
    <AuthRoute path="/register" cProps={props} component={Register} condition={!User.id()} redirect="/" />
    <AuthRoute path="/authenticate" cProps={props} component={Authenticator} condition={User.id()} redirect="/" />
    
  </Switch>
);

export default MainRouter;

// <AuthRoute path="/authenticate" cProps={props} component={Authenticator} condition={!User.id()} redirect="/" />
// <Route path="/authenticate" render={() => <Authenticator {...props} />} />
