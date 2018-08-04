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
    return <Link className={classes.readMore} to={`blog/${post.slug}`}>Read More &rarr;</Link>; 
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
          <div>{dateFormat(post.published, "dd mmmm yyyy")} | 0 Comments</div>
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

  layout() {
    const { classes } = this.props;
    const { posts } = this.props;
    return (
      <div>
        {posts ? <div>{this.mapPosts(posts)}</div> : ""}
        <div className={classes.loadMore}>
          <hr />
          <Button variant="outlined" onClick={this.loadMore} size="small">
            More Results
          </Button>
        </div>
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
    //log.info(`BlogIndex.tracker()`, props);
    let PostsDataReady = Meteor.subscribe("posts");
    let posts: any;
    const options = {
      sort: { published: -1 },
      limit: props.cursorLimit
    };

    if (PostsDataReady) {
      posts = Posts.find({}, options).fetch();
    }
    return { posts: posts };
  })(withStyles(styles, { withTheme: true })(Blog))
);
