import * as React from "react";
import { connect } from "react-redux";
import Button from "@material-ui/core/Button";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { withStyles } from "@material-ui/core/styles";
import * as BlockUi from "react-block-ui";
import "react-block-ui/style.css";
import "react-quill/dist/quill.snow.css";
import * as Library from "../../../modules/library";
import Widget from "../../forms/Widget";

const ReactQuill = require("react-quill");

interface IProps {
  classes: any;
  settingsObj?: any;
  dispatch: any;
  postUpdateMethod: any;
}

interface IState {
  publish: boolean;
  body: string;
  blockUI: boolean;
  parentId: string;
  postId: string;
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

class CommentForm extends React.Component<IProps, IState> {
  formID: string = "CommentForm";
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
    this.state = {
      publish: settingsObj ? settingsObj.publish : false,
      body: settingsObj ? settingsObj.body : "",
      parentId: settingsObj ? settingsObj.parentId : null,
      postId: settingsObj ? settingsObj.postId : "",
      blockUI: false
    };
  }

  /*
  preventDefault(e) {
    e.preventDefault();
  }
  */
  /*
  keyUp = event => {
    log.info(`CommentForm.keyUp()`, event.key);
    if (event.key === "Enter") {
      this.handleSubmit();
    }
  };
  */

  componentDidMount() {
    /*
    jquery(`#${this.formID}`).bind("keypress", (e) => {
      if (e.keyCode === 13) {
        return false;
      }
    });
    */
    //Validation.validate(this);
  }

  getWidget = (props: any) => {
    let widgetType = props.widgetType ? props.widgetType : "simple";
    return (
      <Widget
        widgetType={widgetType}
        handleChange={this.handleChange}
        dataObj={this.props.settingsObj}
        wProps={props}
        uncontrolled={true}
      />
    );
  };

  renderWidgetName(id) {
    let name = id;
    const arraySplit = id.split("__");
    return arraySplit[0];
  }

  handleChange = e => {
    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let name = this.renderWidgetName(target.id);

    this.setState({ [name]: value }); // set the value of the target field
  };

  updateBody = body => {
    this.setState({ body: body });
  };

  miniAlert = (message = "") => {
    this.props.dispatch({ type: "MINI_ALERT_ON", message: message });
  };

  handleSubmit(e) {
    e.preventDefault();
    const { postUpdateMethod, settingsObj } = this.props;
    this.setState({ blockUI: true });
    //log.info(`Admin.CommentForm.handleSubmit()`, this.state);
    const fields = {
      id: settingsObj._id,
      publish: this.state.publish,
      postId: this.state.postId,
      parentId: this.state.parentId || null,
      body: this.state.body
    };

    Meteor.call(postUpdateMethod, fields, err => {
      this.setState({ blockUI: false });
      if (err) {
        Library.modalErrorAlert(err.reason);
        log.error(`${postUpdateMethod} failed`, err);
      } else {
        this.miniAlert(`Comment was updated.`);
      }
    });
  }

  nothing() {
    return null;
  }

  togglePublish = () => {
    const currentState = this.state.publish;
    const newState = !currentState;
    this.setState({ publish: newState });
    return true;
  };

  render() {
    const { classes, settingsObj } = this.props;
    return (
      <BlockUi tag="div" blocking={this.state.blockUI}>
        <form className={classes.form} id={this.formID} onSubmit={this.handleSubmit}>
          <div className="form-group">
            <FormControlLabel
              control={<Switch disabled={false} onChange={this.togglePublish} checked={this.state.publish} />}
              label="Publish"
            />
          </div>
          {settingsObj.parentId ? this.getWidget({ name: "parentId", label: "Parent ID" }) : ""}
          <div className="form-group">
            <ReactQuill
              className={`${classes.rte} novalidate`}
              id="commentText"
              placeholder="Write a comment..."
              defaultValue={settingsObj ? settingsObj.body : ""}
              onFocusOut={this.nothing()}
              onChange={this.updateBody}
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
    );
  }
}

export default connect()(withStyles(styles, { withTheme: true })(CommentForm));
