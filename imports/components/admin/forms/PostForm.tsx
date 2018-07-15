import * as React from "react";
import { withStyles } from "@material-ui/core/styles";
import Done from "@material-ui/icons/Done";
//import RaisedButton from "material-ui/RaisedButton";
import Button from "@material-ui/core/Button";
import * as BlockUi from "react-block-ui";
import * as Validation from "../../../modules/validation";
import Widget from "../../forms/Widget";
import * as PageMethods from "../../../api/pages/methods";
import * as Library from "../../../modules/library";

const ReactQuill = require("react-quill");

interface IProps {
  settingsObj: any;
  classes: any;
  edit: boolean;
  image_id?: string;
}

interface IState {
  id: string;
  metaDescription: string;
  image_id: string;
  name: string;
  slug: string;
  title: string;
  body: string;
  blockUI: boolean;
}

const styles = theme => ({
  adminSettingsForm: {
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

class SettingsForm extends React.Component<IProps, IState> {
  formID: string = "PageForm";
  rteID: string = "rte";

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

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    if (this.props.settingsObj) {
      this.formID = `PageFormEdit_${this.props.settingsObj._id}`;
      this.rteID = `rte_${this.props.settingsObj._id}`;
    }

    this.state = {
      id: settingsObj ? settingsObj._id : "",
      metaDescription: settingsObj ? settingsObj.metaDescription : "",
      image_id: settingsObj ? settingsObj.image_id : "",
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

  handleSubmit() {
    let pageFields = {
      id: this.state.id,
      body: this.state.body,
      image_id: this.state.image_id || this.props.image_id,
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
          console.log(`PageMethods.updatePage failed`, err);
        }
      });
    }
  }

  handleChange = e => {
    log.info(`Pages handleChange`, e.target);
    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let name = this.renderWidgetName(target.id);
    //let id = target.id;
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
      id = `${name}%%${this.props.settingsObj._id}`;
    }

    return id;
  }

  renderWidgetName(id) {
    let name = id;
    const arraySplit = id.split("%%");
    return arraySplit[0];
  }

  render() {
    return (
      <div>
        <BlockUi tag="div" blocking={this.state.blockUI}>
          <form id={this.formID} className={this.props.classes.adminSettingsForm}>
            {this.getWidget({ baseName: "metaDescription", name: this.renderWidgetId("metaDescription"), label: "Meta Description" })}
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

export default withStyles(styles, { withTheme: true })(SettingsForm);
