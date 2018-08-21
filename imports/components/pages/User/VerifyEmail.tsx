import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Accounts } from "meteor/accounts-base";
import * as PropTypes from "prop-types";
import * as React from "react";
import Transition from "../../partials/Transition";
import * as Library from "../../../modules/library";
import * as User from "../../../modules/user";
import { purgeAllOtherSessions, createUserSession } from "../../../api/sessions/methods";
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
    let url = window.location.href;
    this.token = url.substr(url.lastIndexOf("/") + 1);
  }

  componentDidMount() {
    this.verify();
  }

  createSession() {
    let sessionToken = User.sessionToken("create");
    createUserSession.call({ sessionToken: sessionToken, keepMeLoggedIn: false }, (err, res) => {
      if (err) {
        console.log(`createSession error: [${err.reason}]`, err);
      }
      purgeAllOtherSessions.call({ sessionToken: sessionToken }, (err, res) => {
        if (err) {
          Library.modalErrorAlert(err.reason);
          console.log(`purgeAllOtherSessions error`, err);
        }
        Library.modalSuccessAlert({ message: "Your email address has been verified." });
      });
    });
  }

  verify() {
    let emailVerified = Library.nested(["userData", "emails", 0, "verified"], this.props);
    if (!emailVerified) {
      Accounts.verifyEmail(
        this.token,
        function verifyResponse(err) {
          if (!err) {
            this.createSession();
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

export default withTracker(({ params }) => {
  return {};
})(VerifyEmail);
