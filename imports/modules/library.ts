import * as User from "./user";

export function invalidAuthCodeAlert(error) {
  let message: string;
  let title: string;
  //let obj = arguments[0];
  message = error.reason || "Operation completed sucessfully.";
  title = error.error === "invalidCode" ? "Invalid Code" : "Account Locked";

  swal({
    title: title,
    text: message,
    showConfirmButton: true,
    type: "error"
  });
}

export function modalSuccessAlert(params: any) {
  let message: string;
  let title: string;
  let obj = arguments[0];
  message = obj.message || "Operation completed sucessfully.";
  title = obj.title || "Success!";

  swal({
    title: title,
    text: message,
    showConfirmButton: true,
    type: "success"
  });
}

export function modalErrorAlert(params: any) {
  let argLength = arguments.length;
  let message: string;
  let title: string;
  let detail: string;
  let text = "";

  if (typeof arguments[0] === "object") {
    let obj = arguments[0];
    message = obj.message;
    title = obj.title || "Oops, something went wrong!";
    detail = obj.detail;
  } else {
    message = arguments[1] || "The last action failed to complete properly.";
    title = arguments[2] || "Oops, something went wrong!";
    detail = arguments[0] || "Please try again.";
  }

  if (message) {
    text += message;
  }
  if (message && detail) {
    text += " ";
  }
  if (detail) {
    text += detail;
  }

  swal({
    title: title,
    text: `${text}`,
    showConfirmButton: true,
    type: "error"
  });
}

export function userModelessAlert(type, props) {
  if (!User.data()) {
    return;
  }

  let emailVerified = props.userData.emails[0].verified;

  let msg = "";
  let alertType = "";
  let icon = "fa-magic";
  let title = "";
  let hideDelay = 7000;
  //let allowFurtherAlerts = false;
  //  (!props.enhancedAuth || props.authData.verified) &&
  if (type === "verifyEmail") {
    //allowFurtherAlerts = true;
    if (
      props.profile.verificationEmailSent === 1 &&
      !emailVerified
    ) {
      //allowFurtherAlerts = true;
      title = "Check Your Email";
      msg =
        "A verification email has been sent to your nominated email account. Please check your email and click on the verification link.";
      alertType = "warning";
    } else if (
      props.profile.verificationEmailSent === 2 &&
      !emailVerified
    ) {
      //allowFurtherAlerts = true;
      title = "Verification email could not be sent";
      msg =
        "We tried to send a verification email to your nominated email address, but there was a problem. Please check your profile for more details.";
      alertType = "danger";
    }
  }

  //log.info(`Bert message =`, emailVerified, props.profile.verificationEmailSent, type, msg);
  Bert.defaults.hideDelay = hideDelay;
  Bert.alert({
    hideDelay: hideDelay,
    type: alertType,
    icon: icon,
    title: title,
    message: msg
  });

}

export function setCookie(name, value, sec) {
  if (sec) {
    var date = new Date();
    date.setTime(date.getTime() + sec * 1000);
    var expires = "; expires=" + date.toUTCString();
  } else var expires = "";
  let cookie = name + "=" + value + expires + "; path=/";
  document.cookie = cookie;
  return cookie;
}

export function getCookie(name) {
  var value = "; " + document.cookie;
  var parts = value.split("; " + name + "=");
  if (parts.length == 2)
    return parts
      .pop()
      .split(";")
      .shift();
}
