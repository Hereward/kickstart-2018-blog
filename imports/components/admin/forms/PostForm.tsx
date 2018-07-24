import * as React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import Done from "@material-ui/icons/Done";
import Button from "@material-ui/core/Button";
import * as BlockUi from "react-block-ui";
import * as slug from "slug";
import * as Validation from "../../../modules/validation";
import Widget from "../../forms/Widget";
//import * as PageMethods from "../../../api/pages/methods";
import * as Library from "../../../modules/library";
import ForgotPassWordResetForm from "../../forms/ForgotPassWordResetForm";

const ReactQuill = require("react-quill");

interface IProps {
  settingsObj: any;
  classes: any;
  edit: boolean;
  image_id_edit?: string;
  image_id_new?: string;
  dispatch: any;
  postUpdateMethod: any;
  postCreateMethod: any;
  handleNewPostCreated: any;
  handleEditing: any;
}

interface IState {
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
    const { edit } = this.props;

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.formID = edit ? `PostFormEdit_${settingsObj._id}` : `PostForm_New`;
    this.rteID = edit ? `rte_${settingsObj._id}` : "rte";

    this.state = {
      id: settingsObj ? settingsObj._id : "",
      summary: settingsObj ? settingsObj.summary : "",
      slug: settingsObj ? settingsObj.slug : "",
      title: settingsObj ? settingsObj.title : "",
      body: settingsObj ? settingsObj.body : "",
      blockUI: false
    };
  }

  componentDidMount() {
    Validation.validate(this);
  }

  miniAlert = (message = "") => {
    this.props.dispatch({ type: "MINI_ALERT_ON", message: message });
  };

  handleSubmit = () => {
    const { settingsObj } = this.props;
    const { image_id_edit } = this.props;
    const { image_id_new } = this.props;
    const { edit } = this.props;
    const { postUpdateMethod } = this.props;
    const { postCreateMethod } = this.props;
    const { handleNewPostCreated } = this.props;
    const { handleEditing } = this.props;

    const image_id_current = edit ? image_id_edit : image_id_new;

    const settingsImage = settingsObj ? settingsObj.image_id : "";
    let pageFields: any;

    pageFields = {
      id: this.state.id,
      body: this.state.body,
      image_id: image_id_current || settingsImage,
      title: this.state.title,
      summary: this.state.summary,
      slug: this.state.slug,
      modified: new Date()
    };

    if (!edit) {
      pageFields.published = new Date();
      pageFields.allowComments = false;
    } else {
      pageFields.closeComments = false;
    }

    this.setState({ blockUI: true });
    if (edit) {
      Meteor.call(postUpdateMethod, pageFields, err => {
        this.setState({ blockUI: false });
        if (err) {
          Library.modalErrorAlert(err.reason);
          log.error(`PageMethods.updatePage failed`, err);
        } else {
          this.miniAlert(`Your post was updated.`);
          handleNewPostCreated();
          handleEditing(false, edit);
        }
      });
    } else {
      Meteor.call(postCreateMethod, pageFields, err => {
        this.setState({ blockUI: false });
        if (err) {
          Library.modalErrorAlert(err.reason);
          log.error(`PageMethods.createPage failed`, err);
        } else {
          this.miniAlert(`A post was succesfully created.`);
          handleNewPostCreated();
          handleEditing(false, edit);
        }
      });
    }
  };

  handleChange = e => {
    const { handleEditing } = this.props;
    const { edit } = this.props;
    handleEditing(true, edit);

    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let name = this.renderWidgetName(target.id);
    if (name === "title" && !edit) { // set the slug value if the target field = 'title'
      const slugString = slug(value, { lower: true });
      this.setState({ slug: slugString });
    }

    this.setState({ [name]: value }); // set the value of the target field
  };

  updateBody = body => {
    this.setState({ body: body });
  };

  getWidget = (props: any) => {
    let widgetType = props.widgetType ? props.widgetType : "simple";
    return (
      <Widget
        widgetType={widgetType}
        handleChange={this.handleChange}
        dataObj={this.props.settingsObj}
        wProps={props}
        stateValue={this.state[props.baseName]}
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

  render() {
    return (
      <div>
        <BlockUi tag="div" blocking={this.state.blockUI}>
          <form id={this.formID} className={this.props.classes.adminPostsForm}>
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
                defaultValue={this.props.settingsObj ? this.props.settingsObj.body : ""}
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

export default connect()(withStyles(styles, { withTheme: true })(PostForm));
