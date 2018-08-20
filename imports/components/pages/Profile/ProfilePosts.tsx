
import * as React from "react";
import { Meteor } from "meteor/meteor";
import Icon from "@material-ui/core/Icon";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import { Posts } from "../../../api/posts/publish";
import Transition from "../../partials/Transition";
import PostList from "./PostList";

let styles: any;
styles = theme => ({
  postListRoot: {
    marginTop: "1rem"
  },
  postListItem: {
    marginBottom: "1rem"
  },
  profilePostSection: {
    marginLeft: "1rem"
  }
});

interface IProps {
  classes: PropTypes.object.isRequired;
  dispatch: any;
  draftPosts: PropTypes.object.isRequired;
  publishedPosts: PropTypes.object.isRequired;
  userId: string;
}

interface IState {
  tabValue: number;
  cursorLimitDraft: number;
  cursorLimitPublished: number;
}

class ProfilePosts extends React.Component<IProps, IState> {
  basePaginationUnit: number;

  constructor(props) {
    super(props);

    this.basePaginationUnit = Meteor.settings.public.admin.basePaginationUnit;

    this.state = {
      tabValue: 0,
      cursorLimitDraft: this.basePaginationUnit,
      cursorLimitPublished: this.basePaginationUnit
    };
  }

  loadMorePosts = publishStatus => {
    const cursorType: any = publishStatus === "draft" ? "cursorLimitDraft" : "cursorLimitPublished";
    const currentTotal = this.state[cursorType];
    const newTotal = currentTotal + this.basePaginationUnit;
    log.info(`ProfilePosts.loadMorePosts()`, publishStatus, cursorType, newTotal);
    this.setState({ [cursorType]: newTotal });
  };

  layout() {
    const { classes, draftPosts, publishedPosts, userId } = this.props;
    const { cursorLimitPublished, cursorLimitDraft } = this.state;
    return (
      <div className={classes.postListRoot}>
        <PostList loadMorePosts={this.loadMorePosts} cursorLimit={cursorLimitDraft} userId={userId} publishStatus="draft" />
        <PostList loadMorePosts={this.loadMorePosts} cursorLimit={cursorLimitPublished} userId={userId} publishStatus="published" />
      </div>
    );
  }

  render() {
    return (
      <div className="container">
        <Transition>{this.layout()}</Transition>
      </div>
    );
  }
}

export default connect()(
  withTracker(props => {
    const postsDataHandle = Meteor.subscribe("posts");
    //const commentsHandle = Meteor.subscribe("comments");
    //let post: any;
    let profileBelongsToUser = false;
    const profileUserId = props.match.params.userId;

    //log.info(`ProfilePosts tracker`, profileUserId);

    if (profileUserId !== props.userId) {
      profileBelongsToUser = true;
    }

    //let totalPosts: number = 0;
    let publishedPosts: any = [];
    let draftPosts: any = [];

    const options = {
      sort: { created: -1 },
      limit: props.cursorLimit
    };

    if (postsDataHandle.ready()) {
      //totalPosts = Posts.find({ publish: true }).count();
      publishedPosts = Posts.find({ publish: true }, options).fetch();
      if (profileBelongsToUser) {
        draftPosts = Posts.find({ publish: false }, options).fetch();
      }
    }

    return {
      draftPosts: draftPosts,
      publishedPosts: publishedPosts
    };
  })(withStyles(styles, { withTheme: true })(ProfilePosts))
);
