///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import * as dateFormat from "dateformat";
//import { Button } from "reactstrap";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import Transition from "../../partials/Transition";
import { Posts } from "../../../api/posts/publish";
import MetaWrapper from "../../partials/MetaWrapper";
import Author from "./Author";
import CommentCount from "./CommentCount";
import Spinner from "../../partials/Spinner";
//import Splash from "../../partials/Splash";

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
  history: PropTypes.object.isRequired;
  systemSettings: PropTypes.object.isRequired;
  classes: any;
  posts: any;
  dispatch: any;
  totalPosts: number;
  cursorLimit: number;
}

interface IState {}

class BlogIndex extends React.Component<IProps, IState> {
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
          <h6>
            <Author authorId={post.authorId} />
          </h6>
          <h6>
            {dateFormat(post.created, "dd mmmm yyyy")} | <CommentCount postId={post._id} /> Comments
          </h6>
          <div dangerouslySetInnerHTML={this.renderBody(post)} />
          {this.readMoreLink(post)}
          <hr />
        </div>
      );
    }

    return layout;
  }

  mapPosts() {
    const { classes, posts } = this.props;
    //log.info(`BlogIndex mapPosts`, this.props);
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
        <button type="button" className="btn btn-load-more btn-sm" onClick={this.loadMore}>
          Load More
        </button>
      </div>
    );
  }

  layout() {
    const { classes, posts, totalPosts, cursorLimit } = this.props;

    return (
      <div>
        {this.mapPosts()}
        {totalPosts > cursorLimit ? this.loadMoreButton() : ""}
      </div>
    );
  }

  getMeta() {
    return (
      <MetaWrapper path={this.props.history.location.pathname} settings={this.props.systemSettings} title="Blog Page" />
    );
  }

  render() {
    const { totalPosts, posts } = this.props;
    return posts.length ? (
      <div className="container page-content">
        <Transition>
          {this.layout()}
          {this.getMeta()}
        </Transition>
      </div>
    ) : (
      <Spinner />
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
    const commentsHandle = Meteor.subscribe("comments");
    let PostsDataHandle = Meteor.subscribe("posts");
    let totalPosts: number = 0;
    let posts: any = [];
    const options = {
      sort: { created: -1 },
      limit: props.cursorLimit
    };

    if (PostsDataHandle.ready()) {
      totalPosts = Posts.find({ publish: true }).count();
      posts = Posts.find({ publish: true }, options).fetch();
    }

    return { posts: posts, totalPosts: totalPosts };
  })(withStyles(styles, { withTheme: true })(BlogIndex))
);
