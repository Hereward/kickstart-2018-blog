import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Accounts } from "meteor/accounts-base";
import * as PropTypes from "prop-types";
import ReactRouterPropTypes from "react-router-prop-types";
import * as React from "react";
import { withRouter } from "react-router-dom";
import * as AuthMethods from "../../../api/auth/methods";

import Transition from "../../partials/Transition";
import * as Library from "../../../modules/library";

interface IProps {
  enhancedAuth: boolean;
  history: any;
  AuthVerified: boolean;
  sillyProp: string;
  signedIn: boolean;
}

interface IState {}

class VerifyEmail extends React.Component<IProps, IState> {
  token: string;

  constructor(props) {
    super(props);
    this.checkToken = this.checkToken.bind(this);
    let url = window.location.href;
    this.token = url.substr(url.lastIndexOf("/") + 1);
  }

  componentDidUpdate() {}

  componentWillReceiveProps(nextProps) {}

  componentWillMount() {
    this.checkToken();
  }

  static propTypes = {
    history: ReactRouterPropTypes.history,
    sillyProp: PropTypes.string
  };

  //
  checkToken() {
    Accounts.verifyEmail(
      this.token,
      function verified(err) {
        if (!err) {
          if (this.props.enhancedAuth) {
            AuthMethods.setVerified.call({ verified: false }, (err, res) => {
              if (err) {
                Library.modalErrorAlert(err.reason);
                console.log(`setVerified error`, err);
              }
            });

            this.props.history.push("/authenticate");
          } else {
            this.props.history.push("/");
          }
        } else {
          Library.modalErrorAlert({
            detail: "Please try again.",
            title: "Email verification failed"
          });
          console.log(err);
          this.props.history.push("/");
        }
      }.bind(this)
    );
  }

  getLayout() {
    return <div className="lead">Verifying....</div>;
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
