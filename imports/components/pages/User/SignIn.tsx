import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import ReactRouterPropTypes from "react-router-prop-types";
import { withTracker } from "meteor/react-meteor-data";
import * as React from "react";
import { Link, withRouter } from "react-router-dom";
import Authenticator from "./Authenticator";
import Transition from "../../partials/Transition";
import SignInForm from "../../forms/SignInForm";

interface IProps {
  history: any;
  AuthVerified: boolean;
  EnhancedAuth: number;
  SignedIn: boolean;
}

interface IState {
  email: string;
  password: string;
}

/*
declare namespace User {
  let private_key: string;
}
*/

const user: any = Meteor.user();

//var outerHtmlElement: any = outerElement[0];
//var coordinates = outerHtmlElement.getBBox();

class SignIn extends React.Component<IProps, IState> {
  //export default class SignIn extends Component {

  constructor(props) {
    super(props);
    this.SignInUser = this.SignInUser.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  static propTypes = {
    history: ReactRouterPropTypes.history,
    EnhancedAuth: PropTypes.number,
    SignedIn: PropTypes.bool,
  };

  handleChange(e) {
    //this.setState({ showAuthenticator: true });
    let target = e.target;
    let value = target.value;
    let id = target.id;

    this.setState({ [id]: value });
  }

  getLayout() {
    let form = (
      <SignInForm
        handleChange={this.handleChange}
        handleSubmit={this.SignInUser}
      />
    );

    if (!this.props.SignedIn) {
      return form;
    } else if (this.props.EnhancedAuth) {
      return <Authenticator />;
    } else {
      this.props.history.push("/");
      return <div />;
    }
  }



  SignInUser() {
    //event.preventDefault();
    //let email = this.refs.email.value.trim();
    //let password = this.refs.password.value.trim();
    console.log(`Login [${this.state.email}] [${this.state.password}]`);

    Meteor.loginWithPassword(this.state.email, this.state.password, error => {
      if (error) {
        return swal({
          title: "Email or password incorrect",
          text: "Please try again",
          timer: 2500,
          showConfirmButton: false,
          type: "error"
        });
      } else {
        let key = user.private_key;
        let name = user.username;
        console.log(`Successfull Login: [${name}] [${key}]`);
        console.log(`SignInUser: props.SignedIn: [${this.props.SignedIn}]`);
      }
    });
  }

  render() {
    return (
      <Transition>
        <div>{this.getLayout()}</div>
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


