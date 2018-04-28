///<reference path="../../../../index.d.ts"/>
import { Accounts } from "meteor/accounts-base";
import * as PropTypes from "prop-types";
import ReactRouterPropTypes from "react-router-prop-types";
import { withTracker } from "meteor/react-meteor-data";
import * as React from "react";
import { Link, withRouter } from "react-router-dom";
import Transition from "../../partials/Transition";
import ChangePasswordForm from "../../forms/ChangePasswordForm";
import * as Library from "../../../modules/library";
import { clearSessionAuthMethod } from "../../../api/sessions/methods";
import * as User from "../../../modules/user";

interface IProps {
  history: any;
  enhancedAuth: boolean;
  authVerified: boolean;
  sessionToken: string;
}

interface IState {
  oldPassword: string;
  newPassword: string;
  allowSubmit: boolean;
}

class ChangePassword extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    let url = window.location.href;

    this.state = {
      oldPassword: "",
      newPassword: "",
      allowSubmit: true
    };

    this.changePassword = this.changePassword.bind(this);
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
      <ChangePasswordForm
        allowSubmit={this.state.allowSubmit}
        handleChange={this.handleChange}
        handleSubmit={this.changePassword}
      />
    );

    return form;
  }

  isValidPassword(password) {
    if (password.length >= 6) {
      return true;
    } else {
      return Library.modalErrorAlert({ message: "Please try again.", title: "Password is too short." });
    }
  }

  changePassword() {
    this.setState({ allowSubmit: false });
    let newPassword = this.state.newPassword.trim();
    let oldPassword = this.state.oldPassword.trim();

    if (this.isValidPassword(newPassword)) {
      Accounts.changePassword(
        oldPassword,
        newPassword,
        function sv(err) {
          let authEnabled = Library.nested(["userSettings", "authEnabled"], this.props);
          if (!err) {
            if (authEnabled) {
              clearSessionAuthMethod.call({ verified: false, sessionToken: User.sessionToken("get") }, (err, res) => {
                if (err) {
                  Library.modalErrorAlert(err.reason);
                  console.log(`clearSessionAuthMethod error`, err);
                }
                this.props.history.push("/authenticate");
              });
            } else {
              this.props.history.push("/");
            }

            Library.modalSuccessAlert({ message: "Your password was changed!" });
          } else {
            this.setState({ allowSubmit: true });
            Library.modalErrorAlert({ message: err.reason, title: "Password change failed." });

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
  })(ChangePassword)
);
