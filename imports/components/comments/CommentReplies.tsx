///<reference path="../../../index.d.ts"/>

import * as React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import { Comments } from "../../api/comments/publish";
import CommentReply from "./CommentReply";

let styles: any;
styles = theme => ({
  comment: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    marginTop: "1rem",
    backgroundColor: "#fdf9f4"
  },
  heading: {
    color: "rgba(0, 0, 0, 0.6)",
    marginTop: "1rem",
    marginBottom: "1rem"
  },
  loadMore: {
    marginTop: "1rem",
    textAlign: "center"
  }
});

interface IProps {
  classes: PropTypes.object.isRequired;
  postId: string;
  parentId: string;
  comments: any;
  dispatch: any;
  totalComments: number;
  cursorLimit: number;
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

  //<h3 className={classes.heading}>Responses</h3>
  renderk() {
    return <div>boo</div>;
  }

  render() {
    const { classes, comments, totalComments, cursorLimit } = this.props;
    if (comments) {
      //log.info(`CommentList.render()`, comments, totalComments);
    }

    return totalComments ? (
      <div>
        <h5 className={classes.heading}>Replies</h5>
        {this.mapComments()}
      </div>
    ) : (
      ""
    );
  }
}

// {comments && totalComments > cursorLimit ? this.loadMoreButton() : ""}

const mapStateToProps = state => {
  return {
    cursorLimit: state.cursorLimit
  };
};

export default connect(mapStateToProps)(
  withTracker(props => {
    //log.info(`CommentReplies.tracker()`, props);
    const commentsHandle = Meteor.subscribe("comments");
    let totalComments = 0;
    const options = {
      sort: { published: -1 }
    };
    const cursor = Comments.find({ parentId: props.parentId }, options);
    totalComments = cursor.count();
    const commentsList = cursor.fetch();
    return {
      comments: commentsList,
      totalComments: totalComments
    };
  })(withStyles(styles, { withTheme: true })(CommentReplies))
);
