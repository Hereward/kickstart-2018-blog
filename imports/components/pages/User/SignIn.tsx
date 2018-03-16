import { Meteor } from "meteor/meteor";
import * as PropTypes from "prop-types";
import ReactRouterPropTypes from "react-router-prop-types";
import { withTracker } from "meteor/react-meteor-data";
import * as React from "react";
import { Link, withRouter, Redirect } from "react-router-dom";
import * as AuthMethods from "../../../api/auth/methods";
import * as Library from "../../../modules/library";
import Transition from "../../partials/Transition";
import SignInForm from "../../forms/SignInForm";
import * as PageMethods from "../../../api/pages/methods";

interface IProps {
  history: any;
  AuthVerified: boolean;
  enhancedAuth: boolean;
  signedIn: boolean;
}

interface IState {
  email: string;
  password: string;
  allowSubmit: boolean;
}

const user: any = Meteor.user();

class SignIn extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.SignInUser = this.SignInUser.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      password: "",
      email: "",
      allowSubmit: true
    };
  }

  componentWillMount() {}

  componentDidMount() {
    console.log(`componentDidMount SignIn. SignedIn =[${this.props.signedIn}]`);
  }

  componentWillReceiveProps(nextProps) {}

  static propTypes = {
    history: ReactRouterPropTypes.history,
    enhancedAuth: PropTypes.bool,
    signedIn: PropTypes.bool
  };

  handleChange(e) {
    let target = e.target;
    let value = target.value;
    let id = target.id;

    this.setState({ [id]: value });
  }

  getLayout() {
    let form = (
      <SignInForm
        allowSubmit={this.state.allowSubmit}
        handleChange={this.handleChange}
        handleSubmit={this.SignInUser}
      />
    );

    if (!this.props.signedIn) {
      return form;
    } else {
      return (
        <div>
          <h2>Signed In</h2>
          <div>
            You are signed in as <strong>{Meteor.user().emails[0].address}</strong>.
          </div>
        </div>
      );
    }
  }

  SignInUser() {
    this.setState({ allowSubmit: false });
    Meteor.loginWithPassword(this.state.email, this.state.password, error => {
      if (error) {
        this.setState({ allowSubmit: true });
        return Library.modalErrorAlert({ detail: error.reason, title: "Sign In Failed" });
      } else {
        console.log(`Sign In Succesful`);
        //PageMethods.refreshDefaultContent();
        let destination = '';

        if (this.props.enhancedAuth) {
          let authFields = {
            verified: false
          };

          AuthMethods.setVerified.call(authFields, (err, res) => {
            if (err) {
              Library.modalErrorAlert(err.reason);
              console.log(`setVerified error`, err);
            } else {
              destination = "/authenticate";
            }
          });
        } else {
          destination = "/";
        }

        this.props.history.push(destination);
        PageMethods.refreshDefaultContent();
      }
    });
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
    Meteor.subscribe("userData");
    return {};
  })(SignIn)
);
