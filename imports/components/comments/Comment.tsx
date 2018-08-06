///<reference path="../../../index.d.ts"/>

import * as React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import * as dateFormat from "dateformat";
import { Card, CardImg, CardText, CardBody, CardTitle, CardSubtitle } from "reactstrap";
import Button from "@material-ui/core/Button";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import { Profiles } from "../../api/profiles/publish";
import OptionGroup from "../admin/components/OptionGroup";
import CommentForm from "../forms/CommentForm";

let styles: any;
styles = theme => ({
  card: {
    marginTop: "1rem",
    backgroundColor: "#fdf9f4"
  },
  cardBody: {
    paddingBottom: "0.75rem"
  }
});

interface IProps {
  comment: PropTypes.object.isRequired;
  classes: PropTypes.object.isRequired;
  commenterProfile: PropTypes.object.isRequired;
  profilePublic: PropTypes.object.isRequired;
  dispatch: any;
  userId: string;
}

interface IState {
  showReplyForm: boolean;
}

class CommentList extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      showReplyForm: false
    };
  }

  toggleReply = () => {
    const vis = !this.state.showReplyForm;
    this.setState({ showReplyForm: vis });
  };

  renderComment(comment) {
    //layout: any = "";
    return <div dangerouslySetInnerHTML={this.createMarkup(comment.body)} />;
  }

  commentSubmitted = () => {
    this.setState({ showReplyForm: false });
  };

  createMarkup(html) {
    return { __html: html };
  }

  // <CardTitle>Card title</CardTitle>
  // <Button>Button</Button>

  reply() {
    const { comment } = this.props;
    return (
      <OptionGroup
        show={this.state.showReplyForm}
        transparent={true}
        minimal={true}
        label="Reply"
        action={this.toggleReply}
      >
        <CommentForm commentSubmitted={this.commentSubmitted} parentId={comment._id} postId={comment.postId} />
      </OptionGroup>
    );
  }

  layout() {
    const { classes, comment, commenterProfile } = this.props;
    const layout = (
      <Card className={classes.card}>
        <CardBody className={classes.cardBody}>
          <CardSubtitle>
            {commenterProfile.screenName} | {dateFormat(comment.published, "dd mmmm yyyy, h:MM:ss")}
          </CardSubtitle>
          <div className="card-text">{this.renderComment(comment)}</div>
          {this.props.userId ? this.reply() : ""}
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
    //const profilesHandle = Meteor.subscribe("profiles-public");
    const profile = Profiles.findOne({ owner: props.comment.authorId });
    // log.info(`Comment Tracker`, props.comment.authorId, profile);
    return {
      commenterProfile: profile
    };
  })(withStyles(styles, { withTheme: true })(CommentList))
);
