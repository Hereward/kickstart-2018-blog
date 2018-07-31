import * as React from "react";
import * as jquery from "jquery";
import { Form, FormGroup, FormText } from "reactstrap";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import * as BlockUi from "react-block-ui";
import "react-block-ui/style.css";
import "react-quill/dist/quill.snow.css";
import * as Validation from "../../modules/validation";

const ReactQuill = require("react-quill");

interface IProps {
  classes: any;
  settingsObj?: any;
}

interface IState {
  body: string;
  blockUI: boolean;
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
      body: settingsObj ? settingsObj.body : "",
      blockUI: false
    };
  }

  /*
  preventDefault(e) {
    e.preventDefault();
  }
  */

  keyUp(event) {
    log.info(`CommentForm.keyUp()`, event.key);
  }

  componentDidMount() {
    /*
    jquery(`#${this.formID}`).bind("keypress", (e) => {
      if (e.keyCode === 13) {
        return false;
      }
    });
    */
    Validation.validate(this);
  }

  disableReturnKey(state) {
    jquery(window).keydown(event => {
      if (event.keyCode === 13) {
        event.preventDefault();
        return !state;
      }
    });
  }

  updateBody = body => {
    this.setState({ body: body });
  };

  handleSubmit(e) {
    this.setState({ blockUI: true });
    e.preventDefault();

    log.info(`CommentForm.handleSubmit()`);

    //this.props.handleSubmit();
  }

  handleSetState(sVar, sVal) {
    this.setState({ [sVar]: sVal });
  }

  nothing() {
    return null;
  }

  render() {
    const { classes, settingsObj } = this.props;
    return (
      <BlockUi tag="div" blocking={this.state.blockUI}>
        <form className={classes.form} id={this.formID} onSubmit={this.handleSubmit}>
          <div className="form-group">
            <ReactQuill
              className={`${classes.rte} novalidate`}
              id="commentText"
              placeholder="Write a comment..."
              defaultValue={settingsObj ? settingsObj.body : ""}
              onFocusOut={this.nothing()}
              onKeyUp={this.keyUp}
              onChange={this.updateBody}
              modules={this.modules}
              formats={this.formats}
              theme="snow"
            />
          </div>
        </form>
      </BlockUi>
    );
  }
}

export default connect()(withStyles(styles, { withTheme: true })(CommentForm));
