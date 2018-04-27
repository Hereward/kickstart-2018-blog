import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import * as PropTypes from "prop-types";
import ReactRouterPropTypes from "react-router-prop-types";
import { withTracker } from "meteor/react-meteor-data";
import * as React from "react";
import { Link, withRouter } from "react-router-dom";
import Transition from "../../partials/Transition";
import ForgotPassWordResetForm from "../../forms/ForgotPassWordResetForm";
import * as Library from "../../../modules/library";
import { clearSessionAuthMethod } from "../../../api/sessions/methods";
import * as User from "../../../modules/user";

interface IProps {
  history: any;
  enhancedAuth: boolean;
  authVerified: boolean;
  loginToken: string;
}

interface IState {
  password1: string;
  password2: string;
  email: string;
  allowSubmit: boolean;
}

class ForgotPassWordReset extends React.Component<IProps, IState> {
  token: string;

  constructor(props) {
    super(props);

    let url = window.location.href;
    this.token = url.substr(url.lastIndexOf("/") + 1);

    this.state = {
      password1: "",
      password2: "",
      email: "",
      allowSubmit: true
    };

    this.resetPassword = this.resetPassword.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.authVerified) {
      this.props.history.push("/");
    }
  }

  handleChange(e) {
    let target = e.target;
    let value = target.value;
    let id = target.id;

    this.setState({ [id]: value });
  }

  getLayout() {
    let form = (
      <ForgotPassWordResetForm
        allowSubmit={this.state.allowSubmit}
        handleChange={this.handleChange}
        handleSubmit={this.resetPassword}
      />
    );

    return form;
  }

  resetPassword() {
    this.setState({ allowSubmit: false });

    let password1 = this.state.password1.trim();
    let password2 = this.state.password2.trim();

    let isValidPassword = function isValidPassword(password1, password2) {
      if (password1 === password2) {
        return password1.length >= 6 ? true : false;
      } else {
        this.setState({ allowSubmit: true });
        return Library.modalErrorAlert({ message: "Please try again.", title: "Passwords don't match." });
      }
    };

    if (isValidPassword(password1, password2)) {
      Accounts.resetPassword(
        this.token,
        password1,
        function reset(err) {
          if (!err) {
            if (this.props.enhancedAuth && this.props.userSettings.authEnabled) {
              clearSessionAuthMethod.call({ verified: false, loginToken: User.sessionToken("get") }, (err, res) => {
                if (err) {
                  Library.modalErrorAlert(err.reason);
                  console.log(`clearSessionAuthMethod error`, err);
                }
              });
            }

            Library.modalSuccessAlert({ message: "Your password was reset." });

            if (this.props.enhancedAuth) {
              console.log("password reset: redirect to /authenticate");
              this.props.history.push("/authenticate");
            } else {
              this.props.history.push("/");
              console.log("password reset: redirect to /");
            }
          } else {
            this.setState({ allowSubmit: true });
            Library.modalErrorAlert({ reason: err, title: "Password reset failed." });

            console.log(err);
          }
        }.bind(this)
      );
    } else {
      return Library.modalErrorAlert({
        message: "Please try again.",
        title: "Password must be at least 6 characters."
      });
    }
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
  withTracker(() => {
    return {};
  })(ForgotPassWordReset)
);
