import * as React from "react";
import * as dateFormat from "dateformat";
import { Link } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import Author from "../Blog/Author";
import CommentCount from "../Blog/CommentCount";
import { Posts } from "../../../api/posts/publish";
import Spinner from "../../partials/Spinner";
import { Divider } from "@material-ui/core";

let styles: any;
styles = theme => ({
  mainHeading: {
    //border: "1px solid rgba(0, 0, 0, 0.1)",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    padding: "0.5rem",
    fontSize: "1rem",
    textTransform: "uppercase",
    textAlign: "center",
    borderRadius: "5px"
  },
  root: {
    marginBottom: "2rem"
  },
  loadMore: {
    marginTop: "1rem",
    textAlign: "center"
  },
  postListItem: {
    marginBottom: "1rem"
  },
  readMore: {
    //marginLeft: "auto",
    marginTop: "1rem",
    display: "block",
    textAlign: "left"
  }
});

interface IProps {
  classes: PropTypes.object.isRequired;
  loadMorePosts: PropTypes.object.isRequired;
  dispatch: any;
  totalPosts: number;
  posts: PropTypes.object.isRequired;
  cursorLimit: number;
  status: string;
  userId: string;
  publishStatus: string;
}

interface IState {}

class PostList extends React.Component<IProps, IState> {
  heading: string;
  constructor(props) {
    super(props);

    this.heading = this.props.publishStatus === "draft" ? "draft posts" : "published posts";

    this.state = {};
  }

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

  loadMoreButton() {
    const { classes, totalPosts, posts, cursorLimit, loadMorePosts, publishStatus } = this.props;
    return (
      <div className={classes.loadMore}>
        <hr />
        <button type="button" className="btn btn-load-more btn-sm" onClick={() => loadMorePosts(publishStatus)}>
          Load More
        </button>
      </div>
    );
  }

  mapPosts() {
    log.info(`ProfilePosts.mapPosts()`, this.props);
    const { classes, totalPosts, posts, cursorLimit } = this.props;
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

  layout() {
    const { classes, totalPosts, posts, cursorLimit } = this.props;
    log.info(`PostList.render()`, posts, totalPosts, cursorLimit);
    const totalPostsLabel = totalPosts ? ` (${totalPosts})` : "";
    return (
      <div className={classes.root}>
        <h2 className={classes.mainHeading}>
          {this.heading}{totalPostsLabel}
        </h2>
        {posts.length > 0 ? (
          <div>
            <div className={classes.profilePostSection}>{this.mapPosts()}</div>
            {totalPosts > cursorLimit ? this.loadMoreButton() : ""}
          </div>
        ) : (
          <Spinner />
        )}
      </div>
    );
  }

  render() {
    return this.layout();
  }
}

export default connect()(
  withTracker(props => {
    const PostsHandle = Meteor.subscribe("posts");
    let posts: any = [];
    let totalPosts = 0;
    const options = {
      sort: { created: -1 },
      limit: props.cursorLimit
    };
    const publishFilter = props.publishStatus === "published";
    totalPosts = Posts.find({ publish: publishFilter, authorId: props.userId }).count();
    posts = Posts.find({ publish: publishFilter, authorId: props.userId }, options).fetch();
    log.info(`PostList.tracker() publish=[${publishFilter}]`, posts, props);
    return {
      posts: posts,
      totalPosts: totalPosts
    };
  })(withStyles(styles, { withTheme: true })(PostList))
);
