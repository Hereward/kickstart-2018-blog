import * as React from "react";
import { Redirect, Switch, Route } from "react-router-dom";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import Index from "../pages/Index/Index";
import Page from "../pages/Generated/Page";
import Admin from "../pages/Admin/AdminIndex";
import Profile from "../pages/Profile/ProfileIndex";
import ForgotPassWord from "../pages/User/ForgotPassWord";
import Authenticator from "../pages/User/Authenticator";
import Register from "../pages/User/Register";
import Enroll from "../pages/User/Enroll";
import SignIn from "../pages/User/SignIn";
import Locked from "../pages/Notification/Locked";
import Offline from "../partials/Offline";
import VerifyEmail from "../pages/User/VerifyEmail";
import ForgotPassWordReset from "../pages/User/ForgotPassWordReset";
import ChangePassword from "../pages/User/ChangePassword";
import * as User from "../../modules/user";
import * as Library from "../../modules/library";
import { Pages } from "../../api/pages/publish";

interface IProps {
  slugs: any;
  pages: any;
}

const RedirectRoute = ({ path, ...rest }) => {
  return <Route {...rest} render={props => <Redirect to={path} />} />;
};

const AuthRoute = ({ component: Component, type, cProps, ...rest }) => {
  let authRequired = User.authRequired(cProps);
  let emailVerified = Library.nested(["userData", "emails", 0, "verified"], cProps);
  let locked = Library.nested(["userSettings", "locked"], cProps);
  let path = cProps.location.pathname;
  let redirectTo: string;
  let admin = User.can({ threshold: "admin" });

  if (locked && path !== "/locked") {
    redirectTo = "/locked";
  } else if (!locked && !authRequired && path === "/locked") {
    redirectTo = "/";
  } else if (authRequired && !locked && path !== "/members/authenticate") {
    redirectTo = "/members/authenticate";
  } else if (cProps.userId && locked === false && path === "/members/locked") {
    redirectTo = "/";
  } else if (!authRequired && path === "/members/authenticate") {
    redirectTo = "/";
  } else if (emailVerified === true && type === "emailVerify") {
    redirectTo = "/";
  } else if (type === "admin" && !User.loggingIn() && !admin) {
    redirectTo = "/";
  } else if (!cProps.userId && type === "user") {
    redirectTo = "/";
  } else if (cProps.userId && type === "guest") {
    redirectTo = "/";
  }

  if (redirectTo) {
    return <RedirectRoute {...rest} path={redirectTo} />;
  } else if (cProps.systemSettings && cProps.systemSettings.systemOnline !== true && !admin) {
    return <Route {...rest} render={props => <Offline {...cProps} {...props} />} />;
  } else {
    return <Route {...rest} render={props => <Component {...cProps} {...props} />} />;
  }
};

class Routes extends React.Component<IProps> {
  constructor(props) {
    super(props);
  }

  generatePages() {
    const { slugs } = this.props;
    let pages: any;
    let layout = "";

    if (slugs.length) {
      layout = slugs.map(slug => {
        return <AuthRoute key={slug} exact path={`/${slug}`} cProps={this.props} component={Page} type="any" />;
      });
    }

    return layout;
  }

  mainRouter = () => {
    const props = this.props;
    return (
      <Switch>
        {this.generatePages()}
        <AuthRoute exact path="/" cProps={props} component={Index} type="any" />
        <AuthRoute path="/admin" cProps={props} component={Admin} type="admin" />
        <AuthRoute path="/members/verify-email" cProps={props} component={VerifyEmail} type="emailVerify" />
        <AuthRoute path="/members/enroll" cProps={props} component={Enroll} type="enrollment" />
        <AuthRoute path="/members/forgot-password-reset" cProps={props} component={ForgotPassWordReset} type="guest" />
        <AuthRoute exact path="/members/forgot-password" cProps={props} component={ForgotPassWord} type="guest" />
        <AuthRoute exact path="/members/register" cProps={props} component={Register} type="guest" />
        <AuthRoute exact path="/members/signin" cProps={props} component={SignIn} type="guest" />
        <AuthRoute exact path="/members/authenticate" cProps={props} component={Authenticator} type="user" />
        <AuthRoute exact path="/members/profile" cProps={props} component={Profile} type="user" />
        <AuthRoute exact path="/locked" cProps={props} component={Locked} type="user" />
        <AuthRoute exact path="/members/change-password" cProps={props} component={ChangePassword} type="user" />
      </Switch>
    );
  };


  render() {
    return this.mainRouter();
  }
}

export default connect()(
  withTracker(props => {
    let pages: any;
    let slugs: any = [];
    const PagesDataReady = Meteor.subscribe("pages");
    if (PagesDataReady) {
      pages = Pages.find().fetch();
    }

    if (pages) {
      slugs = pages.map(page => {
        return page.slug;
      });
    }

    return {
      pages: pages,
      slugs: slugs
    };
  })(Routes)
);
