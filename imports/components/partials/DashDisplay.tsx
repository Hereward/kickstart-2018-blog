import * as React from "react";
import { Meteor } from "meteor/meteor";
import * as PropTypes from "prop-types";
import * as classNames from "classnames";
import PowerOffIcon from "@material-ui/icons/PowerSettingsNew";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
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
//import MainDrawer from "./MainDrawer";

import * as User from "../../modules/user";

let styles: any;
styles = theme => ({
  root: {
    maxWidth: "14rem",
    overflow: "hidden",
    fontSize: "0.9rem",
    letterSpacing: "0.02rem",
    [theme.breakpoints.up("sm")]: {
      maxWidth: "20rem"
    }
  },
  powerOff: {
    cursor: "pointer"
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
  },
  button: {
    minHeight: "auto",
    padding: "4px 10px",
    fontSize: "0.78rem",
    letterSpacing: "0.05rem",
    boxShadow: "none"
  },
  signinButton: {
    color: "white",
    borderColor: "rgb(255,255,255, 0.25)"
  }
});

interface IProps {
  sessionExpired: boolean;
  history: PropTypes.object.isRequired;
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

interface IState {}

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

const Wrapper = props => {
  const { componentProps, children } = props;
  return (
    <Typography component="div" className={`${componentProps.classes.root} d-flex justify-content-between align-items-center`}>
      {children}
    </Typography>
  );
};

export class DashDisplay extends React.Component<IProps, IState> {
  currentTip: string = "";

  emailVerifyPrompted: boolean;
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    //this.setToolTips(nextProps);
  }

  componentWillUpdate(nextProps) {}

  componentDidUpdate(prevProps) {
    //log.info(`DashDisplay.componentDidUpdate()`, prevProps, this.props);
    const { userData, userSession, loggingOut } = this.props;

    if (
      loggingOut !== prevProps.loggingOut ||
      userData !== prevProps.userData ||
      userSession !== prevProps.userSession
    ) {
      //log.info(`DashDisplay.componentDidUpdate() TIPS DESTROY`);
      //this.destroyTip();
      if (loggingOut || !userData) {
        this.destroyTip();
      } else {
        //log.info(`DashDisplay.componentDidUpdate() TIPS ON`, this.props);
        this.setToolTips(this.props);
      }
    }
  }

  componentDidMount() {
    const { userData } = this.props;

    if (userData) {
      this.setToolTips(this.props);
    }
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
      verifiedFlag = this.resolveVerification();
      if (hasAuth) {
        message = verifiedFlag ? tip.verified.enhanced.verified : tip.verified.enhanced.auth2FA;
      } else {
        message = verifiedFlag ? tip.verified.simple.verified : tip.verified.simple.unverified;
      }
    }

    return { verified: verifiedFlag, tip: message };
  }

  resolveVerification() {
    const { userData, userSettings, enhancedAuth, userSession } = this.props;
    if (!userData || !userSettings) {
      return false;
    }
    let verifiedFlag: boolean = false;
    let emailVerified = userData ? userData.emails[0].verified : false;
    if (enhancedAuth === false || userSettings.authEnabled === 0) {
      verifiedFlag = emailVerified;
    } else {
      verifiedFlag = ((userSession && userSession.verified) || !userSettings.authEnabled) && emailVerified;
    }

    return verifiedFlag;
  }

  destroyTip() {
    let initialised = jquery(`.tooltipster`).hasClass("tooltipstered");
    if (initialised) {
      log.info(`DashDisplay.destroyTip()`);
      jquery(`.tooltipster`).tooltipster("destroy");
    }
    this.currentTip = "";
  }

  setToolTips(props) {
    //log.info(`DashDisplay.setToolTips()`);
    let newTip = this.dashBoardTip(props).tip;
    if (newTip !== this.currentTip) {
      this.destroyTip();
      this.currentTip = newTip;
      jquery(`.tooltipster`).tooltipster({
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
    let verified = this.resolveVerification();
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
      <div className={`${classes.verifiedIndicator} d-flex tooltipster`} id="VerifiedIndicator">
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

  /*
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
      layout = <MainDrawer sessionReady={sessionReady} loggingIn={loggingIn} loggingOut={loggingOut} userId={userId} />;
    }
    return layout;
  }
  */

  action = type => {
    const { classes, history } = this.props;
    history.push(`/members/${type}`);
  };

  loggedOutView() {
    const { classes } = this.props;
    const rootClass = classes.root;

    const layout = (
      <Wrapper componentProps={this.props}>
        <Button
          variant="outlined"
          className={classNames(classes.button, classes.signinButton)}
          onClick={() => this.action("signin")}
          size="small"
        >
          Sign In
        </Button>&nbsp;&nbsp;&nbsp;
        <Button
          className={classes.button}
          onClick={() => this.action("register")}
          size="small"
          variant="contained"
          color="primary"
        >
          Register
        </Button>
      </Wrapper>
    );
    return layout;
  }

  loggedInView() {
    const { classes, profilePublic } = this.props;
    const rootClass = classes.root;
    const userDisplay = this.userDisplay();
    return (
      <Wrapper componentProps={this.props}>
        {profilePublic && this.getAvatar()}
        {this.getVerifiedIndicator()}
        <div>{userDisplay}</div>
      </Wrapper>
    );
  }

  layout() {
    const { userId } = this.props;
    let layout: any = "";
    if (userId) {
      layout = this.loggedInView();
    } else {
      layout = this.loggedOutView();
    }

    return layout;
  }

  render() {
    const { classes } = this.props;
    return this.layout();
  }
}

export default withStyles(styles, { withTheme: true })(DashDisplay);
