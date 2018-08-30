////<reference path="index.d.ts"/>
import * as React from "react";
import PropTypes from "prop-types";
import Icon from "@material-ui/core/Icon";
import { Link } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import * as dateFormat from "dateformat";
import BlockIcon from "@material-ui/icons/Block";
import CancelIcon from "@material-ui/icons/Cancel";

import PostForm from "../admin/forms/PostForm";
import * as PageMethods from "../../api/pages/methods";
import * as Library from "../../modules/library";

import MetaWrapper from "./MetaWrapper";
import Author from "../pages/Blog/Author";
import CommentCount from "../pages/Blog/CommentCount";
import RenderImage from "../admin/components/RenderImage";
import { can as userCan } from "../../modules/user";
import { deletePost } from "../../api/posts/methods";

interface IProps {
  history: PropTypes.object.isRequired;
  classes: PropTypes.object.isRequired;
  systemSettings: PropTypes.object.isRequired;
  dispatch: PropTypes.object.isRequired;
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
    //marginTop: "-0.75rem",
    marginBottom: "0.25rem",
    fontSize: "0.9rem"
  },
  cancel: {
    color: "black",
    width: "5rem"
  }
});

class PageContent extends React.Component<IProps, IState> {
  //editingType = { edit: false, new: false };
  //fieldsArray = ["body", "title"];
  editInProgress = false;

  constructor(props) {
    super(props);
    //this.handleChange = this.handleChange.bind(this);
    //this.handleSetState = this.handleSetState.bind(this);
    // this.handleSubmit = this.handleSubmit.bind(this);
    let mapped: any;
    // mapped = this.fieldMapper("init");
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

  /*
  initState = () => {
    const allowCreate = !(this.props.contentType === "comments");
    log.info(`PageContent.initState() - allowCreate = `, allowCreate);

    this.setState({
      allowSubmit: true,
      updateDone: false,
      queryLimit: 1,
      expanded: "",
      block: false,
      showBulkOptions: false,
      showFilterOptions: false,
      selectedPosts: {},
      showNewPost: false,
      imageIDedit: "",
      imageIDnew: ""
    });
    this.props.dispatch({ type: "LOAD_INIT" });
    this.props.dispatch({ type: "FILTER_INIT" });
  };
  */

  /*
  fieldMapper(type, props = "") {
    let obj = {};
    if (type === "init") {
      this.fieldsArray.forEach(element => (obj[element] = ""));
      obj["edit"] = false;
      obj["allowSubmit"] = true;
      obj["imageIDedit"] = "";
      obj["imageIDnew"] = "";
      obj["showNewPost"] = true;
    } else if (type === "props") {
      this.fieldsArray.forEach(element => (obj[element] = props[element]));
    } else if (type === "method") {
      this.fieldsArray.forEach(element => (obj[element] = this.state[element]));
      obj["id"] = this.props.post._id;
    }
    return obj;
  }
  */

  /*
  componentDidUpdate(prevProps) {
    if (prevProps.contentType !== this.props.contentType) {
      //log.info(`Posts.componentDidUpdate`, prevProps, this.props);
      this.initState();
    }
  }
  */

  /*
  componentDidMount() {
    if (this.props.post) {
       this.initState();
    }
  }
  */

  /*
  UNSAFE_componentWillMount() {
    this.props.dispatch({ type: "LOAD_INIT" });
    this.props.dispatch({ type: "FILTER_INIT" });
  }
  */

  /*
  initState(props) {
    let obj = this.fieldMapper("props", props); //this.fieldsToProps(props);
    this.setState(obj);
  }
  */

  /*
  componentWillReceiveProps(nextProps) {
    if (nextProps.post !== this.props.post) {
      this.initState(nextProps.post);
    }
  }
  */

  /*
  handleChange(e) {
    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let id = target.id;
    this.setState({ [id]: value });
  }
  */

  /*
  handleSetState(sVar, sVal) {
    this.setState({ [sVar]: sVal });
  }
  */

  /*
  handleSubmit() {
    const { updateMethod } = this.props;
    let pageFields = this.fieldMapper("method");
    this.setState({ allowSubmit: false });
    Meteor.call(updateMethod, pageFields, err => {
      this.setState({ allowSubmit: true });
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`[${updateMethod}] failed`, err);
      } else {
        this.setState({ edit: false });
      }
    });
  }
  */

  /*
  updateImageId = (props: { image_id: string; dataObj?: any }) => {
    let targetName: any;
    targetName = props.dataObj ? "imageIDedit" : "imageIDnew";
    this.setState({ [targetName]: props.image_id });
    log.info(`updateImageId`, props, this.state);
  };
  */

  editLayout() {
    const { post, imageUpdateMethod } = this.props;
    log.info(`PageContent.editLayout()`, this.props);
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
    //this.setState({ showForm: false });
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
        //this.props.commentEdited();
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

  headingReadMode() {
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

  getLayout() {
    const { classes, post, contentType } = this.props;
    const { showForm } = this.state;

    let layout: any;

    if (showForm) {
      //const type
      layout = this.editLayout();
    } else if (post) {
      // VIEW PAGE
      layout = (
        <div>
          {this.headingReadMode()}

          {contentType === "post" ? (
            <div>
              <h6>
                <Author authorId={post.authorId} />
              </h6>
              <h6>
                {dateFormat(post.created, "dd mmmm yyyy")} | <CommentCount postId={post._id} /> Comments
              </h6>
              {post.tags && <h6>{this.renderTags(post.tags)}</h6>}
            </div>
          ) : (
            ""
          )}

          <div dangerouslySetInnerHTML={this.createMarkup(post.body)} />
        </div>
      );
    } else {
      layout = <div>Loading...</div>;
    }

    return layout;
  }

  getMeta() {
    const { post } = this.props;
    return (
      <MetaWrapper
        path={this.props.history.location.pathname}
        settings={this.props.systemSettings}
        customSettings={post}
      />
    );
  }

  /*
  getMetaz() {
    const { post } = this.props;
    const path = this.props.history.location.pathname;
    const meta = post ? <Meta location={path} settings={post} /> : "";
    return meta;
  }
  */

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
