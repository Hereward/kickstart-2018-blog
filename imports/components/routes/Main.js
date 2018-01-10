import React from "react";
import { Switch, Route } from "react-router-dom";
import Index from "../pages/Index/Index";
import About from "../pages/Index/About";
import ForgotPassWord from "../pages/User/ForgotPassWord";
import ForgotPassWordReset from "../pages/User/ForgotPassWordReset";
import Register from "../pages/User/Register";
import SignIn from "../pages/User/SignIn";
import Authenticator from "../pages/User/Authenticator";

const Main = props => (
  <main>
    <Switch>
      <Route exact path="/" component={Index} />
      <Route path="/about" component={About} />
      <Route path="/register" render={() => (<Register {...props} />)} />
      <Route path="/signin" render={() => (<SignIn {...props} />)} />
      <Route path="/forgot-password" render={() => (<ForgotPassWord {...props} />)} />
      <Route path="/forgot-password-reset" render={() => (<ForgotPassWordReset {...props} />)} />
      <Route path="/authenticate" component={Authenticator} />
    </Switch>
  </main>
);

export default Main;
