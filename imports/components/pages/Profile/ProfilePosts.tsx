///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import { Meteor } from "meteor/meteor";
import Icon from "@material-ui/core/Icon";
import PropTypes from "prop-types";

import * as dateFormat from "dateformat";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import { Posts } from "../../../api/posts/publish";
import Transition from "../../partials/Transition";
import Author from "../Blog/Author";
import CommentCount from "../Blog/CommentCount";

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
      cursorLimitPublished: this.basePaginationUnit,
    };
  }

  loadMorePosts = (cursorType) => {
    const currentTotal = this.state[cursorType];
    const newTotal = currentTotal + this.basePaginationUnit;
    this.setState({ [cursorType]: newTotal });
  };

  renderBody(post) {
    return { __html: post.truncatedBody };
  }

  readMoreLink(post) {
    const { classes } = this.props;
    return (
      <Link className={classes.readMore} to={`/blog/${post.slug}`}>
        Read More &rarr;
      </Link>
    );
  }

  renderPost(post: any) {
    const { classes } = this.props;
    let layout: any = "";
    if (post) {
      layout = (
        <div>
          <h3 className="blogTitle">
            <Link to={`blog/${post.slug}`}>{post.title}</Link>
          </h3>
          <h6>
            <Author authorId={post.authorId} />
          </h6>
          <h6>
            {dateFormat(post.created, "dd mmmm yyyy")} | <CommentCount postId={post._id} /> Comments
          </h6>
          <div dangerouslySetInnerHTML={this.renderBody(post)} />
          {this.readMoreLink(post)}
        </div>
      );
    }

    return layout;
  }

  mapPosts(type) {
    log.info(`ProfilePosts.mapPosts()`, type, this.props);
    const { classes, draftPosts, publishedPosts } = this.props;
    const posts = type === "draft" ? draftPosts : publishedPosts;
    const mapped = posts.map(post => {
      const layout = (
        <div className={classes.postListItem} key={post._id}>
          {this.renderPost(post)}
        </div>
      );
      return layout;
    });

    return mapped;
  }

  layout() {
    const { classes, draftPosts, publishedPosts } = this.props;
    return (
      <div className={classes.postListRoot}>
        {draftPosts.length > 0 && (
          <div>
            <h2>Drafts</h2>
            <div className={classes.profilePostSection}>{this.mapPosts("draft")}</div>
          </div>
        )}
        {publishedPosts.length > 0 && (
          <div>
            <hr />
            <h2>Published</h2>
            <div className={classes.profilePostSection}>{this.mapPosts("published")}</div>
          </div>
        )}
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
