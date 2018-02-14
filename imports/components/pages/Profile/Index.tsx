import { Meteor } from "meteor/meteor";
//import { Session } from 'meteor/session';
import * as React from "react";
import * as PropTypes from "prop-types";
import { Accounts } from "meteor/accounts-base";
import ReactRouterPropTypes from "react-router-prop-types";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import IconButton from "material-ui/IconButton";
import EditorModeEdit from "material-ui/svg-icons/editor/mode-edit";
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

interface IState {
  fname: string;
  initial: string;
  lname: string;
  street1: string;
  street2: string;
  city: string;
  region: string;
  postcode: string;
  country: string;
  editProfile: boolean;
}

class ProfileIndex extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    //this.setEditor = this.setEditor.bind(this);
    this.state = {
      fname: "",
      initial: "",
      lname: "",
      street1: "",
      street2: "",
      city: "",
      region: "",
      postcode: "",
      country: "",
      editProfile: false
    };

    //let objData = JSON.stringify(this.props);
    console.log(`ProfileIndex constructor`, this.state, this.props);
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let id = target.id;
    console.log(`Profile HandleChange`, value, id);
    this.setState({ [id]: value });
  }

  initState(props) {
    console.log(`Profile initState `);
    this.setState({
      fname: props.fname,
      initial: props.initial,
      lname: props.lname,
      street1: props.street1,
      street2: props.street2,
      city: props.city,
      region: props.region,
      postcode: props.postcode,
      country: props.country
    });
  }

  handleSubmit() {
    console.log(`Profile SUBMIT`);
    let profileFields = {
      id: this.props.profile._id,
      fname: this.state.fname,
      initial: this.state.initial,
      lname: this.state.lname,
      street1: this.state.street1,
      street2: this.state.street2,
      city: this.state.city,
      region: this.state.region,
      postcode: this.state.postcode,
      country: this.state.country
    };

    ProfileMethods.updateProfile.call(profileFields, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`ProfileMethods.updateProfile failed`, err);
      } else {
        this.setEditor(false);
      }
    });
  }

  static propTypes = {
    enhancedAuth: PropTypes.bool,
    profile: PropTypes.object,
    history: ReactRouterPropTypes.history
  };

  componentDidUpdate() {}

  componentDidMount() {
    if (this.props.profile) {
      this.initState(this.props.profile);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.profile !== this.props.profile) {
        this.initState(nextProps.profile);
    }
  }

  setEditor(state) {
    console.log(`setEditor`, state);
    this.setState({ editProfile: state });
  }

  getForm(heading: string) {
    let layout = (
      <div>
        <h2>{heading}</h2>
        <ProfileForm
          profileObj={this.props.profile}
          handleChange={this.handleChange}
          handleSubmit={this.handleSubmit}
        />
      </div>
    );
    return layout;
  }

  getLayout() {
    let layout: any;
    if (this.props.profile && this.state.editProfile) {
      layout = this.getForm("Edit Profile");
    } else if (this.props.profile && this.props.profile.new) {
      layout = this.getForm("Create Profile");
    } else if (this.props.profile) {
      layout = (
        <div>
          <h2>
            Profile
            <IconButton
              type="button"
              tooltip="Edit"
              onClick={() => this.setEditor(true)}
            >
              <EditorModeEdit />
            </IconButton>
          </h2>
          <div>FIRST NAME: {this.props.profile.fname}</div>
        </div>
      );
    } else {
      layout = <div>Loading...</div>;
    }
    return <div className="profile-details">{layout}</div>;
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
