import * as React from "react";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import * as dateFormat from "dateformat";
import Button from "@material-ui/core/Button";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import * as BlockUi from "react-block-ui";
import * as Validation from "../../../modules/validation";
import Widget from "../../forms/Widget";
import * as Library from "../../../modules/library";
import EditTags from "../components/EditTags";
import RenderImage from "../components/RenderImage";

const slugify = require("slugify");

const ReactQuill = require("react-quill");
/*
imageIDedit?: string;
imageIDnew?: string;
*/

interface IProps {
  settingsObj: PropTypes.object.isRequired;
  classes: PropTypes.object.isRequired;
  importedTags: PropTypes.object.isRequired;
  editingExistingData: boolean;
  dispatch: any;
  postUpdateMethod: PropTypes.object.isRequired;
  postCreateMethod: PropTypes.object.isRequired;
  handleNewPostCreated: PropTypes.object.isRequired;
  handlePostUpdated: PropTypes.object.isRequired;
  handleEditing: PropTypes.object.isRequired;
  editMode: string;
  hasTags: boolean;
  hasImage: boolean;
  imageUpdateMethod: PropTypes.object.isRequired;
  contentType: string;
}

interface IState {
  publish: boolean;
  tagObj: any[];
  tags: string;
  imageId: string;
  showImage: boolean;
  id: string;
  summary: string;
  slug: string;
  title: string;
  body: string;
  blockUI: boolean;
  type: boolean;
}

const styles = theme => ({
  adminPostsForm: {
    marginTop: "1rem",
    marginBottom: "1rem"
  },

  done: {
    color: "red",
    marginLeft: "1rem",
    verticalAlign: "middle"
  },

  rte: {
    backgroundColor: "white",
    marginBottom: "1rem"
  }
});

class PostForm extends React.Component<IProps, IState> {
  formID: string = "";
  rteID: string = "";

  //override: any = {};

  toolbarOptions = [
    [{ header: [1, 2, 3, 4, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["link", "image", "video"],
    ["clean"]
  ];
  modules = {
    toolbar: this.toolbarOptions
  };

  formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video"
  ];

  constructor(props) {
    super(props);

    const { settingsObj, editingExistingData } = props;

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.formID = editingExistingData ? `PostFormEdit_${settingsObj._id}` : `PostForm_New`;
    this.rteID = editingExistingData ? `rte_${settingsObj._id}` : "rte";

    this.state = {
      publish: settingsObj ? settingsObj.publish : false,
      tags: settingsObj ? settingsObj.tags : "",
      tagObj: [],
      id: settingsObj ? settingsObj._id : "",
      imageId: settingsObj ? settingsObj.image_id : "",
      showImage: settingsObj ? settingsObj.showImage : false,
      summary: settingsObj ? settingsObj.summary : "",
      slug: settingsObj ? settingsObj.slug : "",
      title: settingsObj ? settingsObj.title : "",
      body: settingsObj ? settingsObj.body : "",
      type: settingsObj ? settingsObj.type : "",
      blockUI: false
    };
  }

  componentDidMount() {
    const slugId = this.renderWidgetId("slug");
    let rules: any = {};
    rules[slugId] = { rangelength: [5, 60] };
    rules.title = { rangelength: [10, 90] };
    Validation.validate(this, rules);
  }

  componentDidUpdate() {}

  miniAlert = (message = "") => {
    this.props.dispatch({ type: "MINI_ALERT_ON", message: message });
  };

  updateTagList = tags => {
    this.setState({ tags: tags });
  };

  handleSubmit = () => {
    //log.info(`PostForm.handleSubmit()`, this.props);
    const {
      settingsObj,
      editingExistingData,
      postUpdateMethod,
      postCreateMethod,
      handleNewPostCreated,
      handlePostUpdated,
      handleEditing,
      contentType
    } = this.props;

    let pageFields: any;

    pageFields = {
      id: this.state.id,
      publish: this.state.publish,
      tags: this.state.tags,
      body: this.state.body,
      image_id: this.state.imageId,
      showImage: this.state.showImage,
      title: this.state.title,
      summary: this.state.summary,
      slug: this.state.slug
    };

    if (!editingExistingData) {
      pageFields.allowComments = false;
    } else {
      pageFields.closeComments = false;
    }

    if (contentType === "posts") {
      const type = this.state.type || "story";
      pageFields.type = type;
    }

    this.setState({ blockUI: true });
    if (editingExistingData) {
      Meteor.call(postUpdateMethod, pageFields, err => {
        this.setState({ blockUI: false });
        if (err) {
          Library.modalErrorAlert(err.reason);
          log.error(`${postUpdateMethod} failed`, err);
        } else {
          this.miniAlert(`Your post was updated.`);
          handleEditing(false, editingExistingData);
          handlePostUpdated();
        }
      });
    } else {
      Meteor.call(postCreateMethod, pageFields, err => {
        this.setState({ blockUI: false });
        if (err) {
          Library.modalErrorAlert(err.reason);
          log.error(`${postCreateMethod} failed`, err);
        } else {
          this.miniAlert(`A post was succesfully created.`);
          handleEditing(false, editingExistingData);
          handleNewPostCreated(pageFields);
        }
      });
    }
  };

  renderImage() {
    const { settingsObj } = this.props;
    return (
      <RenderImage
        allowEdit={true}
        updateMethod={this.props.imageUpdateMethod}
        updateImageId={this.updateImageId}
        toggleShowImage={this.toggleShowImage}
        showImage={this.state.showImage}
        dataObj={settingsObj}
        imageId={this.state.imageId}
      />
    );
  }

  updateImageId = (props: { imageId: string; newDataObject?: any }) => {
    this.setState({ imageId: props.imageId });
    if (!props.imageId) {
      this.setState({ showImage: false });
    }
  };

  handleChange = e => {
    const { handleEditing } = this.props;
    const { editingExistingData } = this.props;
    handleEditing(true, editingExistingData);

    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let name = this.renderWidgetName(target.id);
    if (name === "title" && !editingExistingData) {
      const now = new Date();
      const dateString = dateFormat(now, "yyyymmdd");
      const truncVal = value.substring(0, 50);
      const slugString = slugify(truncVal, { lower: true, remove: /[^A-Za-z0-9-\s]/g });
      const final = `${slugString}-${dateString}`;
      this.setState({ slug: final });
    }
    //log.info(`PostForm.handleCHange() value = [${value}]`, name);
    this.setState({ [name]: value });
  };

  updateBody = body => {
    this.setState({ body: body });
  };

  getWidget = (props: any) => {
    const { editMode } = this.props;
    let readOnly = props.readOnly || false;
    if (props.baseName === "slug" && editMode === "creator") {
      readOnly = true;
    }
    let widgetType = props.widgetType ? props.widgetType : "simple";
    return (
      <Widget
        widgetType={widgetType}
        handleChange={this.handleChange}
        dataObj={this.props.settingsObj}
        wProps={props}
        stateValue={this.state[props.baseName]}
        readOnly={readOnly}
      />
    );
  };

  nothing() {
    return null;
  }

  renderWidgetId(name) {
    let id = name;
    if (this.props.settingsObj) {
      id = `${name}__${this.props.settingsObj._id}`;
    }

    return id;
  }

  renderWidgetName(id) {
    let name = id;
    const arraySplit = id.split("__");
    return arraySplit[0];
  }

  togglePublish = () => {
    const currentState = this.state.publish;
    const newState = !currentState;
    this.setState({ publish: newState });
    return true;
  };

  toggleShowImage = () => {
    const currentState = this.state.showImage;
    const newState = !currentState;
    this.setState({ showImage: newState });
    return true;
  };

  render() {
    const { classes, settingsObj, hasTags, hasImage } = this.props;
    return (
      <div>
        <BlockUi tag="div" blocking={this.state.blockUI}>
          <form id={this.formID} className={classes.adminPostsForm}>
            {hasImage && this.renderImage()}

            <FormControlLabel
              control={<Switch disabled={false} onChange={this.togglePublish} checked={this.state.publish} />}
              label="Publish"
            />

            {this.getWidget({ baseName: "title", name: this.renderWidgetId("title"), label: "Title" })}

            <div className="form-group">
              <label htmlFor="bodyText">Body Text:</label>
              <ReactQuill
                className={`${this.props.classes.rte} novalidate`}
                id={this.renderWidgetId("bodyText")}
                defaultValue={settingsObj ? settingsObj.body : ""}
                onChange={this.updateBody}
                onFocusOut={this.nothing()}
                modules={this.modules}
                formats={this.formats}
                theme="snow"
              />

              {this.getWidget({
                placeholder: "Select 'Edit Tags' to add/remove tags",
                readOnly: true,
                required: false,
                baseName: "tags",
                name: this.renderWidgetId("tags"),
                label: "Tags"
              })}

              {hasTags && <EditTags updateTagList={this.updateTagList} preSelected={this.state.tags} />}

              {this.getWidget({
                placeholder: "URL identifier: filled automatically",
                baseName: "slug",
                name: this.renderWidgetId("slug"),
                label: "Slug"
              })}

              {this.getWidget({
                placeholder: "Will be displayed in previews on social media",
                required: false,
                baseName: "summary",
                name: this.renderWidgetId("summary"),
                label: "Summary",
                type: "textarea"
              })}
            </div>

            <div className="form-group">
              <Button variant="raised" type="submit" color="primary">
                Save
              </Button>
            </div>
          </form>
        </BlockUi>
      </div>
    );
  }
}

//export default connect()(withStyles(styles, { withTheme: true })(PostForm));

export default connect()(
  withTracker(props => {
    return {};
  })(withStyles(styles, { withTheme: true })(PostForm))
);
