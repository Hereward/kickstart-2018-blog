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
}

interface IState {
  metaDescription: string;
  metaImage: string;
  name: string;
  slug: string;
  title: string;
  body: string;
  allowSubmit: boolean;
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

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    if (this.props.settingsObj) {
      this.formID = `PageFormEdit_${this.props.settingsObj._id}`;
      this.rteID = `rte_${this.props.settingsObj._id}`;
    }

    this.state = {
      metaDescription: "",
      metaImage: "",
      name: "",
      slug: "",
      title: "",
      body: "",
      allowSubmit: true
    };
  }

  componentDidMount() {
    Validation.validate(this);
  }

  handleSubmit() {
    let pageFields = {
      body: this.state.body,
      title: this.state.title,
      metaDescription: this.state.metaDescription,
      name: this.state.name,
      slug: this.state.slug
    };

    this.setState({ allowSubmit: false });
    PageMethods.updatePage.call(pageFields, err => {
      this.setState({ allowSubmit: true });
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`PageMethods.updatePage failed`, err);
      }
    });
  }

  handleChange = e => {
    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let id = target.id;
    this.setState({ [id]: value});
    log.info(`Pages handleChange`, id, value, this.state);
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

  /*
   metaTitle: `About - ${Meteor.settings.public.mainTitle}`,
        metaDescription
        metaImage
        name
        slug
        title
        body
        modified: new Date(),
        published: new Date(),
        */

  render() {
    return (
      <div>
        <BlockUi tag="div" blocking={!this.state.allowSubmit}>
          <form id={this.formID} className={this.props.classes.adminSettingsForm}>
            {this.getWidget({ name: "metaDescription", label: "Meta Description" })}
            {this.getWidget({ name: "name", label: "Name" })}
            {this.getWidget({ name: "slug", label: "Slug" })}
            {this.getWidget({ name: "title", label: "Title" })}

            <div className="form-group">
              <label htmlFor="bodyText">Body Text:</label>
              <ReactQuill
                className={this.props.classes.rte}
                id={this.rteID}
                defaultValue={this.props.settingsObj ? this.props.settingsObj.body : ""}
                onChange={this.handleChange}
                modules={this.modules}
                formats={this.formats}
                theme="snow"
              />
            </div>

            <div className="form-group">
              <Button disabled={!this.state.allowSubmit} variant="raised" type="submit" color="primary">
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
