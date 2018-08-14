///<reference path="../../../index.d.ts"/>

import * as React from "react";
import * as ReactDOM from "react-dom";
import * as Loadable from "react-loadable";
import CircularProgress from "@material-ui/core/CircularProgress";
import { Link } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import * as dateFormat from "dateformat";
import { Card, CardBody } from "reactstrap";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import { Profiles } from "../../api/profiles/publish";
import OptionGroup from "../admin/components/OptionGroup";
import CommentForm from "../forms/CommentForm";
//import CommentReplies from "./CommentReplies";
import { can as userCan } from "../../modules/user";

let styles: any;
styles = theme => ({
  commentBody: {
    //border: "1px solid rgba(0, 0, 0, 0.125)",
    //borderColor: "#fffcf9",
    //borderRadius: "0.25rem",
    //padding: "1rem",
    //backgroundColor: "#fffcf9",
    margin: "0.5rem 0"
  },
  cardChild: {
    backgroundColor: "transparent",
    border: 0,
    margin: "0 0 0.5rem 0",
    padding: 0
  },
  card: {
    marginTop: "1rem",
    backgroundColor: "#fdf9f4"
  },
  cardBody: {
    paddingBottom: "0.75rem"
  },
  cardBodyChild: {
    padding: 0,
    margin: 0
  },
  child: {
    border: "0",
    backgroundColor: "transparent",
    marginLeft: "1rem"
  },
  editComment: {
    //marginTop: "-0.75rem",
    marginBottom: "0.25rem",
    fontSize: "0.9rem"
  },
  replyButton: {
    marginTop: "0.5rem"
  }
});

interface IProps {
  comment: PropTypes.object.isRequired;
  classes: PropTypes.object.isRequired;
  commenterProfile: PropTypes.object.isRequired;
  profilePublic: PropTypes.object.isRequired;
  dispatch: any;
  userId: string;
  parentId?: string;
}

interface IState {
  showReplyForm: boolean;
  showEditForm: boolean;
  cursorLimitReplies: number;
}

const CommentReplies = Loadable({
  loader: () => import("./CommentReplies"),
  loading() {
    return <div>Loading...</div>;
  }
});

class CommentList extends React.Component<IProps, IState> {
  basePaginationUnit = Meteor.settings.public.admin.basePaginationUnit;

  constructor(props) {
    super(props);

    this.state = {
      showReplyForm: false,
      cursorLimitReplies: Meteor.settings.public.admin.basePaginationUnit,
      showEditForm: false
    };
  }

  toggleReply = () => {
    const vis = !this.state.showReplyForm;
    this.setState({ showReplyForm: vis });
  };

  renderComment(comment) {
    const { classes } = this.props;
    //layout: any = "";
    return <div className={classes.commentBody} dangerouslySetInnerHTML={this.createMarkup(comment.body)} />;
  }

  togglEditComment = () => {
    const vis = !this.state.showEditForm;
    this.setState({ showEditForm: vis });
  };

  commentSubmitted = () => {
    this.setState({ showReplyForm: false });
  };

  commentEdited = () => {
    this.setState({ showEditForm: false });
  };

  createMarkup(html) {
    return { __html: html };
  }

  loadMoreReplies = () => {
    const currentTotal = this.state.cursorLimitReplies;
    const newTotal = currentTotal + this.basePaginationUnit;
    this.setState({ cursorLimitReplies: newTotal });
  };

  // <CardTitle>Card title</CardTitle>
  // <Button>Button</Button>

  reply() {
    const { classes, comment, commenterProfile } = this.props;
    const parentId = comment.parentId || comment._id;
    const replyTo = comment.parentId ? commenterProfile.screenName : "";
    return (
      <div className={classes.replyButton}>
        <OptionGroup
          show={this.state.showReplyForm}
          transparent={true}
          minimal={true}
          label="Reply"
          action={this.toggleReply}
        >
          <CommentForm
            replyTo={replyTo}
            commentSubmitted={this.commentSubmitted}
            parentId={parentId}
            postId={comment.postId}
          />
        </OptionGroup>
      </div>
    );
  }

  editForm() {
    const { comment } = this.props;
    const parentId = comment.parentId || comment._id;
    return (
      <CommentForm
        commentObj={comment}
        edit={true}
        commentId={comment._id}
        commentEdited={this.commentEdited}
        postId={comment.postId}
      />
    );
  }

  deleteComment = () => {};

  edit() {
    const { classes, comment } = this.props;
    const { showEditForm } = this.state;
    const editLabel = showEditForm ? "cancel" : "edit";
    return userCan({ do: "moderateComment", threshold: "creator", owner: comment.authorId }) ? (
      <div className={classes.editComment}>
        <Link to="#" onClick={this.togglEditComment}>
          {editLabel}
        </Link>{" "}
        |{" "}
        <Link to="#" onClick={this.deleteComment}>
          delete
        </Link>
      </div>
    ) : (
      ""
    );
  }

  layout() {
    const { classes, comment, commenterProfile, userId } = this.props;
    const { showEditForm } = this.state;
    //log.info(`Comment.layout()`, this.props);
    let commentType: string;
    //let CommentReplies: any;

    const cardStyle = comment.parentId ? classes.cardChild : classes.card;
    const cardBodyStyle = comment.parentId ? classes.cardBodyChild : classes.cardBody;

    const layout = (
      <Card className={cardStyle}>
        <CardBody className={cardBodyStyle}>
          <h6>
            {commenterProfile.screenName} | {dateFormat(comment.created, "dd mmmm yyyy, h:MM:ss")}
          </h6>
          {this.edit()}
          <div className="card-text">{showEditForm ? this.editForm() : this.renderComment(comment)}</div>
          {this.props.userId && !showEditForm ? this.reply() : ""}
          {comment.parentId === null ? (
            <CommentReplies
              loadMoreReplies={this.loadMoreReplies}
              cursorLimitReplies={this.state.cursorLimitReplies}
              userId={userId}
              parentId={comment._id}
              postId={comment.postId}
            />
          ) : (
            ""
          )}
        </CardBody>
      </Card>
    );
    return layout;
  }

  render() {
    return this.props.commenterProfile ? this.layout() : "";
  }
}

export default connect()(
  withTracker(props => {
    //log.info(`Comment tracker`, props.comment);
    //const profilesHandle = Meteor.subscribe("profiles-public");
    let profile: any = "";
    if (props.comment) {
      profile = Profiles.findOne({ owner: props.comment.authorId });
    }

    // log.info(`Comment Tracker`, props.comment.authorId, profile);
    return {
      commenterProfile: profile
    };
  })(withStyles(styles, { withTheme: true })(CommentList))
);
