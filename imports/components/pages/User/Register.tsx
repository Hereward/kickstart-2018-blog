import { Meteor } from "meteor/meteor";
import * as React from "react";
import * as PropTypes from "prop-types";
import { Accounts } from "meteor/accounts-base";
import ReactRouterPropTypes from "react-router-prop-types";
import Transition from "../../partials/Transition";
import RegistrationForm from "../../forms/RegistrationForm";
import * as ProfileMethods from "../../../api/profiles/methods";
import * as Library from "../../../modules/library";
import * as User from "../../../modules/user";
import { configureNewUser } from "../../../api/admin/methods";

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

class Register extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password1: "",
      password2: "",
      allowSubmit: true,
      keepMeLoggedIn: false
    };
    this.registerUser = this.registerUser.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
  }

  static propTypes = {
    enhancedAuth: PropTypes.bool,
    history: ReactRouterPropTypes.history
  };

  componentDidUpdate() {}

  sendVerificationEmail(id) {
    let authFields = {
      id: id
    };

    ProfileMethods.sendVerificationEmail.call(authFields, (err, res) => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`sendVerificationEmail error`, err);
      }
    });
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let id = target.id;

    this.setState({ [id]: value });
  }

  handleCheck(isInputChecked) {
    this.setState({ keepMeLoggedIn: isInputChecked });
    log.info(`Register - handleCheck`, isInputChecked);
  }

  isValidPassword(password1, password2) {
    if (password1 === password2) {
      return password1.length >= 6 ? true : false;
    } else {
      this.setState({ allowSubmit: true });
      return Library.modalErrorAlert("Passwords don't match");
    }
  }

  registerUser(event) {
    this.setState({ allowSubmit: false });
    let email = this.state.email.trim();
    let password1 = this.state.password1.trim();
    let password2 = this.state.password2.trim();

    let isValidPassword = this.isValidPassword(password1, password2);

    if (isValidPassword) {
      Accounts.createUser(
        {
          email: email,
          password: password1
        },
        err => {
          if (err) {
            console.log(`Error: ${err.reason}`);
            this.setState({ allowSubmit: true });
            Library.modalErrorAlert({
              message: err.reason,
              title: `Registration Failed`
            });
            console.log(`createUser error`, err);
          } else {
            const sessionToken = User.sessionToken("create");

            configureNewUser.call({ sessionToken: sessionToken, type: "register" }, (err, res) => {
              if (err) {
                log.error(`configureNewUserMethod error: [${err.reason}]`, err);
              } else {
                this.props.history.push("/");
              }
            });
          }
        }
      );
    } else {
      Library.modalErrorAlert({
        message: "Please try again",
        title: "Password must be at least 6 characters."
      });
    }
  }

  getLayout() {
    let layout: any;
    let form = (
      <RegistrationForm
        allowSubmit={this.state.allowSubmit}
        handleChange={this.handleChange}
        handleSubmit={this.registerUser}
        handleCheck={this.handleCheck}
      />
    );

    layout = form;

    return <div className="page-content">{layout}</div>;
  }

  render() {
    let layout = this.getLayout();

    return <Transition>{layout}</Transition>;
  }
}

export default Register;
