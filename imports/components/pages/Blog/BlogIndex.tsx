///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import { Link } from "react-router-dom";
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import * as dateFormat from "dateformat";
import Button from "@material-ui/core/Button";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import Transition from "../../partials/Transition";
import { Posts } from "../../../api/posts/publish";
import MetaWrapper from "../../partials/MetaWrapper";
import Author from "./Author";
import CommentCount from "./CommentCount";
import Spinner from "../../partials/Spinner";
import EditorialImage from "./EditorialImage";
import Share from "../../partials/Share";
import * as Library from "../../../modules/library";

let styles: any;

styles = theme => ({
  mainHeading: {
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    padding: "0.5rem",
    fontSize: "1rem",
    textTransform: "uppercase",
    textAlign: "center",
    borderRadius: "5px"
  },
  loadMore: {
    marginTop: "1rem",
    textAlign: "center"
  },
  readMore: {
    marginLeft: "auto",
    marginTop: "-0.5rem",
    display: "block",
    textAlign: "right"
  },
  tags: {
    marginTop: "1rem"
  }
});

interface IProps {
  history: PropTypes.object.isRequired;
  systemSettings: PropTypes.object.isRequired;
  classes: PropTypes.object.isRequired;
  posts: any;
  dispatch: any;
  totalPosts: number;
  cursorLimit: number;
  urlTag: string;
  location: PropTypes.object.isRequired;
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

  componentDidUpdate(prevProps) {
    if (this.props.urlTag !== prevProps.urlTag) {
      this.props.dispatch({ type: "LOAD_INIT" });
    }
  }

  loadMore = () => {
    this.props.dispatch({ type: "LOAD_MORE" });
  };

  readMoreLink(post) {
    const { classes } = this.props;
    return (
      <Link className={classes.readMore} to={`/blog/${post.slug}`}>
        Read More &rarr;
      </Link>
    );
  }

  mainHeading() {
    const { classes, urlTag } = this.props;
    return <h1 className="feature-heading">{urlTag ? `blog posts tagged [${urlTag}]` : "blog posts"}</h1>;
  }

  renderBody(post) {
    return { __html: post.truncatedBody };
  }

  renderTags(tags) {
    const { classes } = this.props;
    const tagArray = tags.split(" ");
    const mapped = tagArray.map(tag => {
      const layout = (
        <span className={classes.tagItem} key={`tag_${tag}`}>
          <Link to={`/blog/tag/${tag}`}>{tag}</Link>{" "}
        </span>
      );
      return layout;
    });

    return mapped;
  }

  image() {}

  renderPost(post: any) {
    const { classes, location } = this.props;
    let layout: any = "";
    const url = `${window.location.hostname}${location.pathname}/${post.slug}`;
    const quote = Library.formatPlainText({ text: post.body, wordCount: 100 });
    if (post) {
      layout = (
        <div>
          <h2 className="blogTitle">
            <Link to={`/blog/${post.slug}`}>{post.title}</Link>
          </h2>
          <h6 className="author-heading">
            <Author authorId={post.authorId} />
          </h6>
          <h6>
            {dateFormat(post.created, "dd mmmm yyyy")} | <CommentCount postId={post._id} /> Comments
          </h6>
          {post.tags && <h6 className={classes.tags}>{this.renderTags(post.tags)}</h6>}
          <Share url={url} quote={quote} title={post.title} />
          {post.image_id && post.showImage && <EditorialImage imageId={post.image_id} />}
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

  loadMoreButtonBS() {
    const { classes } = this.props;
    return (
      <div className={classes.loadMore}>
        <button type="button" className="btn btn-load-more btn-sm" onClick={this.loadMore}>
          Load More
        </button>
      </div>
    );
  }

  loadMoreButton() {
    const { classes } = this.props;
    return (
      <div className={classes.loadMore}>
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
        {this.mainHeading()}
        {this.mapPosts()}
        {totalPosts > cursorLimit ? this.loadMoreButton() : ""}
      </div>
    );
  }

  getMeta() {
    return <MetaWrapper settings={this.props.systemSettings} title="Blog Page" />;
  }

  render() {
    const { totalPosts, posts } = this.props;
    return posts.length ? (
      <Transition>
        <div className="page-content">
          {this.layout()}
          {this.getMeta()}
        </div>
      </Transition>
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
    let totalPosts: number = 0;
    let posts: any = [];
    let searchCriteria: any = {};
    const urlTag = props.match.params.tag;
    const options = {
      sort: { created: -1 },
      limit: props.cursorLimit
    };

    if (urlTag) {
      const findRegex = { $regex: urlTag, $options: "i" };
      searchCriteria.tags = findRegex;
    }
    totalPosts = Posts.find(searchCriteria).count();
    posts = Posts.find(searchCriteria, options).fetch();

    return { posts: posts, totalPosts: totalPosts, urlTag: urlTag };
  })(withStyles(styles, { withTheme: true })(BlogIndex))
);
