import { Meteor } from "meteor/meteor";
//import { Session } from 'meteor/session';
import * as React from "react";
import * as PropTypes from "prop-types";
import { Accounts } from "meteor/accounts-base";
import ReactRouterPropTypes from "react-router-prop-types";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
//import QRCode from "react-qr-code";
//import { Alert } from "reactstrap";
import Transition from "../../partials/Transition";
//import SingleWidgetForm from "../../forms/SingleWidgetForm";
import ProfileForm from "../../forms/ProfileForm";
//import { createProfile } from "../../../api/profiles/methods";
import * as ProfileMethods from "../../../api/profiles/methods";
//import * as AuthMethods from "../../../api/auth/methods";
import * as Library from "../../../modules/library";

import SignInForm from "../../forms/SignInForm";

interface IProps {
  history: any;
  enhancedAuth: boolean;
  signedIn: boolean;
  profile: any;
}

interface IState {}

class ProfileIndex extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    // this.state = {};

    //let objData = JSON.stringify(this.props);
    //console.log(`Register: objData: [${objData}]`);
  }

  handleChange(e) {}

  handleSubmit(fieldName) {
    console.log(`SUBMIT`, fieldName);
  }

  static propTypes = {
    enhancedAuth: PropTypes.bool,
    profile: PropTypes.object,
    history: ReactRouterPropTypes.history
  };

  componentDidUpdate() {}

  getLayout() {
    let layout: any;

    if (this.props.profile && this.props.profile.new) {
      layout = (
        <div>
          <h2>Create Profile</h2>
          <ProfileForm
            profileObj={this.props.profile}
            handleChange={this.handleChange}
            handleSubmit={this.handleSubmit}
          />
        </div>
      );
    } else if (this.props.profile) {
      layout = (
        <div>
          <h2>Profile</h2>
          <div>FIRST NAME: {this.props.profile.fname}</div>
        </div>
      );
    } else {
      layout = <div>Loading...</div>;
    }

    return (
      <div className="profile-details">
        
        {layout}
      </div>
    );
  }

  render() {
    let layout = this.getLayout();

    return <Transition>{layout}</Transition>;
  }
}

export default withRouter(
  withTracker(({ params }) => {
    //let ProfilesDataReady = Meteor.subscribe("profiles");
    return {};
  })(ProfileIndex)
);

/*

  <SingleWidgetForm
          handleChange={this.handleChange}
          handleSubmit={this.handleSubmit}
          name="fname"
          type="input"
          label="First Name"
          data={this.props.profile}
        />

        */
