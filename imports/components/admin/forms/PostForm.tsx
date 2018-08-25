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

const slugify = require("slugify");

const ReactQuill = require("react-quill");

interface IProps {
  settingsObj: PropTypes.object.isRequired;
  classes: PropTypes.object.isRequired;
  importedTags: PropTypes.object.isRequired;
  editingExistingData: boolean;
  imageIDedit?: string;
  imageIDnew?: string;
  dispatch: any;
  postUpdateMethod: PropTypes.object.isRequired;
  postCreateMethod: PropTypes.object.isRequired;
  handleNewPostCreated: PropTypes.object.isRequired;
  handlePostUpdated: PropTypes.object.isRequired;
  handleEditing: PropTypes.object.isRequired;
  editMode: string;
}

interface IState {
  publish: boolean;
  tagObj: any[];
  tags: string;
  id: string;
  summary: string;
  slug: string;
  title: string;
  body: string;
  blockUI: boolean;
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
    backgroundColor: "white"
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

    const { settingsObj } = this.props;
    const { editingExistingData } = this.props;

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.formID = editingExistingData ? `PostFormEdit_${settingsObj._id}` : `PostForm_New`;
    this.rteID = editingExistingData ? `rte_${settingsObj._id}` : "rte";

    this.state = {
      publish: settingsObj ? settingsObj.publish : false,
      tags: settingsObj ? settingsObj.tags : "",
      tagObj: [],
      id: settingsObj ? settingsObj._id : "",
      summary: settingsObj ? settingsObj.summary : "",
      slug: settingsObj ? settingsObj.slug : "",
      title: settingsObj ? settingsObj.title : "",
      body: settingsObj ? settingsObj.body : "",
      blockUI: false
    };
  }

  componentDidMount() {
    const slugId = this.renderWidgetId("slug");
    let rules: any = {};
    rules[slugId] = { rangelength: [5, 60] };
    Validation.validate(this, rules);
  }

  componentDidUpdate() {}

  miniAlert = (message = "") => {
    this.props.dispatch({ type: "MINI_ALERT_ON", message: message });
  };

  handleSubmit = () => {
    //log.info(`PostForm.handleSubmit()`, this.props);
    const {
      settingsObj,
      imageIDedit,
      imageIDnew,
      editingExistingData,
      postUpdateMethod,
      postCreateMethod,
      handleNewPostCreated,
      handlePostUpdated,
      handleEditing
    } = this.props;

    const image_id_current = editingExistingData ? imageIDedit : imageIDnew;

    const settingsImage = settingsObj ? settingsObj.image_id : "";
    let pageFields: any;

    pageFields = {
      id: this.state.id,
      publish: this.state.publish,
      tags: this.state.tags,
      body: this.state.body,
      image_id: image_id_current || settingsImage,
      title: this.state.title,
      summary: this.state.summary,
      slug: this.state.slug
    };

    if (!editingExistingData) {
      pageFields.allowComments = false;
    } else {
      pageFields.closeComments = false;
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

    this.setState({ [name]: value }); // set the value of the target field
  };

  updateBody = body => {
    this.setState({ body: body });
  };

  getWidget = (props: any) => {
    const { editMode } = this.props;
    const readOnly = editMode === "creator" && props.baseName === "slug";
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

  /*
  getSlug = () => {
    let resolvedname = this.renderWidgetId("slug");
    //const currentSlug = this.state.slug;

    const layout = (
      <div className="form-group">
        <label htmlFor={resolvedname}>Slug:</label>
        <input
          onChange={this.handleChange}
          type="text"
          className="form-control tooltipster required"
          id={resolvedname}
          name={resolvedname}
          placeholder=""
          value={this.state.slug || (this.props.settingsObj ? this.props.settingsObj[resolvedname] : "")}
        />
      </div>
    );
    return layout;
  };
  */

  togglePublish = () => {
    const currentState = this.state.publish;
    const newState = !currentState;
    this.setState({ publish: newState });
    return true;
  };

  render() {
    const { classes, settingsObj } = this.props;
    return (
      <div>
        <BlockUi tag="div" blocking={this.state.blockUI}>
          <form id={this.formID} className={classes.adminPostsForm}>
            <div className="form-group">
              <FormControlLabel
                control={<Switch disabled={false} onChange={this.togglePublish} checked={this.state.publish} />}
                label="Publish"
              />
            </div>
            {this.getWidget({ baseName: "tags", name: this.renderWidgetId("tags"), label: "Tags" })}
            {this.getWidget({ baseName: "slug", name: this.renderWidgetId("slug"), label: "Slug" })}
            {this.getWidget({
              baseName: "summary",
              name: this.renderWidgetId("summary"),
              label: "Summary",
              type: "textarea"
            })}

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
