////<reference path="index.d.ts"/>
import * as React from "react";
import { Meteor } from "meteor/meteor";
import * as PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import * as dateFormat from "dateformat";
import BlockIcon from "@material-ui/icons/Block";
import CancelIcon from "@material-ui/icons/Cancel";

import PostForm from "../admin/forms/PostForm";
import * as Library from "../../modules/library";
import MetaWrapper from "./MetaWrapper";
import Author from "../pages/Blog/Author";
import CommentCount from "../pages/Blog/CommentCount";
import { can as userCan } from "../../modules/user";
import { deletePost } from "../../api/posts/methods";
import EditorialImage from "../pages/Blog/EditorialImage";
import CommentBlogSection from "../comments/CommentBlogSection";
import Share from "./Share";

interface IProps {
  history: PropTypes.object.isRequired;
  classes: PropTypes.object.isRequired;
  systemSettings: PropTypes.object.isRequired;
  dispatch: PropTypes.object.isRequired;
  userId: string;
  post?: any;
  updateMethod: string;
  permissionThreshold?: string;
  totalComments?: number;
  author?: string;
  imageUpdateMethod: string;
  postUpdateMethod: string;
  postCreateMethod: string;
  PostsDataSrc: any;
  subscription: string;
  totalPosts: number;
  cursorLimit: number;
  contentType: string;
  showFormInit: boolean;
  hasComments?: boolean;
}

interface IState {
  [x: number]: any;
  allowSubmit: boolean;
  updateDone: boolean;
  queryLimit: number;
  expanded: string;
  block: boolean;
  showBulkOptions: boolean;
  showFilterOptions: boolean;
  selectedPosts: any;
  showNewPost: boolean;
  showForm: boolean;
}

let styles: any;

styles = theme => ({
  editPost: {
    marginBottom: "0.25rem",
    fontSize: "0.9rem"
  },
  cancel: {
    color: "black",
    width: "5rem"
  },
  tags: {
    marginTop: "1rem"
  }
});

class PageContent extends React.Component<IProps, IState> {
  editInProgress = false;

  constructor(props) {
    super(props);

    let mapped: any;
    this.state = {
      allowSubmit: true,
      updateDone: false,
      queryLimit: 1,
      expanded: "",
      block: false,
      showBulkOptions: false,
      showFilterOptions: false,
      selectedPosts: {},
      showNewPost: false,
      showForm: props.showFormInit
    };

    this.props.dispatch({ type: "LOAD_INIT" });
    this.props.dispatch({ type: "FILTER_INIT" });
  }

  editLayout() {
    const { post, imageUpdateMethod, contentType } = this.props;
    const headingLabel = post ? "Edit Post" : "New Post";
    return (
      <div>
        {this.headingEditMode(headingLabel)}

        <PostForm
          imageUpdateMethod={imageUpdateMethod}
          hasImage={true}
          handleEditing={this.handleEditing}
          postCreateMethod={this.props.postCreateMethod}
          postUpdateMethod={this.props.postUpdateMethod}
          settingsObj={post}
          hasTags={true}
          editingExistingData={post ? true : false}
          handleNewPostCreated={this.handleNewPostCreated}
          handlePostUpdated={this.handlePostUpdated}
          editMode="creator"
          contentType={contentType}
        />
      </div>
    );
  }

  createMarkup(html) {
    return { __html: html };
  }

  miniAlert = (message = "") => {
    this.props.dispatch({ type: "MINI_ALERT_ON", message: message });
  };

  handleNewPostCreated = pageFields => {
    const { history } = this.props;
    history.push(`/blog/${pageFields.slug}`);
  };

  handlePostUpdated = () => {
    this.setState({ showForm: false });
  };

  handleEditing = (state, editingExistingData: boolean) => {
    this.editInProgress = state;
  };

  toggleForm = () => {
    const vis = !this.state.showForm;
    if (!vis && this.editInProgress === true) {
      Library.confirmDialog({ title: "Discard changes?", message: "off" }).then(result => {
        if (result) {
          this.setState({
            showForm: vis
          });
          this.editInProgress = false;
        }
      });
    } else {
      this.setState({ showForm: vis });
    }
  };

  doDeletePost = () => {
    const { post, history } = this.props;
    deletePost.call({ id: post._id }, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        log.error(`deletePost failed`, err);
      } else {
        this.miniAlert(`Your post has been deleted.`);
        history.push("/");
      }
    });
  };

  confirmDelete = () => {
    Library.confirmDialog().then(result => {
      if (result) {
        this.doDeletePost();
      }
    });
  };

  edit() {
    const { classes, post } = this.props;
    const { showForm } = this.state;
    if (showForm && !post) {
      return "";
    } else {
      const editLabel = showForm ? "cancel" : "edit";
      return userCan({ threshold: "creator", owner: post.authorId }) ? (
        showForm ? (
          <Link className={`${classes.cancel} d-flex justify-content-between`} to="#" onClick={this.toggleForm}>
            <div>
              <CancelIcon className="svg-text-icon" />
            </div>{" "}
            <div>Cancel</div>
          </Link>
        ) : (
          <div className={classes.editPost}>
            <Link to="#" onClick={this.toggleForm}>
              {editLabel}
            </Link>{" "}
            |{" "}
            <Link to="#" onClick={this.confirmDelete}>
              delete
            </Link>
          </div>
        )
      ) : (
        ""
      );
    }
  }

  headingEditMode(label) {
    return (
      <div>
        <h2>{label}</h2>
        {this.edit()}
      </div>
    );
  }

  postTitle() {
    const { classes, post } = this.props;
    const unpublishedIcon = post.publish ? (
      ""
    ) : (
      <span>
        <BlockIcon />{" "}
      </span>
    );
    return (
      <div>
        <h1>
          {unpublishedIcon}
          {post.title}
        </h1>
        {this.edit()}
      </div>
    );
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

  comments() {
    let layout: any = "";
    if (this.props.post) {
      layout = <CommentBlogSection userId={this.props.userId} postId={this.props.post._id} />;
    }
    return layout;
  }

  getLayout() {
    const { classes, post, contentType, hasComments } = this.props;
    const { showForm } = this.state;

    let layout: any;

    if (showForm) {
      layout = this.editLayout();
    } else if (post) {
      // VIEW PAGE
      const quote = Library.formatPlainText({ text: post.body, wordCount: 100 });

      layout = (
        <div>
          {this.postTitle()}

          {contentType === "posts" ? (
            <div>
              <h6 className="author-heading">
                <Author authorId={post.authorId} />
              </h6>
              <h6>
                {dateFormat(post.created, "dd mmmm yyyy")} | <CommentCount postId={post._id} /> Comments
              </h6>
              {post.tags && <h6 className={classes.tags}>{this.renderTags(post.tags)}</h6>}
              <Share quote={quote} title={post.title} />
            </div>
          ) : (
            ""
          )}
          {post.image_id && post.showImage && <EditorialImage imageId={post.image_id} />}
          <article dangerouslySetInnerHTML={this.createMarkup(post.body)} />
          <div className="fb-quote" />
          {hasComments && this.comments()}
        </div>
      );
    } else {
      layout = <div>Loading...</div>;
    }

    return layout;
  }

  getMeta() {
    const { post } = this.props;
    return <MetaWrapper settings={this.props.systemSettings} customSettings={post} />;
  }

  render() {
    const { post } = this.props;
    let layout = this.getLayout();
    return (
      <div className="page-content">
        {this.getMeta()}
        {layout}
      </div>
    );
  }
}

export default connect()(
  withTracker(props => {
    return {};
  })(withStyles(styles, { withTheme: true })(PageContent))
);
