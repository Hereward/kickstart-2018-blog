import * as React from "react";
import { Meteor } from "meteor/meteor";
import * as PropTypes from "prop-types";
import * as classNames from "classnames";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { withStyles } from "@material-ui/core/styles";
import Loader from "react-loader-spinner";
import SvgIcon from "@material-ui/core/SvgIcon";
import CircularProgress from "@material-ui/core/CircularProgress";
import VerifiedUser from "@material-ui/icons/VerifiedUser";
import ErrorIcon from "@material-ui/icons/HighlightOff";
import SyncProblem from "@material-ui/icons/SyncProblem";
import * as jquery from "jquery";
import "tooltipster";
import "tooltipster/dist/css/tooltipster.bundle.min.css";
import "tooltipster/dist/css/plugins/tooltipster/sideTip/themes/tooltipster-sideTip-light.min.css";
import "tooltipster/dist/css/plugins/tooltipster/sideTip/themes/tooltipster-sideTip-shadow.min.css";
import Avatar from "../pages/Profile/Avatar";

import * as User from "../../modules/user";

let styles: any;
styles = theme => ({
  root: {
    maxWidth: "14rem",
    overflow: "hidden",
    [theme.breakpoints.up("sm")]: {
      maxWidth: "20rem"
    }
  },
  baseIcon: {
    fontSize: 22
  },
  verifiedIndicator: {
    marginRight: "0.5rem"
  },
  avatar: {
    marginRight: "0.5rem"
  },
  link: {
    color: "white",
    "&:hover": {
      color: "rgba(255, 255, 255, 0.75)"
      //color: 'blue'
    }
  },
  errorIcon: {
    color: "red"
  },
  verifiedUserIcon: {
    color: "lime"
  },
  syncProblemIcon: {
    color: "orange"
  },
  spinner: {
    strokeWidth: 5
  }
});

interface IProps {
  sessionExpired: boolean;
  classes: PropTypes.object.isRequired;
  profilePublic: PropTypes.object.isRequired;
  userData: any;
  userId: string;
  userSettings: any;
  userSession: any;
  loggingIn: boolean;
  loggingOut: boolean;
  enhancedAuth: boolean;
  sessionReady: boolean;
  connected: boolean;
  connectionRetryCount: number;
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

export class DashDisplay extends React.Component<IProps, IState> {
  currentTip: string = "";

  emailVerifyPrompted: boolean;
  constructor(props) {
    super(props);
    this.state = {
      verified: false
    };
  }

  componentWillReceiveProps(nextProps) {
    this.set(nextProps);
  }

  componentWillUpdate(nextProps) {}

  componentDidUpdate() {}

  componentDidMount() {
    this.set(this.props);
  }

  dashBoardTip(props) {
    let verifiedFlag: boolean = false;
    let hasAuth = !(props.enhancedAuth === false || (props.userSettings && props.userSettings.authEnabled === 0));
    let message: any = "We're not quite sure what's going on...";
    if (props.connected === false) {
      message = tip.connecting;
    } else if (props.loggingIn) {
      message = tip.loggingIn;
    } else if (!props.userData) {
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

  userDisplay() {
    let display: any = "";
    const { classes, userId, userData, profilePublic } = this.props;

    if (this.props.loggingOut && userData) {
      display = <span> {tip.loggingOut}</span>;
    } else if (!this.props.sessionExpired && this.props.userData) {
      const profileLink = `/members/profile/${userId}`;
      display = (
        <Link className={classes.link} to={profileLink}>
          {" "}
          {profilePublic.screenName}
        </Link>
      );
    } else if (this.props.loggingIn) {
      display = <span> {tip.loggingIn}</span>;
    } else {
      display = "";
    }
    return display;
  }

  spinner() {
    const { classes } = this.props;
    return <CircularProgress size={22} className={classNames(classes.baseIcon, classes.spinner)} />;
  }

  // size={20}

  getVerifiedIndicator() {
    const { classes } = this.props;
    let layout: any;
    let verified = this.resolveVerification(this.props);
    let tag: any = null;
    let style: any;
    if (
      this.props.loggingIn ||
      this.props.loggingOut ||
      (!this.props.connected && this.props.connectionRetryCount > 2)
    ) {
      tag = this.spinner();
    } else if (this.props.userData && (!this.props.connected || !this.props.sessionReady)) {
      tag = <SyncProblem className={classNames(classes.baseIcon, classes.syncProblemIcon)} />;
    } else if (verified) {
      tag = <VerifiedUser className={classNames(classes.baseIcon, classes.verifiedUserIcon)} />;
    } else if (this.props.sessionReady) {
      tag = <ErrorIcon className={classNames(classes.baseIcon, classes.errorIcon)} />;
    }
    layout = (
      <div className={`${classes.verifiedIndicator} d-flex`} id="VerifiedIndicator">
        {tag}
      </div>
    );

    return layout || "";
  }

  // className={classes.errorIcon}

  getAvatar() {
    const { profilePublic, classes } = this.props;
    let layout: any = "";

    return (
      <div className={classes.avatar}>
        <Avatar profile={profilePublic} size="tiny" imageId={profilePublic.avatarId} />
      </div>
    );
  }
  // d-inline-block
  authVerifiedLayout() {
    const { classes, profilePublic } = this.props;
    let verifiedLayout: any = "";
    let userDisplay = this.userDisplay();
    verifiedLayout = (
      <div className={`${classes.root} d-flex justify-content-between align-items-center`}>
        {profilePublic && this.getAvatar()}
        {this.getVerifiedIndicator()}
        <div>{userDisplay}</div>
      </div>
    );
    return verifiedLayout || "";
  }

  render() {
    return this.authVerifiedLayout();
  }
}

export default withStyles(styles, { withTheme: true })(DashDisplay);
