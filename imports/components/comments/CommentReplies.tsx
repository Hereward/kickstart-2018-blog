///<reference path="../../../index.d.ts"/>

import * as React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Button from "@material-ui/core/Button";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import { Comments } from "../../api/comments/publish";
import CommentReply from "./CommentReply";

let styles: any;
styles = theme => ({
  body: {
    marginLeft: "1rem"
  },
  comment: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    marginTop: "1rem",
    backgroundColor: "#fdf9f4"
  },
  heading: {
    color: "rgba(0, 0, 0, 0.6)",
    marginTop: "0.5rem",
    marginBottom: "1rem"
  },
  loadMore: {
    marginTop: "1rem"
  },
  hr: {
    marginBottom: 0
  }
});

interface IProps {
  classes: PropTypes.object.isRequired;
  loadMoreReplies: PropTypes.object.isRequired;
  postId: string;
  parentId: string;
  comments: any;
  dispatch: any;
  totalComments: number;
  cursorLimitReplies: number;
  userId: string;
}

interface IState {}

class CommentReplies extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  UNSAFE_componentWillMount() {
    //this.props.dispatch({ type: "LOAD_INIT" });
  }

  loadMore = () => {
    //this.props.dispatch({ type: "LOAD_MORE" });
  };

  loadMoreButton() {
    const { classes, loadMoreReplies } = this.props;
    return (
      <div className={classes.loadMore}>
        <Link to="#" onClick={loadMoreReplies}>
          Show more replies...
        </Link>
      </div>
    );
  }

  mapComments() {
    const { classes, comments, parentId } = this.props;
    //log.info(`CommentReplies.mapComments()`, this.props);
    const mapped = comments.map(comment => {
      //const checkedC = this.checkCheckBox(post);
      //const layout = <div>boooo</div>;
      const layout = (
        <CommentReply parentId={parentId} userId={this.props.userId} key={comment._id} comment={comment} />
      );
      //const layout = <CommentReply key={comment._id} />;
      return layout;
    });

    return mapped;
  }

  render() {
    const { classes, comments, totalComments, cursorLimitReplies } = this.props;

    //log.info(`CommentReplies.render()`, totalComments, cursorLimitReplies);

    return totalComments ? (
      <div>
        <hr className={classes.hr} />
        <h6 className={classes.heading}>Replies</h6>
        <div className={classes.body}>
          {this.mapComments()}
          {totalComments > cursorLimitReplies ? this.loadMoreButton() : ""}
        </div>
      </div>
    ) : (
      ""
    );
  }
}

export default connect()(
  withTracker(props => {
    //log.info(`CommentReplies.tracker()`, props);
    const commentsHandle = Meteor.subscribe("comments");
    let totalComments = 0;
    const options = {
      sort: { created: -1 },
      limit: props.cursorLimitReplies
    };
    //const cursor = Comments.find({ parentId: props.parentId }, options);
    totalComments = Comments.find({ parentId: props.parentId }).count();
    const commentsList = Comments.find({ parentId: props.parentId }, options).fetch();
    return {
      comments: commentsList,
      totalComments: totalComments
    };
  })(withStyles(styles, { withTheme: true })(CommentReplies))
);
