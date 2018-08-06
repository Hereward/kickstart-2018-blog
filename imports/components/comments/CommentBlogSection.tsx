///<reference path="../../../index.d.ts"/>

import * as React from "react";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import CommentForm from "../forms/CommentForm";
import OptionGroup from "../admin/components/OptionGroup";
import CommentList from "./CommentList";

let styles: any;
styles = theme => ({
  heading: {
    color: "rgba(0, 0, 0, 0.6)",
    marginBottom: "0.3rem",
    marginTop: "-0.5rem"
  },
  review: {
    fontStyle: "italic",
    color: "rgba(0, 0, 0, 0.5)",
  }
});

interface IProps {
  classes: any;
  postId: string;
  userId: string;
}

interface IState {
  showCommentForm: boolean;
}

class CommentBlogSection extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      showCommentForm: false
    };
  }

  toggleCommentForm = () => {
    const vis = !this.state.showCommentForm;
    this.setState({ showCommentForm: vis });
  };

  commentSubmitted = () => {
    this.setState({ showCommentForm: false });
  };

  render() {
    const { classes, postId } = this.props;
    return (
      <div className="container">
        <hr />
        <h3 className={classes.heading}>Join The Discussion</h3>
        <p className={classes.review}>Please review the Terms of Service before reading or responding to comments.</p>
        <OptionGroup
          show={this.state.showCommentForm}
          label="Add a Comment"
          action={this.toggleCommentForm}
          buttonSize="small"
        >
          <CommentForm commentSubmitted={this.commentSubmitted} postId={this.props.postId} />
        </OptionGroup>
        <CommentList userId={this.props.userId} postId={postId} />
      </div>
    );
  }
}

export default connect()(
  withTracker(props => {
    return {};
  })(withStyles(styles, { withTheme: true })(CommentBlogSection))
);
