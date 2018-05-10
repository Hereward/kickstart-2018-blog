import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Accounts } from "meteor/accounts-base";
import * as PropTypes from "prop-types";
import * as React from "react";
import { withRouter } from "react-router-dom";
import Transition from "../../partials/Transition";
import * as Library from "../../../modules/library";
import * as User from "../../../modules/user";
import { createUserSession } from "../../../api/sessions/methods";
import Spinner from "../../partials/Spinner";

interface IProps {
  enhancedAuth: boolean;
  history: any;
  sillyProp: string;
  signedIn: boolean;
  sessionToken: string;
  userData: any;
  sessionReady: any;
}

interface IState {}

class VerifyEmail extends React.Component<IProps, IState> {
  token: string;
  done: boolean;

  constructor(props) {
    super(props);
    this.checkVerify = this.checkVerify.bind(this);
    let url = window.location.href;
    this.token = url.substr(url.lastIndexOf("/") + 1);
    this.done = false;
  }

  componentDidMount() {
    if (!User.id() && !this.done) {
      this.verify();
    }
  }

  componentDidUpdate() {
    if (this.props.sessionReady) {
      if (!this.done) {
        this.checkVerify();
      }
    }
  }

  createSession() {
    let sessionToken = User.sessionToken("create");
    createUserSession.call({ sessionToken: sessionToken, keepMeLoggedIn: false }, (err, res) => {
      if (err) {
        console.log(`createSession error: [${err.reason}]`, err);
        Library.modalErrorAlert(err.reason);
      }
    });
  }

  verify() {
    this.done = true;
    Accounts.verifyEmail(
      this.token,
      function verifyResponse(err) {
        if (!err) {
          User.logoutAndPurgeSessions({
            message: "Your email address has been verified. Please log in again.",
            newLocation: "/signin"
          });
        } else {
          Library.modalErrorAlert({
            message: err.reason,
            title: `Email verification failed`,
            location: "/"
          });
          console.log(err);
        }
      }.bind(this)
    );
  }

  checkVerify() {
    let verified = Library.nested(["userData", "emails", 0, "verified"], this.props);
    if (verified === true && !this.done) {
      this.props.history.push("/");
    }
    log.info(`checkVerify`, this.token, User.id(), verified, this.done);

    if (verified === false && !this.done) {
      this.verify();
    }
  }

  getLayout() {
    return <Spinner caption="verifying" type="component" />;
  }

  render() {
    return (
      <Transition>
        <div className="container page-content">{this.getLayout()}</div>
      </Transition>
    );
  }
}

export default withRouter(
  withTracker(({ params }) => {
    return {};
  })(VerifyEmail)
);
