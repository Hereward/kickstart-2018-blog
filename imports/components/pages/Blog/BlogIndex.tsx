///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import * as dateFormat from "dateformat";
import Button from "@material-ui/core/Button";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import Transition from "../../partials/Transition";
import { Posts } from "../../../api/posts/publish";
import { Comments } from "../../../api/comments/publish";
import { Profiles } from "../../../api/profiles/publish";

let styles: any;

styles = theme => ({
  loadMore: {
    marginTop: "1rem",
    textAlign: "center"
  },
  readMore: {
    marginLeft: "auto",
    marginTop: "-0.5rem",
    display: "block",
    textAlign: "right"
  }
});

interface IProps {
  classes: any;
  posts: any;
  dispatch: any;
  totalPosts: number;
  cursorLimit: number;
}

interface IState {}

class Blog extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  UNSAFE_componentWillMount() {
    this.props.dispatch({ type: "LOAD_INIT" });
  }

  loadMore = () => {
    this.props.dispatch({ type: "LOAD_MORE" });
  };

  readMoreLink(post) {
    const { classes } = this.props;
    return (
      <Link className={classes.readMore} to={`blog/${post.slug}`}>
        Read More &rarr;
      </Link>
    );
  }

  renderBody(post) {
    return { __html: post.truncatedBody };
  }

  renderPost(post: any) {
    const { classes } = this.props;
    let layout: any = "";
    if (post) {
      layout = (
        <div>
          <h2 className="blogTitle">
            <Link to={`blog/${post.slug}`}>{post.title}</Link>
          </h2>
          <h6>{Profiles.findOne({ owner: post.authorId }).screenName}</h6>
          <h6>
            {dateFormat(post.published, "dd mmmm yyyy")} | {Comments.find({ postId: post._id }).count()} Comments
          </h6>
          <div dangerouslySetInnerHTML={this.renderBody(post)} />
          {this.readMoreLink(post)}
        </div>
      );
    }

    return layout;
  }

  mapPosts(posts) {
    const { classes } = this.props;
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

  loadMoreButton() {
    const { classes } = this.props;
    return (
      <div className={classes.loadMore}>
        <hr />
        <Button variant="outlined" onClick={this.loadMore} size="small">
          Load More
        </Button>
      </div>
    );
  }

  layout() {
    const { classes, posts, totalPosts, cursorLimit } = this.props;
    return (
      <div>
        {posts ? <div>{this.mapPosts(posts)}</div> : ""}
        {totalPosts > cursorLimit ? this.loadMoreButton() : ""}
      </div>
    );
  }

  render() {
    return (
      <Transition>
        <div className="container page-content">{this.layout()}</div>
      </Transition>
    );
  }
}

const mapStateToProps = state => {
  return {
    cursorLimit: state.cursorLimit,
    filters: state.filters
  };
};

export default connect(mapStateToProps)(
  withTracker(props => {
    //log.info(`BlogIndex tracker`, props);
    const commentsHandle = Meteor.subscribe("comments");
    let PostsDataReady = Meteor.subscribe("posts");
    let totalPosts: number = 0;
    let posts: any;
    const options = {
      sort: { published: -1 },
      limit: props.cursorLimit
    };

    if (PostsDataReady) {
      totalPosts = Posts.find().count();
      posts = Posts.find({}, options).fetch();
    }
    return { posts: posts, totalPosts: totalPosts };
  })(withStyles(styles, { withTheme: true })(Blog))
);
