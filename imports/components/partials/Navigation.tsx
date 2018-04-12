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
import { userSessions } from "../../api/sessions/publish";
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
  userData: any;
  sessionActive: boolean;
  sessionExpired: boolean;
  loggingIn: boolean;
  authData: {
    _id: string;
    verified: boolean;
    currentAttempts: number;
    private_key: string;
    owner: string;
    keyObj: any;
    QRCodeShown: boolean;
  };
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

declare var Bert: any;

class Navigation extends React.Component<IProps, IState> {
  tipInitialised: boolean = false;
  clearTip: boolean = false;
  loggingOut: boolean = false;

  emailVerifyPrompted: boolean;
  constructor(props) {
    super(props);
    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.closeNavbar = this.closeNavbar.bind(this);
    this.logOut = this.logOut.bind(this);
    this.state = {
      collapsed: true,
      verified: false,
      tip: ""
    };
    this.emailVerifyPrompted = false;
  }

  componentWillReceiveProps(nextProps) {}

  componentWillUpdate(nextProps) {}

  componentDidUpdate() {
    let notify = this.verifyEmailNotificationRequired();
    if (notify) {
      this.emailVerifyPrompted = Library.userModelessAlert("verifyEmail", this.props);
    }

    //Tooltips.set("verified", this.props);
  }

  componentDidMount() {}

  verifyEmailNotificationRequired() {
    return (
      this.props.location.pathname === "/" &&
      !this.emailVerifyPrompted &&
      this.props.userData &&
      this.props.profile &&
      (!this.props.enhancedAuth || this.props.authData)
    );
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

  /*
  static propTypes = {
    authVerified: PropTypes.bool,
    enhancedAuth: PropTypes.bool,
    userSession: PropTypes.any,
    sessionExpired: PropTypes.bool,
    sessionActive: PropTypes.bool,
    loggingIn: PropTypes.bool,
    ShortTitle: PropTypes.string,
    history: ReactRouterPropTypes.history,
    profile: PropTypes.any,
    authData: PropTypes.shape({
      _id: PropTypes.string,
      verified: PropTypes.bool,
      currentAttempts: PropTypes.number,
      private_key: PropTypes.string,
      owner: PropTypes.string,
      keyObj: PropTypes.any,
      QRCodeShown: PropTypes.bool
    })
  };
  */

  getAuthLink() {
    if (this.props.enhancedAuth) {
      if (this.props.authData && !this.props.authData.verified) {
        return (
          <DropdownItem onClick={this.closeNavbar} className="nav-link" tag={Link} to="/authenticate">
            Authenticator
          </DropdownItem>
        );
      }
    }
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

        {this.getAuthLink()}
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
    if (User.id()) {
      this.closeNavbar();
      this.emailVerifyPrompted = false;
      this.loggingOut = true;

      console.log(`Navigation logOut`, User.id());
      SessionMethods.deActivateSession.call({}, (err, res) => {
        if (err) {
          console.log(`deActivateSession error`, err.reason);
        }
        Meteor.logout(() => {
          //Meteor["connection"].setUserId(null);
          console.log(`Navigation logOut DONE`);
          this.loggingOut = false;
        });
      });
    }
  }

  conditionalLogout() {
    if (User.id()) {
      let logout = false;
      if (this.props.sessionActive && this.props.sessionExpired && !this.loggingOut) {
        console.log(
          `Navigation: conditionalLogout DONE! active=[${this.props.sessionActive}] expired=[${
            this.props.sessionExpired
          }]`,
          User.id()
        );
        logout = true;
      }

      if (logout) {
        this.logOut();
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
              enhancedAuth={this.props.enhancedAuth}
              loggingOut={this.loggingOut}
              authData={this.props.authData}
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
    this.conditionalLogout();
    return this.navBar();
  }
}

export default withRouter(
  withTracker(({ enhancedAuth }) => {
    let authDataReady: any;
    if (enhancedAuth) {
      authDataReady = Meteor.subscribe("enhancedAuth");
    }
    let sessionDataReady = Meteor.subscribe("userSessions");
    let authData: any;
    let userSession: any;
    let userData: any;
    let sessionActive: boolean = false;
    let sessionExpired: boolean = false;

    let loggingIn: boolean;
    loggingIn = User.loggingIn();
    userData = User.data();

    if (userData) {
      if (sessionDataReady) {
        userSession = userSessions.findOne({ owner: User.id() });
        if (userSession) {
          sessionActive = userSession.active;
          sessionExpired = userSession.expired;
        }
      }
      if (authDataReady) {
        authData = Auth.findOne({ owner: User.id() });
      }
    }

    return {
      authData: authData,
      userSession: userSession,
      userData: userData,
      loggingIn: loggingIn,
      sessionActive: sessionActive,
      sessionExpired: sessionExpired
    };
  })(Navigation)
);
