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

//  loggingOut: false;

interface IProps {
  sessionExpired: boolean;
  userData: any;
  loggingIn: boolean;
  loggingOut: boolean;
  enhancedAuth: boolean;
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
  verified: boolean;
}

const tip = {
  loggedOut: "You are signed out.",
  loggingIn: "Signing in...",
  loggingOut: "Signing out...",
  verified: {
    simple: {
      verified: "Your account is verified.",
      unverified: "Your email address is not verified."
    },
    enhanced: {
      verified: "Your session was verified.",
      unverified: "Unverified session: ",
      email: "Email address not verified.",
      auth2FA: "Session does not have 2 factor authentication."
    }
  }
};

export default class DashDisplay extends React.Component<IProps, IState> {
  tipInitialised: boolean = false;
  clearTip: boolean = false;

  emailVerifyPrompted: boolean;
  constructor(props) {
    super(props);
    this.state = {
      verified: false
    };
    console.log(`DashDisplay`, this.props);
  }

  componentWillReceiveProps(nextProps) {}

  componentWillUpdate(nextProps) {}

  componentDidUpdate() {
    this.set("verified");
  }

  componentDidMount() {
    this.set("verified");
  }

  /*
  verifiedIndicator(verified) {
    //this.props.loggingIn, this.props.loggingOut, this.props.userData
  
    let tag: any;
    let style: any;
  
    if (!this.props.userData) {
      tag = <NotificationSyncProblem className="notification-sync-problem" />;
    } else if (verified) {
      tag = <ActionVerifiedUser className="action-verified-user" />;
    } else {
      tag = <ActionHighlightOff className="action-highlight-off" />;
    }
    return <div id="VerifiedIndicator">{tag}</div>;
  };
  */

  dashBoardTip() {
    let emailVerified = User.data() ? User.data().emails[0].verified : false;
    let verifiedFlag: boolean = false;
    let message: any;
    if (!User.id()) {
      message = tip.loggedOut;
    } else if (this.props.enhancedAuth === false) {
      verifiedFlag = emailVerified;
      message = emailVerified ? tip.verified.simple.verified : tip.verified.simple.unverified;
    } else if (!this.props.authData) {
      message = tip.loggedOut;
    } else {
      verifiedFlag = this.props.authData.verified && emailVerified;
      message = verifiedFlag ? tip.verified.enhanced.verified : tip.verified.enhanced.unverified;

      if (!emailVerified) {
        message += tip.verified.enhanced.email;
      }

      if (!this.props.authData.verified) {
        message += emailVerified ? "" : " ";
        message += tip.verified.enhanced.auth2FA;
      }
    }

    console.log(`dashBoardTip`, message);

    return { verified: verifiedFlag, tip: message };
  }

  set(type) {
    console.log(`DashDsiplay set`);
    let tipObj = this.dashBoardTip();
    if (tipObj.tip) {
      let initialised = jquery(`.${type}`).hasClass("tooltipstered");
      if (initialised) {
        jquery(`.${type}`).tooltipster("destroy");
      }

      jquery(`.${type}`).tooltipster({
        trigger: "hover",
        animation: "slide",
        theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
        content: tipObj.tip
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
    /*
    if (this.props.userSession) {
      console.log(`emailDashDisplay: this.props.userSession`, this.props.userSession);
    }
    */

    if (!this.props.sessionExpired && this.props.userData) {
      display = ` ${this.props.userData.emails[0].address}`;
    } else if (!this.props.userData) {
      //display = ` ${tip.loggedOut}`;
    } else if (this.props.loggingIn) {
      display = ` ${tip.loggingIn}`;
    }

    return display;
  }

  getVerifiedIndicator() {
    let layout: any;
    let obj = this.dashBoardTip();

    let tag: any;
    let style: any;

    console.log(`getVerifiedIndicator`, this.props.userData);
    if (this.props.loggingIn || this.props.loggingOut) {
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
    } else if (!this.props.userData) {
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

    //if (!this.props.loggingIn && this.props.userData) {
    //layout = <div className="d-inline-block">{this.verifiedIndicator(obj.verified)}</div>;
    //}

    return layout || "";
  }

  authVerifiedLayout() {
    //let obj = this.dashBoardTip(this.props);
    let verifiedLayout: any;
    let emailDashDisplay = this.emailDashDisplay();
    //if (emailDashDisplay) {
    verifiedLayout = (
      <div className="d-inline-block">
        {this.getVerifiedIndicator()} <div className="d-none d-sm-inline-block">{emailDashDisplay}</div>
      </div>
    );
    //}

    return verifiedLayout || "";
  }

  render() {
    return this.authVerifiedLayout();
  }
}
