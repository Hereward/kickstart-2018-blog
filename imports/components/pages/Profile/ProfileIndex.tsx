///<reference path="../../../../index.d.ts"/>

import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import * as dateFormat from "dateformat";
import Transition from "../../partials/Transition";
import ProfileForm from "../../forms/ProfileForm";
import * as ProfileMethods from "../../../api/profiles/methods";
import * as Library from "../../../modules/library";
import { EditIcon, CancelEditIcon } from "../../../modules/icons";
import UploadForm from "../../forms/UploadForm";
import { ProfileImages } from "../../../api/images/methods";
import { deleteAllUsers } from "../../../api/admin/methods";
import Image from "../../partials/Image";
import Notification from "../../partials/Notification";
import { toggleAuthEnabledPending as toggle2FA } from "../../../api/settings/methods";
import { purgeAllOtherSessions } from "../../../api/sessions/methods";
import * as User from "../../../modules/user";
import Spinner from "../../partials/Spinner";

interface IProps {
  history: any;
  enhancedAuth: boolean;
  signedIn: boolean;
  profile: any;
  myImages: any;
  userData: any;
  userSettings: any;
  userEmail: string;
  emailVerified: boolean;
  userId: string;
}

interface IState {
  [x: number]: any;
  editImage: boolean;
  editProfile: boolean;
  disableVerify: boolean;
  allowSubmit: boolean;
  disableSubmitDeleteAllUsers: boolean;
  DeleteAllUsersDone: boolean;
  processing2FArequest: boolean;
}

class Profile extends React.Component<IProps, IState> {
  fieldsArray = ["fname", "initial", "lname", "dob", "street1", "street2", "city", "region", "postcode", "country"];

  state: any;

  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSetState = this.handleSetState.bind(this);
    this.handleDeleteAllUsers = this.handleDeleteAllUsers.bind(this);
    this.sendVerificationEmail = this.sendVerificationEmail.bind(this);
    this.Toggle2FA = this.Toggle2FA.bind(this);
    let mapped: any;
    mapped = this.fieldMapper("init");
    this.state = mapped;
  }

  fieldMapper(type, props = "") {
    let obj = {};
    if (type === "init") {
      this.fieldsArray.forEach(element => (obj[element] = ""));
      obj["editProfile"] = false;
      obj["editImage"] = false;
      obj["disableVerify"] = false;
      obj["allowSubmit"] = true;
      obj["DeleteAllUsersDone"] = false;
      obj["disableSubmitDeleteAllUsers"] = false;
      obj["processing2FArequest"] = false;
    } else if (type === "props") {
      this.fieldsArray.forEach(element => (obj[element] = props[element]));
    } else if (type === "method") {
      this.fieldsArray.forEach(element => (obj[element] = this.state[element]));
      obj["id"] = this.props.profile._id;
    }
    return obj;
  }

  handleSetState(sVar, sVal) {
    this.setState({ [sVar]: sVal });
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let id = target.id;
    this.setState({ [id]: value });
  }

  initState(props) {
    let obj = this.fieldMapper("props", props);
    this.setState(obj);
  }

  handleSubmit() {
    this.setState({ allowSubmit: false });
    let profileFields = this.fieldMapper("method");

    ProfileMethods.updateProfile.call(profileFields, err => {
      this.setState({ allowSubmit: true });
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`ProfileMethods.updateProfile failed`, err);
      } else {
        this.setEditor(false);
      }
    });
  }

  handleDeleteAllUsers() {
    console.log(`handleDeleteAllUsers`);
    this.setState({ disableSubmitDeleteAllUsers: true });
    this.setState({ DeleteAllUsersDone: false });
    deleteAllUsers.call({}, err => {
      this.setState({ disableSubmitDeleteAllUsers: false });
      this.setState({ DeleteAllUsersDone: true });

      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`deleteAllUsers failed`, err);
      } else {
        Library.modalSuccessAlert({
          message: "All non-admin users were deleted!"
        });
      }
    });
  }

  sendVerificationEmail() {
    let id = this.props.userId;
    this.setState({ disableVerify: true });

    ProfileMethods.sendVerificationEmail.call({ id: id }, (err, res) => {
      this.setState({ disableVerify: false });
      if (err) {
        Library.modalErrorAlert("Please check your internet connection.");
        console.log(`sendVerificationEmail error`, err);
      } else {
        Library.modalSuccessAlert({
          message:
            "A verification email has been sent to your nominated email account. Please check your email and click on the verification link."
        });
      }
    });
  }

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
          allowSubmit={this.state.allowSubmit}
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

  Toggle2FA() {
    this.setState({ processing2FArequest: true });
    Accounts.logoutOtherClients();
    let token = User.sessionToken("get");
    purgeAllOtherSessions.call({ sessionToken: token }, (err, res) => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`purgeAllOtherSessions error`, err);
      }
    });

    toggle2FA.call({}, (err, res) => {
      if (err) {
        this.setState({ processing2FArequest: false });
        Library.modalErrorAlert(err.reason);
        console.log(`Toggle2FA error`, err);
      }
    });
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
              Images={ProfileImages}
              fileLocator=""
              loading={false}
              imageArray={this.props.myImages}
              dataObj={this.props.profile}
              updateMethod="profileImage.update"
              updateDirect={true}
            />
          </div>
        );
      } else if (this.props.myImages && this.props.myImages[0]) {
        let fileCursor = this.props.myImages[0];
        let link = ProfileImages.findOne({ _id: fileCursor._id }).link();

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
              Images={ProfileImages}
              allowEdit={false}
              dataObj={this.props.profile}
              updateMethod="profileImage.update"
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
      layout = <Spinner caption="loading" type="component" />;
    }
    return <div className="profile-details">{layout}</div>;
  }

  getNotifications() {
    log.info(`getNotifications`, this.props.emailVerified, this.props.enhancedAuth);
    let layout = (
      <div className="notifications">
        {this.props.emailVerified === false ? (
          <Notification
            mainFunction={this.sendVerificationEmail}
            panel="action"
            type="verifyEmail"
            parentProps={this.props}
            processingRequest={this.state.disableVerify}
          />
        ) : null}

        {this.props.emailVerified === true && this.props.enhancedAuth ? (
          <Notification
            userSettings={this.props.userSettings}
            mainFunction={this.Toggle2FA}
            panel="action"
            type="auth"
            parentProps={this.props}
            processingRequest={this.state.processing2FArequest}
          />
        ) : null}
      </div>
    );
    return layout;
  }

  render() {
    let layout = this.getLayout();
    return (
      <Transition>
        <div className="container page-content">
          {this.getNotifications()}
          {layout}
        </div>
      </Transition>
    );
  }
}

export default withTracker(props => {
  let myImages: any;
  let ImagesDataReady = Meteor.subscribe("profileImages");
  let userEmail: string;
  let emailVerified: boolean = false;

  if (props.userData) {
    emailVerified = props.userData.emails[0].verified;
    userEmail = props.userData.emails[0].address;
  }

  if (ImagesDataReady) {
    if (props.profile) {
      let cursor: any = ProfileImages.find({ _id: props.profile.image_id });
      myImages = cursor.fetch();
    }
  }
  return {
    myImages: myImages,
    userEmail: userEmail,
    emailVerified: emailVerified
  };
})(Profile);
