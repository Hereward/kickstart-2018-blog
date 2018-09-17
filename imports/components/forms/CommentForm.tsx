import * as React from "react";
import * as jquery from "jquery";
import * as isTouchDevice from "is-touch-device";
import { Form, FormGroup, FormText } from "reactstrap";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import * as BlockUi from "react-block-ui";
import "react-block-ui/style.css";
import "react-quill/dist/quill.snow.css";
import * as Validation from "../../modules/validation";
import { createComment, updateComment } from "../../api/comments/methods";
import * as Library from "../../modules/library";

const ReactQuill = require("react-quill");

interface IProps {
  classes: any;
  commentObj?: any;
  postId: string;
  parentId: string;
  dispatch: any;
  commentSubmitted?: any;
  commentEdited?: any;
  replyTo?: string;
  edit?: boolean;
  commentId?: string;
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
  },
  save: {
    "text-align": "right",
    [theme.breakpoints.up("lg")]: {
      display: "none"
    }
  }
});

class CommentForm extends React.Component<IProps, IState> {
  touchDevice: boolean;
  formID: string = "CommentForm";
  toolbarOptions = [
    [{ header: [1, 2, 3, 4, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["link", "image", "video"],
    ["clean"]
  ];

  modulesDesktop = {
    toolbar: this.toolbarOptions,
    keyboard: {
      bindings: {
        tab: false,
        handleEnter: {
          key: 13,
          handler: () => {
            this.handleSubmit();
            // Do nothing
          }
        }
      }
    }
  };

  modulesMobile = {
    toolbar: this.toolbarOptions,
    keyboard: {
      bindings: {
        tab: false
      }
    }
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
    const { commentObj } = this.props;

    this.handleSubmit = this.handleSubmit.bind(this);
    this.touchDevice = isTouchDevice();

    this.state = {
      body: commentObj ? commentObj.body : "",
      blockUI: false
    };
  }

  componentDidMount() {
    Validation.validate(this);
  }

  updateBody = body => {
    this.setState({ body: body });
  };

  miniAlert = (message = "") => {
    this.props.dispatch({ type: "MINI_ALERT_ON", message: message });
  };

  handleSubmit(event?: any) {
    if (event) {
      event.preventDefault();
    }
    const { postId, parentId, edit } = this.props;
    this.setState({ blockUI: true });

    if (edit) {
      this.doEditComment();
    } else {
      this.doCreateComment();
    }
  }

  doEditComment() {
    const { commentId, edit } = this.props;
    const fields = {
      id: commentId,
      body: this.state.body
    };

    updateComment.call(fields, err => {
      this.setState({ blockUI: false });
      if (err) {
        Library.modalErrorAlert(err.reason);
        log.error(`updateComment failed`, err);
      } else {
        this.props.commentEdited();
        this.miniAlert(`Your comment has been edited.`);
      }
    });
  }

  doCreateComment() {
    const { postId, parentId, edit } = this.props;
    const fields = {
      postId: postId,
      parentId: parentId || null,
      body: this.state.body
    };

    createComment.call(fields, err => {
      this.setState({ blockUI: false });
      if (err) {
        Library.modalErrorAlert(err.reason);
        log.error(`createComment failed`, err);
      } else {
        this.props.commentSubmitted();
        this.miniAlert(`Your comment has been posted.`);
      }
    });
  }

  handleSetState(sVar, sVal) {
    this.setState({ [sVar]: sVal });
  }

  nothing() {
    return null;
  }

  render() {
    const { classes, commentObj, postId, parentId, replyTo, edit, commentId } = this.props;

    let formId: string = "";
    if (edit) {
      formId = `edit_comment_${commentId}`;
    } else {
      formId = parentId ? `${this.formID}_${parentId}` : `${this.formID}_${postId}`;
    }

    const prefix = replyTo ? `${replyTo}: ` : "";
    return (
      <BlockUi tag="div" blocking={this.state.blockUI}>
        <form className={classes.form} id={formId} onSubmit={this.handleSubmit}>
          <div className="form-group">
            <ReactQuill
              className={`${classes.rte} novalidate`}
              id="commentText"
              placeholder="Write a comment..."
              defaultValue={commentObj ? commentObj.body : prefix}
              onFocusOut={this.nothing()}
              onChange={this.updateBody}
              modules={this.touchDevice ? this.modulesMobile : this.modulesDesktop}
              formats={this.formats}
              theme="snow"
            />
            {this.touchDevice ? (
              <div className={classes.save}>
                <Link to="#" onClick={this.handleSubmit}>
                  save &raquo;
                </Link>
              </div>
            ) : (
              ""
            )}
          </div>
        </form>
      </BlockUi>
    );
  }
}

export default connect()(withStyles(styles, { withTheme: true })(CommentForm));
