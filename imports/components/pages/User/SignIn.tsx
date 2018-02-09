import { Meteor } from "meteor/meteor";
import * as PropTypes from 'prop-types';
import ReactRouterPropTypes from "react-router-prop-types";
import { withTracker } from "meteor/react-meteor-data";
import * as React from "react";
import { Link, withRouter, Redirect } from "react-router-dom";

import * as AuthMethods from "../../../api/auth/methods";
import * as Library from "../../../modules/library";


//import * as jquery from 'jquery';

//import Authenticator from "./Authenticator";
import Transition from "../../partials/Transition";
import SignInForm from "../../forms/SignInForm";


interface IProps {
  history: any;
  AuthVerified: boolean;
  enhancedAuth: boolean;
  signedIn: boolean;
}

interface IState {
  email: string;
  password: string;
}

const user: any = Meteor.user();

class SignIn extends React.Component<IProps, IState> {

  constructor(props) {
    super(props);

   

    this.SignInUser = this.SignInUser.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      password: '',
      email: ''
    };

    console.log(`Props:`, this.props);
  }

  componentWillMount() {}

  componentDidMount() {
    console.log(`componentDidMount SignIn. SignedIn =[${this.props.signedIn}]`);
  }

  componentWillReceiveProps(nextProps) {}

  static propTypes = {
    history: ReactRouterPropTypes.history,
    enhancedAuth: PropTypes.bool,
    signedIn: PropTypes.bool,
  };

  handleChange(e) {
    
    //this.setState({ showAuthenticator: true });
    let target = e.target;
    let value = target.value;
    let id = target.id;

    //console.log(`handleChange PARENT [${target}] [${value}]`);

    this.setState({ [id]: value });
  }

  getLayout() {
    let form = (
      <SignInForm
        handleChange={this.handleChange}
        handleSubmit={this.SignInUser}
      />
    );

    if (!this.props.signedIn) {
      return form;
    } else {
      return <div>Already signed in.</div>;
    }
  }



  SignInUser() {

    //console.log(`Login [${this.state.email}] [${this.state.password}]`);

    Meteor.loginWithPassword(this.state.email, this.state.password, error => {
      if (error) {
        return Library.modalErrorAlert(
          {detail: error.reason, title: 'Sign In Failed'}
        );
       
      } else if (this.props.enhancedAuth) {
        let authFields = {
          verified: false
        };
    
        AuthMethods.setVerified.call(authFields, (err, res) => {
          //console.log("setVerified.call", authFields);
          if (err) {
            Library.modalErrorAlert(err.reason);
            console.log(`setVerified error`, err);
          } else {
            this.props.history.push("/authenticate");
          }
        });
        
      } else {
        this.props.history.push("/");
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


