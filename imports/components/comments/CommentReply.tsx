///<reference path="../../../index.d.ts"/>

import * as React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import * as dateFormat from "dateformat";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import { Profiles } from "../../api/profiles/publish";

let styles: any;
styles = theme => ({
  commentReplyStyle: {
    backgroundColor: "transparent",
    marginLeft: "1rem"
  },
  publishDetails: {
    
  }
});

interface IProps {
  comment: PropTypes.object.isRequired;
  classes: PropTypes.object.isRequired;
  commenterProfile?: PropTypes.object.isRequired;
  dispatch: any;
  userId: string;
  parentId: string;
}

interface IState {
  showReplyForm: boolean;
}

class CommentReply extends React.Component<IProps, IState> {
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
    return <div dangerouslySetInnerHTML={this.createMarkup(comment.body)} />;
  }

  commentSubmitted = () => {
    this.setState({ showReplyForm: false });
  };

  createMarkup(html) {
    return { __html: html };
  }

  layout() {
    const { classes, comment, commenterProfile } = this.props;
    //log.info(`CommentReply.layout()`, comment);
    const layout = (
      <div className={classes.commentReplyStyle}>
        <h6 className={classes.publishDetails}>
          {commenterProfile.screenName} | {dateFormat(comment.published, "dd mmmm yyyy, h:MM:ss")}
        </h6>
        <div>{this.renderComment(comment)}</div>
      </div>
    );
    return layout;
  }

  render() {
    return this.props.commenterProfile ? this.layout() : <div>Loading...</div>;
  }
}

export default connect()(
  withTracker(props => {
    let profile: any = "";
    if (props.comment) {
      profile = Profiles.findOne({ owner: props.comment.authorId });
    }
    //log.info(`CommentReply.tracker()`, profile, props);
    return {
      commenterProfile: profile
    };
  })(withStyles(styles, { withTheme: true })(CommentReply))
);
