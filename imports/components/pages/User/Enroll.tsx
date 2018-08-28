//import { Meteor } from "meteor/meteor";
import * as React from "react";
import * as PropTypes from "prop-types";
import { Accounts } from "meteor/accounts-base";
import ReactRouterPropTypes from "react-router-prop-types";
import { withTracker } from "meteor/react-meteor-data";
//import { Roles } from "meteor/alanning:roles";
import Transition from "../../partials/Transition";
import EnrollmentForm from "../../forms/EnrollmentForm";
//import * as ProfileMethods from "../../../api/profiles/methods";
//import * as AuthMethods from "../../../api/auth/methods";
import * as Library from "../../../modules/library";
//import * as SessionMethods from "../../../api/sessions/methods";
//import * as PagesMethods from "../../../api/pages/methods";
import * as User from "../../../modules/user";
import { configureNewUser } from "../../../api/admin/methods";

//import * as userSettingsMethods from "../../../api/settings/methods";
//import { assignRolesNewUser } from "../../../api/admin/methods";

//import SignInForm from "../../forms/SignInForm";

interface IProps {
  history: any;
  enhancedAuth: boolean;
  signedIn: boolean;
  sessionToken: string;
}

interface IState {
  [x: number]: any;
  email: string;
  password1: string;
  password2: string;
  allowSubmit: boolean;
  keepMeLoggedIn: boolean;
}

class Enroll extends React.Component<IProps, IState> {
  token: string;

  constructor(props) {
    super(props);

    let url = window.location.href;
    this.token = url.substr(url.lastIndexOf("/") + 1);

    this.state = {
      email: "",
      password1: "",
      password2: "",
      allowSubmit: true,
      keepMeLoggedIn: false
    };
    this.enrollUser = this.enrollUser.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  static propTypes = {
    enhancedAuth: PropTypes.bool,
    history: ReactRouterPropTypes.history
  };

  componentDidUpdate() {
    log.info(`Enroll`, this.props);
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let id = target.id;

    this.setState({ [id]: value });
  }

  /*
  handleCheck(isInputChecked) {
    this.setState({ keepMeLoggedIn: isInputChecked });
    log.info(`Register - handleCheck`, isInputChecked);
  }

  */

  isValidPassword(password1, password2) {
    if (password1 === password2) {
      return password1.length >= 6 ? true : false;
    } else {
      this.setState({ allowSubmit: true });
      return Library.modalErrorAlert("Passwords don't match");
    }
  }

  enrollUser(event) {
    this.setState({ allowSubmit: false });
    let email = this.state.email.trim();
    let password1 = this.state.password1.trim();
    let password2 = this.state.password2.trim();

    log.info(`enrollUser`, password1, password2);

    let isValidPassword = this.isValidPassword(password1, password2);

    if (isValidPassword) {
      //User.configureNewUser();
      //this.props.history.push("/");

      Accounts.resetPassword(
        this.token,
        password1,
        function reset(err) {
          if (!err) {
            //User.configureNewUser({type: "enroll"});

            const sessionToken = User.sessionToken("create");

            configureNewUser.call({ sessionToken: sessionToken, type: "enroll" }, (err, res) => {
              if (err) {
                log.error(`configureNewUserMethod error: [${err.reason}]`, err);
              } else {
                this.props.history.push("/");
              }
            });

            Library.modalSuccessAlert({ message: "Congratulations! Your account is now active." });
            this.props.history.push("/");
          } else {
            Library.modalErrorAlert({ message: err.reason, title: "Unable to set password." });
            log.error(err);
          }
          this.setState({ allowSubmit: true });
        }.bind(this)
      );
    } else {
      Library.modalErrorAlert({
        message: "Please try again",
        title: "Password must be at least 6 characters."
      });
    }
  }

  getLayout() {
    let layout = (
      <div>
        <h2>Welcome!</h2>

        <p>In order to activate your account you'll need to first set a password.</p>

        <EnrollmentForm
          allowSubmit={this.state.allowSubmit}
          handleChange={this.handleChange}
          handleSubmit={this.enrollUser}
        />
      </div>
    );

    return <div className="page-content">{layout}</div>;
  }

  render() {
    let layout = this.getLayout();

    return <Transition>{layout}</Transition>;
  }
}

export default withTracker(() => {
  return {};
})(Enroll);
