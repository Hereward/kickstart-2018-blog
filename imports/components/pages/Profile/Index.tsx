import { Meteor } from "meteor/meteor";
import * as React from "react";
import * as PropTypes from "prop-types";
import { Accounts } from "meteor/accounts-base";
import ReactRouterPropTypes from "react-router-prop-types";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import IconButton from "material-ui/IconButton";
import EditorModeEdit from "material-ui/svg-icons/editor/mode-edit";
import Transition from "../../partials/Transition";
import ProfileForm from "../../forms/ProfileForm";
import * as ProfileMethods from "../../../api/profiles/methods";
import * as Library from "../../../modules/library";

import UploadForm from "../../forms/UploadForm";
import { Images } from "../../../api/images/methods";
import Image from "../../partials/Image";

import SignInForm from "../../forms/SignInForm";

interface IProps {
  history: any;
  enhancedAuth: boolean;
  signedIn: boolean;
  profile: any;
  myImages: any;
}

interface IState {}

class ProfileIndex extends React.Component<IProps> {
  fieldsArray = [
    "fname",
    "initial",
    "lname",
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
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSetState = this.handleSetState.bind(this);
    //this.updateProfileImage = this.updateProfileImage.bind(this);
    //let fieldsObj = this.fieldMapper("init");
    //let stateObj = Object.assign({}, fieldsObj, { editImage: false });

    this.state = this.fieldMapper("init"); //this.fieldsToObject();
    console.log(`ProfileIndex constructor`, this.state, this.props);
    //let obj = Object.assign({}, this.fieldsObj, { editProfile: false });
  }

  fieldMapper(type, props = "") {
    let obj = {};
    if (type === "init") {
      this.fieldsArray.forEach(element => (obj[element] = ""));
      obj["editProfile"] = false;
      obj["editImage"] = false;
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
    let obj = this.fieldMapper("props", props); //this.fieldsToProps(props);
    this.setState(obj);
  }

  /*
  updateProfileImage(imageID) {
    let profileFields = { id: this.props.profile._id, image_id: imageID };

    ProfileMethods.updateProfileImage.call(profileFields, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`ProfileMethods.updateProfileImage failed`, err);
      } else {
        //this.setEditor(false);
      }
    });

  }
  */

  handleSubmit() {
    let profileFields = this.fieldMapper("method"); //this.fieldsToMethod();

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
          handleSetState={this.handleSetState}
        />
      </div>
    );
    return layout;
  }

  getItems(iProps: {
    items: any[];
    label?: string;
    method?: string;
    eClass?: string;
  }) {
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
    let label = iProps.label ? `${iProps.label} ` : "";

    iProps.items.forEach(
      function iterateItem(item) {
        if (this.props.profile[item]) {
          if (iProps.method === "push") {
            const CustomTag = el;
            layout.push(
              <CustomTag key={key} className={iProps.eClass}>
                {label}
                {this.props.profile[item].trim()}
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

  // <UploadForm {...this.props} />

  renderImage() {
    let layout: any;
    if (this.props.profile) {
      if (this.state.editImage) {
        layout = (
          <UploadForm
            Images={Images}
            fileLocator=""
            loading={false}
            myImages={this.props.myImages}
            profile={this.props.profile}
          />
        );
      } else if (this.props.myImages && this.props.myImages[0]) {
        let fileCursor = this.props.myImages[0];
        console.log(`renderImage`, fileCursor, this.props.myImages);
        let link = Images.findOne({ _id: fileCursor._id }).link();

        layout = (
          <Image
            fileName={fileCursor.name}
            fileUrl={link}
            fileId={fileCursor._id}
            fileSize={fileCursor.size}
            Images={Images}
            allowEdit={false}
            profile={this.props.profile}
          />
        );
      }
    }

    return layout;
  }

  iconEdit(type = "editProfile") {
    return (
      <IconButton
        type="button"
        tooltip="Edit"
        onClick={() => {
          this.setState({ [type]: true });
        }}
      >
        <EditorModeEdit />
      </IconButton>
    );
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

          <h3>Image {this.iconEdit("editImage")}</h3>
          {this.renderImage()}

          <h3> Personal Details {this.iconEdit()}</h3>

          <div className="card" style={{ width: "18rem" }}>
            {this.getItems({
              items: ["fname", "initial", "lname"],
              eClass: "card-header",
              method: "concat"
            })}
            <ul className="list-group list-group-flush">
              {this.getItems({ items: ["street1", "street2"] })}
              {this.getItems({ items: ["city"] })}
              {this.getItems({ label: "Date of Birth", items: ["dob"] })}
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
    return <Transition>{layout}</Transition>;
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
  })(ProfileIndex)
);

/*
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
*/

/* {
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
    */

//console.log(`Profile initState`, obj, this.state);
/*
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
    */

/*
  customTagItem(key, el, cl, it) {
    const CustomTag = el;
    let layout = <CustomTag key={key} className={cl}>{it.trim()}</CustomTag>;
    return layout;
  }
  */

//      <li className={iProps.eClass}>{this.props.profile[item]}</li>
// layout.push(<li className={iProps.eClass}>{content.trim()}</li>);

/*
  getItemsz(items: any[], method:string='push', eClass:string='list-group-item') {
    //let layout = <div>hello</div>;

    
    let layout = [];
    let content = '';
    items.forEach(function iterateItem(item) {
      if (this.props.profile[item]) {
        if (method === 'push') {
          layout.push(<li className='list-group-item'>{this.props.profile[item]}</li>);
        } else if  (method === 'concat') {
          content += `${this.props.profile[item]} `;
        }
      }
    }.bind(this));

    if (eClass === 'card-header') {
      layout.push(<div className={eClass}>{content.trim()}</div>);
    } else if (method === 'concat') {
      layout.push(<li className={eClass}>{content.trim()}</li>);
    }
    

    //console.log(`getItem`, item, this.props.profile[item]);
    //layout.push((this.props.profile[item]) ?
    //<li className='list-group-item'>{this.props.profile[item]}</li> : '');
    return layout;
  }
  */

/*
         {this.getItems(['street1','street2'])}
              {this.getItems(['city'])}
              {this.getItems(['region','postcode'], 'concat')}
              {this.getItems(['country'])}
 */

/*
  {this.getItem('street2')}
              {this.getItem('city')}
              {this.getItem('region')}
              {this.getItem('postcode')}
              {this.getItem('country')}
              */

/*

  <SingleWidgetForm
          handleChange={this.handleChange}
          handleSubmit={this.handleSubmit}
          name='fname'
          type='input'
          label='First Name'
          data={this.props.profile}
        />

        */
