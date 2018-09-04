import * as React from "react";
import { Accounts } from "meteor/accounts-base";
import * as dateFormat from "dateformat";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import ProfileForm from "../../forms/ProfileForm";
import { EditIcon, CancelEditIcon } from "../../../modules/icons";
import * as ProfileMethods from "../../../api/profiles/methods";
import { toggleAuthEnabledPending as toggle2FA } from "../../../api/settings/methods";
import { purgeAllOtherSessions } from "../../../api/sessions/methods";
import * as User from "../../../modules/user";
import * as Library from "../../../modules/library";
import UploadForm from "../../forms/UploadForm";
import Image from "../../partials/Image";
import Notification from "../../partials/Notification";
import { AvatarImages } from "../../../api/images/methods";

let styles: any;
styles = theme => ({
  heading: {
    marginBottom: "2rem"
  },
  personalDetails: {
    width: "auto"
  },
  fbButtons: {
    margin: "1rem"
  }
});

interface IProps {
  classes: PropTypes.object.isRequired;
  profile: PropTypes.object.isRequired;
  avatarImage: PropTypes.object.isRequired;
  userSettings: PropTypes.object.isRequired;
  emailVerified: boolean;
  enhancedAuth: boolean;
  userId: string;
  dispatch: any;
}

interface IState {}

class Settings extends React.Component<IProps, IState> {
  fieldsArray = [
    "fname",
    "initial",
    "lname",
    "screenName",
    "about",
    "dob",
    "street1",
    "street2",
    "city",
    "region",
    "postcode",
    "country"
  ];

  state: any;

  constructor(props) {
    super(props);

    let mapped: any;
    mapped = this.fieldMapper("init");
    this.state = mapped;
  }

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

  doToggle2FA = () => {
    log.info(`Settings.doToggle2FA()`);
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
        console.log(`toggle2FA error`, err);
      }
    });
  };

  fieldMapper(type, props = "") {
    let obj = {};
    if (type === "init") {
      this.fieldsArray.forEach(element => (obj[element] = ""));
      obj["editProfile"] = false;
      obj["editImage"] = false;
      obj["disableVerify"] = false;
      obj["allowSubmit"] = true;
      obj["processing2FArequest"] = false;
    } else if (type === "props") {
      this.fieldsArray.forEach(element => (obj[element] = props[element]));
    } else if (type === "method") {
      this.fieldsArray.forEach(element => (obj[element] = this.state[element]));
      obj["id"] = this.props.profile._id;
    }
    return obj;
  }

  handleSetState = (sVar, sVal) => {
    this.setState({ [sVar]: sVal });
  };

  handleChange = e => {
    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let id = target.id;
    this.setState({ [id]: value });
  };

  initState(props) {
    let obj = this.fieldMapper("props", props);
    this.setState(obj);
  }

  handleSubmit = () => {
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
  };

  setEditor(state) {
    this.setState({ editProfile: state });
  }

  sendVerificationEmail = () => {
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
  };

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
    const { classes } = this.props;
    if (!iProps.method) {
      iProps.method = "push";
    }
    if (!iProps.eClass) {
      iProps.eClass = "list-group-item";
    }
    let layout = [];
    let content = "";
    let CustomTag: string;
    let customClass = "";
    if (iProps.eClass === "card-header") {
      CustomTag = "div";
      customClass = "cardHeader";
    } else {
      CustomTag = "li";
    }
    //let CustomTag = iProps.eClass === "card-header" ? "div" : "li";

    let key: number = 0;
    let label = iProps.label ? <strong>{iProps.label}: </strong> : "";

    iProps.items.forEach(
      function iterateItem(item) {
        if (this.props.profile[item]) {
          if (iProps.method === "push") {
            // const CustomTag = el;
            layout.push(
              <CustomTag key={key} className={`${iProps.eClass} ${classes[customClass]}`}>
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
      // const CustomTag = el;
      layout.push(
        <CustomTag key={key} className={`${iProps.eClass} ${classes[customClass]}`}>
          {label}
          {content.trim()}
        </CustomTag>
      );
    }
    return layout;
  }

  format(value, type) {
    if (type === "date") {
      return dateFormat(value, "dd mmmm yyyy");
    } else {
      return value;
    }
  }

  getNotifications() {
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
            mainFunction={this.doToggle2FA}
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

  renderImage() {
    const { profile, avatarImage } = this.props;
    const avatarImageArray = avatarImage ? [avatarImage] : [];
    let layout: any;
    if (profile) {
      if (this.state.editImage) {
        layout = (
          <div>
            <h2>
              Upload Image{" "}
              <CancelEditIcon className="cancel-edit-icon" onClick={this.handleSetState} stateName="editImage" />
            </h2>
            <UploadForm
              Images={AvatarImages}
              fileLocator=""
              loading={false}
              imageArray={avatarImageArray}
              dataObj={profile}
              updateMethod="profileImage.update"
              updateDirect={true}
              allowEdit={true}
            />
          </div>
        );
      } else if (avatarImage) {
        const link = AvatarImages.link(avatarImage);

        layout = (
          <div className="profile-image-holder">
            <h2>
              Avatar Image <EditIcon onClick={this.handleSetState} stateName="editImage" />
            </h2>
            <Image
              fileName={avatarImage.name}
              fileUrl={link}
              fileId={avatarImage._id}
              fileSize={avatarImage.size}
              Images={AvatarImages}
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

  doFeedDialog() {
    _FB_feedDialog();
  }

  ogShare() {
    _FB_ogShare();
  }

  fbShare() {
    _FB_share();
  }

  settings() {
    const { profile, classes } = this.props;
    let layout: any = "";
    if (profile && this.state.editProfile) {
      layout = this.getForm("Edit Profile");
    } else if (profile && this.props.profile.new) {
      layout = this.getForm("Create Profile");
    } else if (profile) {
      layout = (
        <div>
          <h1 className={classes.heading}>{profile.screenName}</h1>
          <div className={classes.fbButtons}>
            <Button onClick={this.doFeedDialog} variant="contained">Feed</Button> <Button onClick={this.ogShare} variant="contained">ogShare</Button> <Button onClick={this.fbShare} variant="contained">fbShare</Button>
          </div>
          {this.getNotifications()}

          {this.renderImage()}
          <h2>
            Personal Details <EditIcon onClick={this.handleSetState} stateName="editProfile" />
          </h2>

          <div className={`card ${classes.personalDetails}`}>
            {this.getItems({
              items: ["fname", "initial", "lname"],
              eClass: "card-header",
              method: "concat"
            })}
            <ul className="list-group list-group-flush">
              {this.getItems({ label: "Screen Name", items: ["screenName"] })}
              {this.getItems({ label: "About Me", items: ["about"] })}
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
    }
    return <div className="profile-details">{layout}</div>;
  }

  /*
  facebookLogin() {
    const { classes } = this.props;
    return (
      <div className={classes.FBLogin}>
        <FBLogin />
      </div>
    );
  }
  */

  render() {
    const { profile } = this.props;
    return User.can({ threshold: "owner", owner: profile.owner }) ? this.settings() : <div>Not Authorised.</div>;
  }
}

export default connect()(
  withTracker(props => {
    const profilesHandle = Meteor.subscribe("profiles");
    return {};
  })(withStyles(styles, { withTheme: true })(Settings))
);
