import * as React from "react";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import * as PropTypes from "prop-types";
import ReactRouterPropTypes from "react-router-prop-types";
import { Link, withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
//import styled from "styled-components";
import { Session } from "meteor/session";
//import ActionVerifiedUser from "material-ui/svg-icons/action/verified-user";
//import ActionHighlightOff from "material-ui/svg-icons/action/highlight-off";

import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Tooltip,
  UncontrolledTooltip
} from "reactstrap";

import * as ContentManagement from "../../modules/contentManagement";
import * as AuthMethods from "../../api/auth/methods";
import { Auth } from "../../api/auth/publish";
import { userSettings } from "../../api/settings/publish";
//import { userSessions } from "../../api/sessions/publish";
import * as SessionMethods from "../../api/sessions/methods";
import * as Library from "../../modules/library";
//import * as Tooltips from "../../modules/tooltips";
import * as User from "../../modules/user";
import DashDisplay from "./DashDisplay";

interface IProps {
  history: any;
  ShortTitle: any;
  authVerified: boolean;
  enhancedAuth: boolean;
  profile: any;
  location: any;
  userSession: any;
  userSettings: any;
  userData: any;
  sessionActive: boolean;
  sessionExpired: boolean;
  loggingIn: boolean;
  sessionToken: string;
  sessionReady: boolean;
}

interface IState {
  collapsed: boolean;
  tip: string;
  verified: boolean;
}

/*
const VerifiedIndicator = function vfi(verified) {
  let tag: any;
  let style: any;

  if (verified) {
    tag = <ActionVerifiedUser className="action-verified-user" />;
  } else {
    tag = <ActionHighlightOff className="action-highlight-off" />;
  }
  return <div id="VerifiedIndicator">{tag}</div>;
};
*/

//declare var Bert: any;

class Navigation extends React.Component<IProps, IState> {
  tipInitialised: boolean = false;
  clearTip: boolean = false;
  loggingOut: boolean = false;
  timerID: any;

  emailVerifyPrompted: boolean;
  constructor(props) {
    super(props);
    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.closeNavbar = this.closeNavbar.bind(this);
    this.logOut = this.logOut.bind(this);
    this.timerID = 0;
    this.state = {
      collapsed: true,
      verified: false,
      tip: ""
    };
    this.emailVerifyPrompted = false;
  }

  componentWillReceiveProps(nextProps) {
    //log.info(`Nav - componentDidUpdate - sessionReady`, this.props.sessionReady, nextProps.sessionReady, this.props, nextProps);
  }

  componentWillUpdate(nextProps) {}

  componentDidUpdate(prevProps, prevState, snapshot) {
    
    if (!this.loggingOut) {
      
      User.checkSessionToken(prevProps, this.props);

      if (
        this.props.sessionReady &&
        !this.timerID &&
        this.props.location.pathname === "/" &&
        !this.props.userData.emails[0].verified
      ) {
        //log.info(`Nav componentDidUpdate BEGIN`, this.timerID);
        this.timerID = Meteor.setTimeout(() => this.verifyEmailReminder(), 2000);
        //log.info(`Nav componentDidUpdate I AM SETTING the FUCKING VARIABLE TO TRUE`, this.props.userSettings);
      }
    }
  }

  verifyEmailReminder() {
    let notify = this.verifyEmailNotificationRequired();
    if (notify) {
      //console.log(`Nav componentDidUpdate NOTIFY REQUIRED!!!`);
      Library.userModelessAlert("verifyEmail", this.props);
      this.emailVerifyPrompted = true;
    } else {
      this.timerID = 0;
      //log.info(`Nav componentDidUpdate I AM SETTING the FUCKING VARIABLE TO FALSE`, this.props.location.pathname);
      //console.log(`Nav componentDidUpdate NOTIFY NOT REQUIRED!!! [loggingOut = ${this.loggingOut}] [prompted = ${this.emailVerifyPrompted}]`, this.props);
    }
  }

  componentDidMount() {}

  verifyEmailNotificationRequired() {
    let notify = false;
    if (
      this.props.sessionReady &&
      this.props.location.pathname === "/" &&
      this.props.profile.verificationEmailSent &&
      !this.emailVerifyPrompted &&
      !this.loggingOut &&
      !this.props.userData.emails[0].verified &&
      this.props.userSettings.authEnabled < 2
    ) {
      notify = true;
    }
    //console.log(`verifyEmailNotificationRequired?`, notify);
    log.info(
      `verifyEmailNotificationRequired | notify=[${notify}]`,
      this.props.location.pathname,
      this.props.userSettings.authEnabled
    );
    return notify;
  }

  closeNavbar() {
    if (!this.state.collapsed) {
      this.setState({ collapsed: true });
    }
  }

  toggleNavbar() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  getAuthLayout() {
    let SignedInLayout = (
      <DropdownMenu>
        <DropdownItem onClick={this.logOut} tag={Link} to="#" className="nav-link">
          Sign Out
        </DropdownItem>

        <DropdownItem onClick={this.closeNavbar} className="nav-link" tag={Link} to="/profile">
          Profile
        </DropdownItem>

        <DropdownItem onClick={this.closeNavbar} className="nav-link" tag={Link} to="/change-password">
          Change Password
        </DropdownItem>
      </DropdownMenu>
    );

    let SignedOutLayout = (
      <DropdownMenu>
        <DropdownItem onClick={this.closeNavbar} className="nav-link" tag={Link} to="/register">
          Register
        </DropdownItem>

        <DropdownItem onClick={this.closeNavbar} className="nav-link" tag={Link} to="/signin">
          Sign In
        </DropdownItem>
        <DropdownItem onClick={this.closeNavbar} className="nav-link" tag={Link} to="/forgot-password">
          Forgot Password
        </DropdownItem>
      </DropdownMenu>
    );

    return this.props.userData ? SignedInLayout : SignedOutLayout;
  }

  logOut() {
    if (this.props.sessionReady) {
      this.closeNavbar();
      this.emailVerifyPrompted = false;
      if (this.timerID) {
        clearTimeout(this.timerID);
      }

      this.timerID = 0;
      this.loggingOut = true;
      //if (this.props.location.pathname === "/authenticate") {
      this.props.history.push("/");
      //}

      console.log(`Navigation logOut`, User.id());
      SessionMethods.deActivateSession.call({ sessionToken: User.sessionToken("get") }, (err, res) => {
        if (err) {
          console.log(`deActivateSession error`, err.reason);
        }
        Meteor.logout(() => {
          //Meteor["connection"].setUserId(null);
          console.log(`Navigation logOut DONE`);
          this.loggingOut = false;
          //this.props.history.push("/");
        });
      });
    }
  }

  conditionalReroute() {
    if (this.props.sessionReady && !this.loggingOut) {
      let path = this.props.location.pathname;
      let reRoute = "";
      let logout = false;
      let verified = Library.nested(["userSession", "auth", "verified"], this.props);
      let authEnabled = this.props.userSettings.authEnabled;
      //Library.nested(["userSettings", "authEnabled"], this.props);

      if (this.props.sessionActive && this.props.sessionExpired) {
        /*
        log.info(
          `Navigation: conditionalReroute DONE (sessionExpired)! active=[${this.props.sessionActive}] expired=[${
            this.props.sessionExpired
          }]`,
          User.id()
        );
        */
        logout = true;
      } else if (path === "/authenticate") {
        if (verified || authEnabled === 0) {
          reRoute = "/";
        }
      } else if (path.match(/verify-email/)) {
        //let emailVerified = (this.props.userData.emails[0].verified);
        let emailVerified = Library.nested(["userData", "emails", 0, "verified"], this.props);
        //log.info(`conditionalReroute`, emailVerified);
        if (emailVerified === true) {
          reRoute = "/";
        }
        //} else if (path === "/signin" && authEnabled === 0) {
        //   reRoute = "/";
      } else if (
        !verified &&
        !this.loggingOut &&
        this.props.location.pathname !== "/authenticate" &&
        authEnabled &&
        authEnabled > 0
      ) {
        reRoute = "/authenticate";
      }

      if (logout) {
        this.logOut();
      } else if (reRoute) {
        this.props.history.push(reRoute);
      }

      //log.info(`conditionalReroute NEW ROUTE = [${reRoute}]`, this.props.location.pathname, this.props);
    }
  }

  navBar() {
    return (
      <div>
        <Navbar color="dark" expand="md" className="main-nav fixed-top" dark>
          <div className="navbar-brand verified">
            {this.props.ShortTitle}{" "}
            <DashDisplay
              userSession={this.props.userSession}
              userSettings={this.props.userSettings}
              enhancedAuth={this.props.enhancedAuth}
              loggingOut={this.loggingOut}
              loggingIn={this.props.loggingIn}
              userData={this.props.userData}
              sessionExpired={this.props.sessionExpired}
            />
          </div>
          <NavbarToggler onClick={this.toggleNavbar} />
          <Collapse isOpen={!this.state.collapsed} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink onClick={this.closeNavbar} tag={Link} to="/">
                  Home
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink onClick={this.closeNavbar} tag={Link} to="About">
                  About
                </NavLink>
              </NavItem>
              <UncontrolledDropdown nav inNavbar>
                <DropdownToggle nav caret>
                  Members
                </DropdownToggle>
                {this.getAuthLayout()}
              </UncontrolledDropdown>
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
  }

  render() {
    this.conditionalReroute();
    return this.navBar();
  }
}

export default withRouter(
  withTracker(() => {
    return {};
  })(Navigation)
);
