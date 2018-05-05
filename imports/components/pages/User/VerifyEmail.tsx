import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Accounts } from "meteor/accounts-base";
import * as PropTypes from "prop-types";
import ReactRouterPropTypes from "react-router-prop-types";
import * as React from "react";
import { withRouter } from "react-router-dom";

import Transition from "../../partials/Transition";
import * as Library from "../../../modules/library";
import * as User from "../../../modules/user";
import { Auth } from "../../../api/auth/publish";
import { purgeAllSessions, createUserSession } from "../../../api/sessions/methods";
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
    this.checkTokenEmailVerify = this.checkTokenEmailVerify.bind(this);
    let url = window.location.href;
    this.token = url.substr(url.lastIndexOf("/") + 1);
    this.done = false;
  }

  componentDidMount() {
    if (!User.id()) {
      this.checkTokenEmailVerify();
    }
  }

  componentDidUpdate() {
    if (this.props.sessionReady) {
      this.checkTokenEmailVerify();
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

  checkTokenEmailVerify() {
    let verified = Library.nested(["userData", "emails", 0, "verified"], this.props);
    //log.info(`verify email checkToken`, verified);
    log.info(`checkTokenEmailVerify`, this.token, User.id(), verified, this.done);
    let loggedInUser = User.id();
    if (!loggedInUser || (verified === false && !this.done)) {
      let sessionToken = User.sessionToken("get");
      this.done = true;

      Accounts.verifyEmail(
        this.token,
        function verifyResponse(err) {
          if (!err) {
            purgeAllSessions.call({}, (err, res) => {
              if (err) {
                Library.modalErrorAlert(err.reason);
                console.log(`purgeAllSessions error`, err);
              }
              Meteor.logout(() => {
                //Meteor["connection"].setUserId(null);
                this.props.history.push('/signin');
              });
            });

            Library.modalSuccessAlert({ message: "Your email address has been verified. Please log in again." });
          } else {
            Library.modalErrorAlert({
              detail: err.reason,
              title: `Email verification failed`
            });
            console.log(err);
            this.props.history.push("/");
          }

          

         
        }.bind(this)
      );
    }
  }

  getLayout() {
    return <Spinner caption="verifying" />;
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
