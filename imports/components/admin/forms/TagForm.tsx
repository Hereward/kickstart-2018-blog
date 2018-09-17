import * as React from "react";
import * as jquery from "jquery";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import * as BlockUi from "react-block-ui";
import "react-block-ui/style.css";
import "react-quill/dist/quill.snow.css";
import * as Validation from "../../../modules/validation";
import * as Library from "../../../modules/library";
import Widget from "../../forms/Widget";
const slugify = require("slugify");

interface IProps {
  classes: any;
  settingsObj?: any;
  dispatch: any;
  postUpdateMethod: any;
  editingExistingData: boolean;
  postCreateMethod: PropTypes.object.isRequired;
  handleNewPostCreated: PropTypes.object.isRequired;
  handlePostUpdated: PropTypes.object.isRequired;
  handleEditing: PropTypes.object.isRequired;
  preSelected: string;
}

interface IState {
  title: string;
  titleRaw: string;
  blockUI: boolean;
  id: string;
}

const styles = theme => ({
  form: {
    marginTop: 0,
    marginBottom: 0
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

class TagForm extends React.Component<IProps, IState> {
  formID: string = "tagForm";

  constructor(props) {
    super(props);
    const { settingsObj } = this.props;
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = {
      titleRaw: settingsObj ? settingsObj.title : "",
      title: settingsObj ? settingsObj.title : "",
      id: settingsObj ? settingsObj._id : "",
      blockUI: false
    };
  }

  componentDidMount() {
    Validation.validate(this);
  }

  getWidget = (props: any) => {
    let widgetType = props.widgetType ? props.widgetType : "simple";
    return (
      <Widget
        widgetType={widgetType}
        handleChange={this.handleChange}
        dataObj={this.props.settingsObj}
        wProps={props}
        stateValue={this.state[props.baseName]}
        readOnly={props.readOnly}
      />
    );
  };

  renderWidgetName(id) {
    let name = id;
    const arraySplit = id.split("__");
    return arraySplit[0];
  }

  handleChange = e => {
    const { handleEditing } = this.props;
    const { editingExistingData } = this.props;
    handleEditing(true, editingExistingData);
    let slugString = "";
    const target = e.target;
    const value = target.value;
    const name = this.renderWidgetName(target.id);
    if (name === "titleRaw") {
      const truncVal = value.substring(0, 20);
      slugString = slugify(truncVal, { lower: true, remove: /[^A-Za-z0-9-\s]/g });
      this.setState({ title: slugString });
    }
    this.setState({ [name]: value });
  };

  miniAlert = (message = "") => {
    this.props.dispatch({ type: "MINI_ALERT_ON", message: message });
  };

  renderWidgetId(name) {
    let id = name;
    if (this.props.settingsObj) {
      id = `${name}__${this.props.settingsObj._id}`;
    }

    return id;
  }

  handleSubmit = () => {
    const {
      settingsObj,
      postUpdateMethod,
      editingExistingData,
      postCreateMethod,
      handlePostUpdated,
      handleNewPostCreated,
      handleEditing
    } = this.props;

    let pageFields: any;

    pageFields = {
      id: this.state.id,
      title: this.state.title
    };

    this.setState({ blockUI: true });
    if (editingExistingData) {
      Meteor.call(postUpdateMethod, pageFields, err => {
        this.setState({ blockUI: false });
        if (err) {
          Library.modalErrorAlert(err.reason);
          log.error(`${postUpdateMethod} failed`, err);
        } else {
          this.miniAlert(`Your tag was updated.`);
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
          this.miniAlert(`A tag was succesfully created.`);
          handleEditing(false, editingExistingData);
          handleNewPostCreated(pageFields);
        }
      });
    }
  };

  render() {
    const { classes, settingsObj } = this.props;
    return (
      <BlockUi tag="div" blocking={this.state.blockUI}>
        <form className={classes.form} id={this.formID}>
          {this.getWidget({ readOnly: true, baseName: "title", name: this.renderWidgetId("title"), label: "Rendered" })}
          {this.getWidget({ baseName: "titleRaw", name: this.renderWidgetId("titleRaw"), label: "Text" })}
          <div className="form-group">
            <Button variant="raised" type="submit" color="primary">
              Save
            </Button>
          </div>
        </form>
      </BlockUi>
    );
  }
}

export default connect()(withStyles(styles, { withTheme: true })(TagForm));
