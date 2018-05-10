import * as React from "react";
import { Meteor } from "meteor/meteor";
import { Link } from "react-router-dom";
import styled from "styled-components";
import Loader from "react-loader-spinner";
import RefreshIndicator from "material-ui/RefreshIndicator";
import ActionVerifiedUser from "material-ui/svg-icons/action/verified-user";
import ActionHighlightOff from "material-ui/svg-icons/action/highlight-off";
import NotificationSyncProblem from "material-ui/svg-icons/notification/sync-problem";
import * as jquery from "jquery";
import "tooltipster";
import "tooltipster/dist/css/tooltipster.bundle.min.css";
import "tooltipster/dist/css/plugins/tooltipster/sideTip/themes/tooltipster-sideTip-light.min.css";
import "tooltipster/dist/css/plugins/tooltipster/sideTip/themes/tooltipster-sideTip-shadow.min.css";

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

import * as User from "../../modules/user";

interface IProps {
  sessionExpired: boolean;
  userData: any;
  userId: string;
  userSettings: any;
  userSession: any;
  loggingIn: boolean;
  loggingOut: boolean;
  enhancedAuth: boolean;
  status: any;
  sessionReady: boolean;
}

interface IState {
  verified: boolean;
}

const tip = {
  loggedOut: "You are signed out.",
  connecting: "Connecting...",
  loggingIn: "Signing in...",
  loggingOut: "Signing out...",
  verified: {
    simple: {
      verified: "Your email address was verified.",
      unverified: "Your email address was not verified."
    },
    enhanced: {
      verified: "Your session was verified with 2FA.",
      unverified: "Unverified session: ",
      email: "Your email address was not verified.",
      auth2FA: "Session does not have 2 factor authentication."
    }
  }
};

export default class DashDisplay extends React.Component<IProps, IState> {
  currentTip: string = "";

  emailVerifyPrompted: boolean;
  constructor(props) {
    super(props);
    this.state = {
      verified: false
    };
  }

  componentWillReceiveProps(nextProps) {}

  componentWillUpdate(nextProps) {
    this.set(nextProps);
  }

  componentDidUpdate() {}

  componentDidMount() {
    this.set(this.props);
  }

  dashBoardTip(props) {
    let verifiedFlag: boolean = false;
    let hasAuth = !(props.enhancedAuth === false || (props.userSettings && props.userSettings.authEnabled === 0));
    let message: any = "We're not quite sure what's going on...";
    if (props.status && props.status.connected === false) {
      message = tip.connecting;
    } else if (props.loggingIn) {
      message = tip.loggingIn;
    } else if (!props.userId) {
      message = tip.loggedOut;
    } else if (props.loggingOut) {
      message = tip.loggingOut;
    } else {
      verifiedFlag = this.resolveVerification(props);
      if (hasAuth) {
        message = verifiedFlag ? tip.verified.enhanced.verified : tip.verified.enhanced.auth2FA;
      } else {
        message = verifiedFlag ? tip.verified.simple.verified : tip.verified.simple.unverified;
      }
    }

    return { verified: verifiedFlag, tip: message };
  }

  resolveVerification(props) {
    if (!props.userData || !props.userSettings) {
      return false;
    }
    let verifiedFlag: boolean = false;
    let emailVerified = props.userData ? props.userData.emails[0].verified : false;
    if (props.enhancedAuth === false || props.userSettings.authEnabled === 0) {
      verifiedFlag = emailVerified;
    } else {
      verifiedFlag =
        ((props.userSession && props.userSession.verified) || !props.userSettings.authEnabled) && emailVerified;
    }

    return verifiedFlag;
  }

  set(props) {
    let initialised = jquery(`.verified`).hasClass("tooltipstered");
    let newTip = this.dashBoardTip(props).tip;

    if (newTip !== this.currentTip) {
      this.currentTip = newTip;
      if (initialised) {
        jquery(`.verified`).tooltipster("destroy");
      }

      jquery(`.verified`).tooltipster({
        trigger: "hover",
        animation: "slide",
        theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
        content: newTip
      });
    }
  }

  unset(type) {
    let initialised = jquery(`.${type}`).hasClass("tooltipstered");
    if (initialised) {
      jquery(`.${type}`).tooltipster("destroy");
    }
  }

  emailDashDisplay() {
    let display: string;
    if (this.props.loggingIn) {
      display = ` ${tip.loggingIn}`;
    } else if (this.props.loggingOut && this.props.userId) {
      display = ` ${tip.loggingOut}`;
    } else if (!this.props.sessionExpired && this.props.userId && this.props.userData) {
      display = ` ${this.props.userData.emails[0].address}`;
    } else if (!this.props.userId || !this.props.userData || !this.props.userSettings) {
      display = null;
    }

    return display;
  }

  spinner() {
    return (
      <RefreshIndicator
        loadingColor="orange"
        size={20}
        left={0}
        top={0}
        status="loading"
        className="dashboard-spinner"
      />
    );
  }

  getVerifiedIndicator() {
    let layout: any;
    let verified = this.resolveVerification(this.props);
    let tag: any;
    let style: any;
    if (!this.props.userId) {
      tag = null;
    } else if (this.props.status && !this.props.status.connected && this.props.status.retryCount > 1) {
      tag = this.spinner();
    } else if (this.props.status && !this.props.status.connected) {
      tag = <NotificationSyncProblem className="notification-sync-problem" />;
    } else if (!this.props.sessionReady) {
      tag = this.spinner();
    } else if (verified) {
      tag = <ActionVerifiedUser className="action-verified-user" />;
    } else {
      tag = <ActionHighlightOff className="action-highlight-off" />;
    }
    layout = (
      <div className="d-inline-block" id="VerifiedIndicator">
        {tag}
      </div>
    );

    return layout || "";
  }

  authVerifiedLayout() {
    let verifiedLayout: any;
    let emailDashDisplay = this.emailDashDisplay();
    verifiedLayout = (
      <div className="d-inline-block">
        {this.getVerifiedIndicator()} <div className="d-none d-sm-inline-block">{emailDashDisplay}</div>
      </div>
    );
    return verifiedLayout || "";
  }

  render() {
    return this.authVerifiedLayout();
  }
}
