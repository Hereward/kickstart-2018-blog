///<reference path="../../../index.d.ts"/>

import * as React from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import { connect } from "react-redux";
import Paper from "@material-ui/core/Paper";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import { Comments } from "../../api/comments/publish";
import Comment from "./Comment";

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
    marginTop: "1rem"
  },
  loadMore: {
    marginTop: "1rem",
    textAlign: "center"
  }
});

interface IProps {
  classes: PropTypes.object.isRequired;
  postId: string;
  comments: any;
  dispatch: any;
  totalComments: number;
  cursorLimit: number;
  userId: string;
}

interface IState {}

class CommentList extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  UNSAFE_componentWillMount() {
    //log.info(`CommentList componentWillMount()`);
    this.props.dispatch({ type: "LOAD_INIT" });
  }

  loadMore = () => {
    //log.info(`CommentList loadMore()`);
    this.props.dispatch({ type: "LOAD_MORE" });
  };

  mapComments() {
    const { classes, comments } = this.props;
    const mapped = comments.map(comment => {
      //const checkedC = this.checkCheckBox(post);
      const layout = <Comment userId={this.props.userId} key={comment._id} comment={comment} />;
      return layout;
    });

    return mapped;
  }

  loadMoreButton() {
    const { classes, comments, totalComments } = this.props;
    return (
      <div className={classes.loadMore}>
        <Button variant="outlined" onClick={this.loadMore} size="small">
          More Comments
        </Button>
      </div>
    );
  }

  render() {
    const { classes, comments, totalComments, cursorLimit } = this.props;

    return (
      <div>
        {comments ? this.mapComments() : ""}
        {totalComments > cursorLimit ? this.loadMoreButton() : ""}
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    cursorLimit: state.cursorLimit
  };
};

export default connect(mapStateToProps)(
  withTracker(props => {
    //log.info(`CommentList tracker`, props);
    const commentsHandle = Meteor.subscribe("comments");
    const options = {
      sort: { published: -1 },
      limit: props.cursorLimit
    };
    const totalComments = Comments.find({ postId: props.postId }).count();
    const commentsList = Comments.find({ parentId: "", postId: props.postId }, options).fetch();
    return {
      comments: commentsList,
      totalComments: totalComments
    };
  })(withStyles(styles, { withTheme: true })(CommentList))
);
