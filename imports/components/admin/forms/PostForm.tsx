import * as React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import Done from "@material-ui/icons/Done";
import Button from "@material-ui/core/Button";
import * as BlockUi from "react-block-ui";
import * as Validation from "../../../modules/validation";
import Widget from "../../forms/Widget";
import * as PageMethods from "../../../api/pages/methods";
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
}

interface IState {
  id: string;
  metaDescription: string;
  name: string;
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
      metaDescription: settingsObj ? settingsObj.metaDescription : "",
      name: settingsObj ? settingsObj.name : "",
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

    const image_id_current = edit ? image_id_edit : image_id_new;

    const settingsImage = settingsObj ? settingsObj.image_id : "";
    //log.info(`PostsForm.handlesubmit()`, image_id_current, `[${settingsImage}]`);

    let pageFields = {
      id: this.state.id,
      body: this.state.body,
      image_id: image_id_current || settingsImage,
      title: this.state.title,
      metaDescription: this.state.metaDescription,
      name: this.state.name,
      slug: this.state.slug
    };

    this.setState({ blockUI: true });
    if (this.props.edit) {
      PageMethods.updatePage.call(pageFields, err => {
        this.setState({ blockUI: false });
        if (err) {
          Library.modalErrorAlert(err.reason);
          log.error(`PageMethods.updatePage failed`, err);
        } else {
          this.miniAlert(`Your post was updated.`);
        }
      });
    } else {
      PageMethods.createPage.call(pageFields, err => {
        this.setState({ blockUI: false });
        if (err) {
          Library.modalErrorAlert(err.reason);
          log.error(`PageMethods.createPage failed`, err);
        } else {
          this.miniAlert(`A post was succesfully created.`);
        }
      });
    }
  };

  handleChange = e => {
    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let name = this.renderWidgetName(target.id);
    //let id = target.id;
    //let name = "boo";
    this.setState({ [name]: value });
  };

  updateBody = body => {
    this.setState({ body: body });
  };

  getWidget(props: any) {
    let widgetType = props.widgetType ? props.widgetType : "simple";
    return (
      <Widget
        widgetType={widgetType}
        handleChange={this.handleChange}
        dataObj={this.props.settingsObj}
        wProps={props}
      />
    );
  }

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

  render() {
    log.info(`PostsForm.render() edit=[${this.props.edit}]`, this.props);

    return (
      <div>
        <BlockUi tag="div" blocking={this.state.blockUI}>
          <form id={this.formID} className={this.props.classes.adminPostsForm}>
            {this.getWidget({
              baseName: "metaDescription",
              name: this.renderWidgetId("metaDescription"),
              label: "Meta Description"
            })}
            {this.getWidget({ baseName: "name", name: this.renderWidgetId("name"), label: "Name" })}
            {this.getWidget({ baseName: "slug", name: this.renderWidgetId("slug"), label: "Slug" })}
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
