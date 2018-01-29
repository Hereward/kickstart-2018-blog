/*global Bert */

/*
interface IAuth {
    isAcceptable(s: string): boolean;
}

class Auth implements IAuth {
    constructor(props) {
        //super(props);
      }

    isAcceptable(s: string) {
        return s.length === 5 && numberRegexp.test(s);
    }
}

export { Auth };
*/

export function modalErrorAlert(reason='scary code error') {
  swal({
    title: "Oops, something went wrong!",
    text: `There was a problem executing that command: [${reason}]`,
    showConfirmButton: true,
    type: "error"
  });

}

export function dashBoardTip(props) {
  console.log(`dashBoardTip SignedIn=[${props.signedIn}]`);
  let verifiedFlag: boolean;
  let tip: string;
  if (!props.enhancedAuth) {
    verifiedFlag = props.signedIn && props.EmailVerified;
    let tip = verifiedFlag
      ? "Your account is verified."
      : "Your email address is not verified. ";
  } else {
    verifiedFlag = props.signedIn && props.AuthVerified && props.EmailVerified;
    tip = verifiedFlag ? "Your session was verified." : "Unverified session: ";

    if (!props.signedIn) {
      tip += "Not signed in.";
    } else {
      if (!props.EmailVerified) {
        tip += "Email address not verified";
      }

      if (!props.AuthVerified) {
        tip += ", session does not have 2 factor authentication.";
      }
    }
  }
  return { verified: verifiedFlag, tip: tip };
}

export function userAlert(type, props) {
  if (!props.signedIn) { return; }

  let objData = JSON.stringify(props);
  console.log(`userAlert [${type}] [${objData}]`);

  let msg = "";
  let alertType = "";
  let icon = "fa-magic";
  let title = "";
  let hideDelay = 2000;
  let allowAlert = false;
  if (type === "verifyEmail") {
    if (
      props.signedIn &&
      props.authVerified &&
      props.verificationEmailSent === 1 &&
      !props.EmailVerified
    ) {
      allowAlert = true;
      title = "Check Your Email";
      msg =
        "A verification email has been sent to your nominated email account. Please check your email and click on the verification link.";
      alertType = "warning";
    } else if (
      props.signedIn &&
      props.authVerified &&
      props.verificationEmailSent === 2 &&
      !props.EmailVerified
    ) {
      allowAlert = true;
      title = "Verification email could not be sent";
      msg =
        "We tried to send a verification email to your nominated email address, but there was a problem. Please check your profile for more details.";
      alertType = "danger";
    }
  }

  if (allowAlert) {
    Bert.defaults.hideDelay = hideDelay;
    Bert.alert({
      hideDelay: hideDelay,
      type: alertType,
      icon: icon,
      title: title,
      message: msg
    });
  }
}

