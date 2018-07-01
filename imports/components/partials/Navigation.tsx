import * as React from "react";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import * as PropTypes from "prop-types";
import ReactRouterPropTypes from "react-router-prop-types";
import { Link, NavLink } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Session } from "meteor/session";
import { connect } from "react-redux";

import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Dropdown,
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
  connected: boolean;
  connectionRetryCount: number;
  dispatch: any;
  loggingOut: boolean;
  systemSettings: any;
  reduxState: any;
  isClient: boolean;
}

interface IState {
  collapsed: boolean;
  dropdownOpen: boolean;
}

class Navigation extends React.Component<IProps, IState> {
  tipInitialised: boolean = false;
  clearTip: boolean = false;
  timerID: any;
  reduxStore: any;

  emailVerifyPrompted: boolean;
  constructor(props, context) {
    super(props);
    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.closeNavbar = this.closeNavbar.bind(this);
    this.toggleDropDown = this.toggleDropDown.bind(this);
    this.logOut = this.logOut.bind(this);
    this.timerID = 0;
    this.state = {
      collapsed: true,
      dropdownOpen: false
    };
    this.emailVerifyPrompted = false;

    const { store } = context;
    //log.info(`NAVIGATION PROPS`, this.props);
  }

  componentDidMount() {
    this.conditionalLogout(this.props);
  }

  componentWillUpdate(nextProps) {}

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.props !== prevProps) {
      this.conditionalLogout(this.props);

      if (!this.props.loggingOut) {
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

  verifyEmailNotificationRequired() {
    //log.info(`verifyEmailNotificationRequired`, this.emailVerifyPrompted, this.props);
    let notify = false;
    if (
      this.props.sessionReady &&
      this.props.location.pathname === "/" &&
      this.props.profile.verificationEmailSent &&
      !this.emailVerifyPrompted &&
      !this.props.loggingOut &&
      !this.props.userData.emails[0].verified &&
      this.props.userSettings.authEnabled < 2
    ) {
      notify = true;
    }
    /*
    log.info(
      `verifyEmailNotificationRequired | notify=[${notify}]`,
      this.props.location.pathname,
      this.props.userSettings.authEnabled
    );
    */
    return notify;
  }

  toggleDropDown() {
    this.setState({ dropdownOpen: !this.state.dropdownOpen });
  }

  closeNavbar() {
    this.setState({ collapsed: true, dropdownOpen: false });
  }

  toggleNavbar() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  getAuthLayout() {
    let SignedInLayout = (
      <DropdownMenu>
        <NavLink exact className="dropdown-item nav-link" onClick={this.logOut} to="#">
          Sign Out
        </NavLink>

        <NavLink exact onClick={this.closeNavbar} className="dropdown-item nav-link" to="/members/profile">
          Profile
        </NavLink>

        <NavLink exact onClick={this.closeNavbar} className="dropdown-item nav-link" to="/members/change-password">
          Change Password
        </NavLink>
      </DropdownMenu>
    );

    let SignedOutLayout = (
      <DropdownMenu>
        <NavLink exact onClick={this.closeNavbar} className="dropdown-item nav-link" to="/members/register">
          Register
        </NavLink>

        <NavLink exact onClick={this.closeNavbar} className="dropdown-item nav-link" to="/members/signin">
          Sign In
        </NavLink>

        <NavLink exact onClick={this.closeNavbar} className="dropdown-item nav-link" to="/members/forgot-password">
          Forgot Password
        </NavLink>
      </DropdownMenu>
    );

    return this.props.sessionReady ? SignedInLayout : SignedOutLayout;
  }

  logOut() {
    if (this.props.sessionReady) {
      this.props.dispatch({ type: "NAV_LOGOUT" });
      this.closeNavbar();
      this.emailVerifyPrompted = false;
      if (this.timerID) {
        clearTimeout(this.timerID);
      }
      this.timerID = 0;
      this.props.history.push("/");
      log.info(`Navigation logOut`, User.id());
      SessionMethods.deActivateSession.call({ sessionToken: User.sessionToken("get") }, (err, res) => {
        if (err) {
          console.log(`deActivateSession error`, err.reason);
        }
        Meteor.logout(() => {
          //Meteor["connection"].setUserId(null);
          this.props.dispatch({ type: "LOGOUT_DONE" });
          log.info(`Navigation logOut DONE`);
        });
      });
    }
  }

  conditionalLogout(props) {
    if (props.userId && !this.props.loggingOut && props.sessionActive && props.sessionExpired) {
      this.logOut();
    }
  }

  renderDashDisplay = () => {
    log.info(`renderDashDisplay`, this.props.isClient);

    return this.props.isClient ? (
      <DashDisplay
        userSession={this.props.userSession}
        userSettings={this.props.userSettings}
        enhancedAuth={this.props.enhancedAuth}
        loggingOut={this.props.loggingOut}
        loggingIn={this.props.loggingIn}
        userData={this.props.userData}
        userId={this.props.userId}
        sessionExpired={this.props.sessionExpired}
        sessionReady={this.props.sessionReady}
        connected={this.props.connected}
        connectionRetryCount={this.props.connectionRetryCount}
      />
    ) : (
      ""
    );
  };

  navBar() {
    const cPath = this.props.history.location.pathname;
    let admin = User.can({ threshold: "super-admin" });
    return (
      <div>
        <Navbar color="dark" expand="md" className="main-nav fixed-top" dark>
          <div className="navbar-brand verified">
            {this.props.systemSettings ? this.props.systemSettings.shortTitle : ""}{" "}
            {(this.props.systemSettings && this.props.systemSettings.systemOnline) || admin
              ? this.renderDashDisplay()
              : ""}
          </div>

          <NavbarToggler onClick={this.toggleNavbar} />
          {(this.props.systemSettings && this.props.systemSettings.systemOnline) || admin ? (
            <Collapse isOpen={!this.state.collapsed} navbar>
              <Nav className="ml-auto" navbar>
                <NavItem>
                  <NavLink exact className="nav-link" onClick={this.closeNavbar} to="/">
                    Home
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink exact className="nav-link" onClick={this.closeNavbar} to="/about">
                    About
                  </NavLink>
                </NavItem>
                {User.can({ threshold: "admin" }) ? (
                  <NavItem className={cPath.match(/admin/) ? "active" : ""}>
                    <NavLink exact className="nav-link" onClick={this.closeNavbar} to="/admin">
                      Admin
                    </NavLink>
                  </NavItem>
                ) : null}

                <Dropdown nav inNavbar isOpen={this.state.dropdownOpen} toggle={this.toggleDropDown}>
                  <DropdownToggle className={cPath.match(/members/) ? "active" : ""} nav caret>
                    Members
                  </DropdownToggle>
                  {this.getAuthLayout()}
                </Dropdown>
              </Nav>
            </Collapse>
          ) : (
            ""
          )}
        </Navbar>
      </div>
    );
  }

  // nav inNavbar

  // <UncontrolledDropdown nav inNavbar>

  render() {
    //log.info(`NAVIGATION STATE`, this.state);

    return this.navBar();
  }
}

export default Navigation;

// state => state
