import React from "react";
import { Switch, Route } from "react-router-dom";
import Index from "../pages/Index/Index";
import About from "../pages/Index/About";
import Register from "../pages/User/Register";
import SignIn from "../pages/User/SignIn";
import Authenticator from "../pages/User/Authenticator";

const Main = props => (
  <main>
    <Switch>
      <Route exact path="/" component={Index} />
      <Route path="/about" component={About} />
      <Route path="/register" component={Register} />
      <Route path="/signin" render={() => (<SignIn {...props} />)} />
      <Route path="/authenticate" component={Authenticator} />
    </Switch>
  </main>
);

export default Main;
