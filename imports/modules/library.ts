import * as _swal from "sweetalert";
import * as truncate from "truncate-html";
import * as htmlToText from "html-to-text";
import * as sanitizeHtml from "sanitize-html";
import { SweetAlert } from "sweetalert/typings/core";

const temp: any = _swal;
const swal: SweetAlert = temp;
declare var window: any;
declare var DocHead: any;

export function sanitize(props: { type: string; content: string }) {
  let output: any = "";
  if (props.type === "html") {
    output = sanitizeHtml(props.content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
      allowedSchemes: sanitizeHtml.defaults.allowedSchemes.concat(["data"])
    });
  } else if (props.type === "text") {
    output = sanitizeHtml(props.content, {
      allowedTags: [],
      allowedAttributes: {}
    });
  }
  return output;
}

export function formatPlainText(props: { text: string; wordCount: number }) {
  const truncatedHML = truncate(props.text, props.wordCount, { byWords: true });
  const formattedText = htmlToText.fromString(truncatedHML, { wordwrap: false });
  return formattedText;
}

const authErrors = {
  invalidCode: "Invalid Code",
  exceededAttempts: "Account Locked",
  invalidSession: "Invalid Session"
};

export const nested = (pathArr, nestedObj) => {
  return pathArr.reduce((obj, key) => (obj && obj[key] !== "undefined" ? obj[key] : null), nestedObj);
};

export function invalidAuthCodeAlert(error) {
  let message: string;
  let title: string;
  message = error.reason || "Operation completed sucessfully.";
  title = authErrors[error.error] ? authErrors[error.error] : "Something Went Wrong...";

  swal({
    title: title,
    text: message,
    icon: "error"
  });
}

export function simpleAlert(message) {
  return confirmDialog({ title: message, message: "off", icon: "off", buttons: [false, true] });
}

export function confirmDialog(params?: { title?: string; message?: string; icon?: string; buttons?: any }) {
  let title = "Are you sure ?";
  let message = "You cannot undo this operation.";
  let icon = "warning";
  let buttons = [true, true];
  if (params) {
    if (params.title) {
      title = params.title;
    }
    if (params.message) {
      message = params.message === "off" ? "" : params.message;
    }

    if (params.icon) {
      icon = params.icon === "off" ? "" : params.icon;
    }

    if (params.buttons) {
      buttons = params.buttons;
    }
  }

  return swal({
    title: title,
    text: message,
    icon: icon,
    buttons: buttons
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
    icon: "success"
  }).then(value => {
    if (obj.location) {
      window.location.assign(obj.location);
    }
  });
}

export function modalErrorAlert(params: any) {
  let argLength = arguments.length;
  let message: string;
  let title: string;
  let detail: string;
  let text = "";
  let location = "";
  let obj = arguments[0];
  if (typeof arguments[0] === "object") {
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
    icon: "error"
  }).then(value => {
    if (obj.location) {
      window.location.assign(obj.location);
    }
  });
}

export function userModelessAlert(type, props) {
  let msg = "";
  let alertType = "";
  let title = "";
  let hideDelay = 7000;

  if (type === "verifyEmail") {
    if (props.userSettings.verificationEmailSent === 1) {
      title = "Check Your Email";
      msg =
        "A verification email has been sent to your nominated email account. Please check your email and click on the verification link.";
      alertType = "info";
    } else if (props.userSettings.verificationEmailSent === 2) {
      title = "Verification email could not be sent";
      msg =
        "We tried to send a verification email to your nominated email address, but there was a problem. Please check your profile for more details.";
      alertType = "danger";
    }
  }

  Bert.defaults.hideDelay = hideDelay;
  Bert.alert({
    hideDelay: hideDelay,
    type: alertType,
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
