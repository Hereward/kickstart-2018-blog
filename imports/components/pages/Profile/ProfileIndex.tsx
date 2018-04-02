import { Meteor } from "meteor/meteor";
import * as React from "react";
import * as PropTypes from "prop-types";
import { Accounts } from "meteor/accounts-base";
import ReactRouterPropTypes from "react-router-prop-types";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import IconButton from "material-ui/IconButton";
import EditorModeEdit from "material-ui/svg-icons/editor/mode-edit";
import * as dateFormat from "dateformat";
import { Alert, Button } from "reactstrap";
import Transition from "../../partials/Transition";
import ProfileForm from "../../forms/ProfileForm";
import * as ProfileMethods from "../../../api/profiles/methods";
import * as Library from "../../../modules/library";
import { EditIcon, CancelEditIcon } from "../../../modules/icons";

import UploadForm from "../../forms/UploadForm";
import { Images } from "../../../api/images/methods";
import Image from "../../partials/Image";

import SignInForm from "../../forms/SignInForm";
import * as User from "../../../modules/user";

interface IProps {
  history: any;
  enhancedAuth: boolean;
  signedIn: boolean;
  profile: any;
  myImages: any;
}

interface IState {
  editImage: boolean;
  editProfile: boolean;
  disableVerify: boolean;
}

class Profile extends React.Component<IProps, IState> {
  fieldsArray = ["fname", "initial", "lname", "dob", "street1", "street2", "city", "region", "postcode", "country"];

  state: any;

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSetState = this.handleSetState.bind(this);
    this.sendVerificationEmail = this.sendVerificationEmail.bind(this);
    let mapped: any;
    mapped = this.fieldMapper("init");
    this.state = mapped;
    //this.state = this.fieldMapper("init") as any;
  }

  fieldMapper(type, props = "") {
    let obj = {};
    if (type === "init") {
      this.fieldsArray.forEach(element => (obj[element] = ""));
      obj["editProfile"] = false;
      obj["editImage"] = false;
      obj["disableVerify"] = false;
    } else if (type === "props") {
      this.fieldsArray.forEach(element => (obj[element] = props[element]));
    } else if (type === "method") {
      this.fieldsArray.forEach(element => (obj[element] = this.state[element]));
      obj["id"] = this.props.profile._id;
    }
    return obj;
  }

  handleSetState(sVar, sVal) {
    console.log(`handleSetState (Profile index)`, sVar, sVal);
    this.setState({ [sVar]: sVal });
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let id = target.id;
    console.log(`Profile HandleChange`, value, id);
    this.setState({ [id]: value });
  }

  initState(props) {
    let obj = this.fieldMapper("props", props);
    this.setState(obj);
  }

  handleSubmit() {
    let profileFields = this.fieldMapper("method");

    ProfileMethods.updateProfile.call(profileFields, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`ProfileMethods.updateProfile failed`, err);
      } else {
        this.setEditor(false);
      }
    });
  }

  sendVerificationEmail() {
    let id = User.id();
    this.setState({ disableVerify: true });
    console.log(`sendVerificationEmail NOW`, id);

    ProfileMethods.sendVerificationEmail.call({ id: id }, (err, res) => {
      //console.log("sendVerificationEmail.call", authFields);
      if (err) {
        Library.modalErrorAlert(err.reason);
        this.setState({ disableVerify: false });
        console.log(`sendVerificationEmail error`, err);
      } else {
        Library.modalSuccessAlert({
          message:
            "A verification email has been sent to your nominated email account. Please check your email and click on the verification link."
        });
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

  format(value, type) {
    if (type === "date") {
      return dateFormat(value, "dd mmmm yyyy");
    } else {
      return value;
    }
  }

  getForm(heading: string) {
    let layout = (
      <div>
        <h2>
          {heading}{" "}
          <CancelEditIcon className="cancel-edit-icon" onClick={this.handleSetState} stateName="editProfile" />
        </h2>
        <ProfileForm
          profileObj={this.props.profile}
          handleChange={this.handleChange}
          handleSubmit={this.handleSubmit}
          handleSetState={this.handleSetState}
        />
      </div>
    );
    return layout;
  }

  getItems(iProps: { items: any[]; label?: string; method?: string; eClass?: string; format?: string }) {
    if (!iProps.method) {
      iProps.method = "push";
    }
    if (!iProps.eClass) {
      iProps.eClass = "list-group-item";
    }
    let layout = [];
    let content = "";
    let el = iProps.eClass === "card-header" ? "div" : "li";
    let key: number = 0;
    let label = iProps.label ? <span>{iProps.label}: </span> : "";

    iProps.items.forEach(
      function iterateItem(item) {
        if (this.props.profile[item]) {
          if (iProps.method === "push") {
            const CustomTag = el;
            layout.push(
              <CustomTag key={key} className={iProps.eClass}>
                {label}
                {this.format(this.props.profile[item].trim(), iProps.format)}
              </CustomTag>
            );
            key++;
          } else if (iProps.method === "concat") {
            content += `${this.props.profile[item]} `;
          }
        }
      }.bind(this)
    );
    if (iProps.method === "concat") {
      const CustomTag = el;
      layout.push(
        <CustomTag key={key} className={iProps.eClass}>
          {label}
          {content.trim()}
        </CustomTag>
      );
    }
    return layout;
  }

  renderNotification() {
    let layout: any;
    layout = "";

    if (User.data()) {
      let verified = User.data().emails[0].verified;
      if (!verified) {
        layout = (
          <Alert color="warning">
            <strong>WARNING!</strong> Your email address is not verified. <hr />{" "}
            <Button disabled={this.state.disableVerify} onClick={this.sendVerificationEmail} size="sm" color="primary">
              Verify Now
            </Button>
          </Alert>
        );
      }
    }

    return layout;
  }

  renderImage() {
    let layout: any;
    if (this.props.profile) {
      if (this.state.editImage) {
        layout = (
          <div>
            <h2>
              Upload Image{" "}
              <CancelEditIcon className="cancel-edit-icon" onClick={this.handleSetState} stateName="editImage" />
            </h2>
            <UploadForm
              Images={Images}
              fileLocator=""
              loading={false}
              myImages={this.props.myImages}
              profile={this.props.profile}
            />
          </div>
        );
      } else if (this.props.myImages && this.props.myImages[0]) {
        let fileCursor = this.props.myImages[0];
        let link = Images.findOne({ _id: fileCursor._id }).link();

        layout = (
          <div className="profile-image-holder">
            <h2>
              Image <EditIcon onClick={this.handleSetState} stateName="editImage" />
            </h2>
            <Image
              fileName={fileCursor.name}
              fileUrl={link}
              fileId={fileCursor._id}
              fileSize={fileCursor.size}
              Images={Images}
              allowEdit={false}
              profile={this.props.profile}
            />
          </div>
        );
      } else {
        layout = (
          <div className="profile-image-holder">
            <h2>
              Image <EditIcon onClick={this.handleSetState} stateName="editImage" />
            </h2>
          </div>
        );
      }
    }

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
          <h1>Profile</h1>
          {this.renderImage()}
          <h2>
            Personal Details <EditIcon onClick={this.handleSetState} stateName="editProfile" />
          </h2>

          <div className="card" style={{ width: "18rem" }}>
            {this.getItems({
              items: ["fname", "initial", "lname"],
              eClass: "card-header",
              method: "concat"
            })}
            <ul className="list-group list-group-flush">
              {this.getItems({ label: "DOB", items: ["dob"], format: "date" })}
              {this.getItems({ items: ["street1", "street2"] })}
              {this.getItems({ items: ["city"] })}
              {this.getItems({
                items: ["region", "postcode"],
                method: "concat"
              })}
              {this.getItems({ items: ["country"] })}
            </ul>
          </div>
        </div>
      );
    } else {
      layout = <div>Loading...</div>;
    }
    return <div className="profile-details">{layout}</div>;
  }

  render() {
    let layout = this.getLayout();
    return (
      <Transition>
        <div className="container page-content">
          {this.renderNotification()}
          {layout}
        </div>
      </Transition>
    );
  }
}

export default withRouter(
  withTracker(props => {
    let myImages: any;
    let ImagesDataReady = Meteor.subscribe("allImages");
    if (ImagesDataReady) {
      if (props.profile) {
        myImages = Images.find({ _id: props.profile.image_id }).fetch();
        console.log(`PROFILE LOAD`, props);
      }
    }
    return { myImages };
  })(Profile)
);
