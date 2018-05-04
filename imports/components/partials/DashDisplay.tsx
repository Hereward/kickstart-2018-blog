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
}

interface IState {
  verified: boolean;
}

const tip = {
  loggedOut: "You are signed out.",
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
    let emailVerified = props.userData ? props.userData.emails[0].verified : false;
    let verifiedFlag: boolean = false;
    let message: any = "We're not quite sure what's going on...";
    if (props.loggingIn) {
      message = tip.loggingIn;
    } else if (!props.userId || !props.userData || !props.userSettings) {
      message = tip.loggedOut;
    } else if (props.loggingOut) {
      message = tip.loggingOut;
    } else if (props.enhancedAuth === false || props.userSettings.authEnabled === 0) {
      verifiedFlag = emailVerified;
      message = emailVerified ? tip.verified.simple.verified : tip.verified.simple.unverified;
    } else {
      verifiedFlag =
        ((props.userSession && props.userSession.verified) ||
          !props.userSettings.authEnabled) &&
        emailVerified;
      message = verifiedFlag ? tip.verified.enhanced.verified : tip.verified.enhanced.unverified;

      if (!emailVerified) {
        message += tip.verified.enhanced.email;
      }

      if (
        props.userSession && !props.userSession.verified
      ) {
        message += emailVerified ? "" : " ";
        message += tip.verified.enhanced.auth2FA;
      }
    }

    return { verified: verifiedFlag, tip: message };
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

  getVerifiedIndicator() {
    let layout: any;
    let obj = this.dashBoardTip(this.props);

    let tag: any;
    let style: any;
    if (this.props.loggingIn || (this.props.loggingOut && this.props.userId)) {
      tag = (
        <RefreshIndicator
          loadingColor="orange"
          size={20}
          left={0}
          top={0}
          status="loading"
          className="dashboard-spinner"
        />
      );
    } else if (!this.props.userId || !this.props.userData || !this.props.userSettings) {
      tag = <NotificationSyncProblem className="notification-sync-problem" />;
    } else if (obj.verified) {
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
