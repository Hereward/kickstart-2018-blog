import React from "react";
import { Switch, Route } from "react-router-dom";
import Index from "../pages/Index/Index";
import About from "../pages/Index/About";
import ForgotPassWord from "../pages/User/ForgotPassWord";
import Authenticator from "../pages/User/Authenticator";
import SignIn from "../pages/User/SignIn";
import VerifyEmail from "../pages/User/VerifyEmail";
import ForgotPassWordReset from "../pages/User/ForgotPassWordReset";
import Register from "../pages/User/Register";

const Main = props => (
  <main>
    <Switch>
      <Route exact path="/" component={Index} />
      <Route path="/about" component={About} />
      <Route path="/signin" render={() => (<SignIn {...props} />)} />
      <Route path="/authenticate" render={() => (<Authenticator {...props} />)} />
      <Route path="/forgot-password" render={() => (<ForgotPassWord {...props} />)} />
      <Route path="/verify-email" render={() => (<VerifyEmail {...props} />)} />
      <Route path="/forgot-password-reset" render={() => (<ForgotPassWordReset {...props} />)} />
      <Route path="/register" render={() => (<Register {...props} />)} />
    
    </Switch>
  </main>
);

export default Main;

