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
  let verifiedFlag: boolean;
  let message: any;
  if (!Meteor.user()) {
    message = '';
  } else if (props.enhancedAuth === false) {
    message = props.EmailVerified ? tip.verified.simple.verified : tip.verified.simple.unverified;
  } else if (!props.authData) {
    message = '';
  } else {
    verifiedFlag =  props.authData.verified && props.EmailVerified;
    message = verifiedFlag ? tip.verified.enhanced.verified : tip.verified.enhanced.unverified;

    if (!props.EmailVerified) {
        message += tip.verified.enhanced.email;
    }

    if (!props.authData.verified) {
        message += props.EmailVerified ? '' : ' ';
        message += tip.verified.enhanced.auth2FA;
    }
  }

  return { verified: verifiedFlag, tip: message };
}

export function set(type, props) {
  let tipObj = dashBoardTip(props);
  if (tipObj.tip) {
    //jquery(`.${type}`).tooltipster({content: ''});
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
