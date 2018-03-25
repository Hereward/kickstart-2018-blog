import { Meteor } from "meteor/meteor";
import * as jquery from "jquery";
import "tooltipster";
import "tooltipster/dist/css/tooltipster.bundle.min.css";
import "tooltipster/dist/css/plugins/tooltipster/sideTip/themes/tooltipster-sideTip-light.min.css";
import "tooltipster/dist/css/plugins/tooltipster/sideTip/themes/tooltipster-sideTip-shadow.min.css";

const tip = {
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

export function dashBoardTip(props) {
  let emailVerified = (Meteor.user()) ? Meteor.user().emails[0].verified : false;
  let verifiedFlag: boolean = false;
  let message: any;
  if (!Meteor.user()) {
    message = '';
  } else if (props.enhancedAuth === false) {
    verifiedFlag = emailVerified;
    message = emailVerified ? tip.verified.simple.verified : tip.verified.simple.unverified;
  } else if (!props.authData) {
    message = '';
  } else {
    verifiedFlag =  props.authData.verified && emailVerified;
    message = verifiedFlag ? tip.verified.enhanced.verified : tip.verified.enhanced.unverified;

    if (!emailVerified) {
        message += tip.verified.enhanced.email;
    }

    if (!props.authData.verified) {
        message += emailVerified ? '' : ' ';
        message += tip.verified.enhanced.auth2FA;
    }
  }

  return { verified: verifiedFlag, tip: message };
}

export function set(type, props) {
  let tipObj = dashBoardTip(props);
  if (tipObj.tip) {
    let initialised = jquery(`.${type}`).hasClass("tooltipstered");
    if (initialised) {
        jquery(`.${type}`).tooltipster('destroy');
    }
    
    jquery(`.${type}`).tooltipster({
      trigger: "hover",
      animation: "slide",
      theme: ["tooltipster-shadow", "tooltipster-shadow-customized"],
      content: tipObj.tip
    });
  }
}

export function unset(type) {
  jquery(`.${type}`).tooltipster("destroy");
}
