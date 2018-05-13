import * as React from "react";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import * as PropTypes from "prop-types";
import ReactRouterPropTypes from "react-router-prop-types";
import { Link, withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";

import { Session } from "meteor/session";

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
import * as SessionMethods from "../../api/sessions/methods";
import * as Library from "../../modules/library";
import * as User from "../../modules/user";
import DashDisplay from "./DashDisplay";

interface IProps {
  history: any;
  ShortTitle: any;
  enhancedAuth: boolean;
  profile: any;
  location: any;
  userSession: any;
  userSettings: any;
  userData: any;
  userId: string;
  sessionActive: boolean;
  sessionExpired: boolean;
  loggingIn: boolean;
  sessionToken: string;
  sessionReady: boolean;
  status: any;
  connected: boolean;
  connectionRetryCount: number;
}

interface IState {
  collapsed: boolean;
  tip: string;
  verified: boolean;
}

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

  componentWillMount() {
    this.conditionalReroute(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.conditionalReroute(nextProps);
  }

  componentWillUpdate(nextProps) {}

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!this.loggingOut) {
      User.checkSessionStatus(prevProps, this.props);
      if (
        this.props.sessionReady &&
        !this.timerID &&
        this.props.location.pathname === "/" &&
        !this.props.userData.emails[0].verified
      ) {
        this.timerID = Meteor.setTimeout(() => this.verifyEmailReminder(), 2000);
      }
    }
  }

  verifyEmailReminder() {
    let notify = this.verifyEmailNotificationRequired();
    if (notify) {
      Library.userModelessAlert("verifyEmail", this.props);
      this.emailVerifyPrompted = true;
    } else {
      this.timerID = 0;
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

    return this.props.sessionReady ? SignedInLayout : SignedOutLayout;
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
      this.props.history.push("/");
      console.log(`Navigation logOut`, User.id());
      SessionMethods.deActivateSession.call({ sessionToken: User.sessionToken("get") }, (err, res) => {
        if (err) {
          console.log(`deActivateSession error`, err.reason);
        }
        Meteor.logout(() => {
          //Meteor["connection"].setUserId(null);
          log.info(`Navigation logOut DONE`);
          this.loggingOut = false;
        });
      });
    }
  }

  conditionalReroute(props) {
    if (Meteor.userId() && props.userSession && props.sessionReady && !this.loggingOut) {
      let path = props.location.pathname;
      let reRoute = null;
      let logout = false;
      let emailVerified = Library.nested(["userData", "emails", 0, "verified"], props);
      //props.userData.emails[0].verified
      let verified = Library.nested(["userSession", "verified"], props);
      let locked = Library.nested(["userSettings", "locked"], props);
      let authEnabled = Library.nested(["userSettings", "authEnabled"], props);
      //let authNotRequired = ((authEnabled === 0) || (verified && (authEnabled === 1)));
      let authRequired = ((authEnabled > 1) || (authEnabled === 1 && !verified));

      if (locked === true) {
        if (path !== "/locked") {
          reRoute = "locked";
        }
      } else if (props.sessionActive && props.sessionExpired) {
        logout = true;
      } else if (path.match(/verify-email/) && emailVerified === true && !authRequired) {
        reRoute = "/";
      } else if (path.match(/signin/) && !authRequired) {
        reRoute = "/";
      } else if (path.match(/forgot-password-reset/) && !authRequired) {
        reRoute = "/";
      } else if (path === "/authenticate") {
        if (authEnabled === 0) {
          reRoute = "/";
        } else if (authEnabled === 1 && verified) {
          reRoute = "/";
        }
      } else if (props.location.pathname !== "/authenticate" && authRequired) {
        reRoute = "/authenticate";
      }

      if (logout) {
        this.logOut();
      } else if (reRoute) {
        props.history.push(reRoute);
      }

      if (reRoute) {
        log.info(
          `conditionalReroute authEnabled = [${authEnabled}] NEW ROUTE = [${reRoute}]`,
          props.location.pathname,
          props
        );
      }
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
              userId={this.props.userId}
              sessionExpired={this.props.sessionExpired}
              status={this.props.status}
              sessionReady={this.props.sessionReady}
              connected={this.props.connected}
              connectionRetryCount={this.props.connectionRetryCount}
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
    return this.navBar();
  }
}

export default withRouter(
  withTracker(() => {
    return {};
  })(Navigation)
);
