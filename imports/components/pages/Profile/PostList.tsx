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

let styles: any;
styles = theme => ({
  root: {
    marginBottom: "2rem"
  },
  loadMore: {
    marginTop: "1rem",
    textAlign: "center"
  },
  postListItem: {
      marginBottom: "1rem"
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

    this.heading = this.props.publishStatus === "draft" ? "Draft" : "Published";

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
    return posts.length > 0 ? (
      <div className={classes.root}>
        <h2>{this.heading}</h2>
        <div className={classes.profilePostSection}>{this.mapPosts()}</div>
        {totalPosts > cursorLimit ? this.loadMoreButton() : ""}
      </div>
    ) : (
      ""
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
