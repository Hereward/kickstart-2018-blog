import * as React from "react";
import { Accounts } from "meteor/accounts-base";
import { Meteor } from "meteor/meteor";
import { withStyles } from "@material-ui/core/styles";
import * as PropTypes from "prop-types";
import PowerOffIcon from "@material-ui/icons/PowerSettingsNew";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import ReactRouterPropTypes from "react-router-prop-types";
import { Link, NavLink } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Session } from "meteor/session";
import { connect } from "react-redux";

import { Collapse, Navbar, NavbarToggler, Nav, NavItem, DropdownToggle, DropdownMenu, Dropdown } from "reactstrap";

import * as SessionMethods from "../../api/sessions/methods";
import * as Library from "../../modules/library";
import * as User from "../../modules/user";
import DashDisplay from "./DashDisplay";
import MainDrawer from "./MainDrawer";
//import Avatar from "../pages/Profile/Avatar";

let styles: any;
styles = theme => ({
  typographyRoot: {
    fontSize: "0.9rem",
    letterSpacing: "0.02rem",
    textTransform: "uppercase",
    fontWeight: "200"
  }
});

interface IProps {
  history: any;
  classes: PropTypes.object.isRequired;
  ShortTitle: any;
  enhancedAuth: boolean;
  profilePublic: PropTypes.object.isRequired;
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
  constructor(props) {
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

    //const { store } = context;
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
          this.timerID = Meteor.setTimeout(() => this.verifyEmailReminder(), 500);
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
    log.info(`verifyEmailNotificationRequired`, this.props);
    let notify = false;
    if (
      this.props.sessionReady &&
      this.props.location.pathname === "/" &&
      this.props.userSettings.verificationEmailSent &&
      !this.emailVerifyPrompted &&
      !this.props.loggingOut &&
      !this.props.userData.emails[0].verified &&
      this.props.userSettings.authEnabled < 2
    ) {
      notify = true;
    }

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

  drawer() {
    const { classes, history, userId, loggingIn, loggingOut, sessionReady } = this.props;
    const path = this.props.history.location.pathname;
    const adminPage = path.match(/admin/);
    let layout: any = "";
    if (adminPage) {
      layout = (
        <IconButton color="inherit" aria-label="Exit Admin" onClick={() => history.push("/")}>
          <PowerOffIcon />
        </IconButton>
      );
      //layout = <PowerOffIcon onClick={() => history.push("/")} className={classes.powerOff} />;
    } else {
      layout = (
        <MainDrawer
          sessionReady={sessionReady}
          logOut={this.logOut}
          loggingIn={loggingIn}
          loggingOut={loggingOut}
          userId={userId}
          history={history}
        />
      );
    }
    return layout;
  }

  /*
  getAuthLayout() {
    const { userId } = this.props;
    let SignedInLayout = (
      <DropdownMenu>
        <NavLink exact className="dropdown-item nav-link" onClick={this.logOut} to="#">
          Sign Out
        </NavLink>

        <NavLink exact onClick={this.closeNavbar} className="dropdown-item nav-link" to={`/members/profile/${userId}`}>
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
  */

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
    return (
      <div className="navbar-brand d-flex">
        {this.drawer()}
        <DashDisplay
          history={this.props.history}
          profilePublic={this.props.profilePublic}
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
      </div>
    );
  };

  renderNavItem(label, link) {
    const { classes } = this.props;
    return (
      <NavItem>
        <Typography className={classes.typographyRoot} variant="body2">
          <NavLink exact className="nav-link" to={link}>
            {label}
          </NavLink>
        </Typography>
      </NavItem>
    );
  }

  navBar() {
    const { classes, systemSettings, profilePublic, userSession } = this.props;
    const cPath = this.props.history.location.pathname;
    let admin = User.can({ threshold: "super-admin" });
    const adminPage = cPath.match(/admin/);
    let dashDisplay: any = "";
    if (systemSettings) {
      if (systemSettings.systemOnline || admin) {
        dashDisplay = this.renderDashDisplay();
      }
    }
    return (
      <Navbar color="dark" expand="lg" className="main-nav fixed-top " dark>
        {dashDisplay}

        {!adminPage &&
          ((this.props.systemSettings && this.props.systemSettings.systemOnline) || admin) && (
            <Nav className="ml-auto mr-2 d-none d-lg-flex" navbar>
              {this.renderNavItem("Home", "/")}
              {this.renderNavItem("About", "/about")}
              {this.renderNavItem("Terms of Service", "/terms-of-service")}
              {this.renderNavItem("Blog", "/blog")}
            </Nav>
          )}
      </Navbar>
    );
  }

  render() {
    const { classes } = this.props;
    return this.navBar();
  }
}

export default withStyles(styles, { withTheme: true })(Navigation);
//export default Navigation;
