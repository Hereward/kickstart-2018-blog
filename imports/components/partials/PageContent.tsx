////<reference path="index.d.ts"/>
import * as React from "react";
import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import * as dateFormat from "dateformat";
import { Pages } from "../../api/pages/publish";
import Transition from "../partials/Transition";
import PostForm from "../forms/PostForm";
import * as PageMethods from "../../api/pages/methods";
import * as Library from "../../modules/library";
import * as Icon from "../../modules/icons";
import * as User from "../../modules/user";
import MetaWrapper from "./MetaWrapper";
import Author from "../pages/Blog/Author";
import CommentCount from "../pages/Blog/CommentCount";

interface IProps {
  history: PropTypes.object.isRequired;
  systemSettings: PropTypes.object.isRequired;
  post: any;
  updateMethod: string;
  contentType: string;
  permissionThreshold?: string;
  totalComments?: number;
  author?: string;
}

interface IState {
  edit: boolean;
  allowSubmit: boolean;
}

export default class PageContent extends React.Component<IProps, IState> {
  fieldsArray = ["body", "title"];

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSetState = this.handleSetState.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    let mapped: any;
    mapped = this.fieldMapper("init");
    this.state = mapped;
  }

  fieldMapper(type, props = "") {
    let obj = {};
    if (type === "init") {
      this.fieldsArray.forEach(element => (obj[element] = ""));
      obj["edit"] = false;
      obj["allowSubmit"] = true;
    } else if (type === "props") {
      this.fieldsArray.forEach(element => (obj[element] = props[element]));
    } else if (type === "method") {
      this.fieldsArray.forEach(element => (obj[element] = this.state[element]));
      obj["id"] = this.props.post._id;
    }
    return obj;
  }

  initState(props) {
    let obj = this.fieldMapper("props", props); //this.fieldsToProps(props);
    this.setState(obj);
  }

  componentDidMount() {
    if (this.props.post) {
      this.initState(this.props.post);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.post !== this.props.post) {
      this.initState(nextProps.post);
    }
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let id = target.id;
    this.setState({ [id]: value });
  }

  handleSetState(sVar, sVal) {
    this.setState({ [sVar]: sVal });
  }

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

  editLayout() {
    return (
      <PostForm
        allowSubmit={this.state.allowSubmit}
        postObj={this.props.post}
        handleChange={this.handleChange}
        handleSubmit={this.handleSubmit}
        handleSetState={this.handleSetState}
      />
    );
  }

  createMarkup(html) {
    return { __html: html };
  }

  editLink() {
    let allow: boolean = false;
    const { permissionThreshold } = this.props;
    if (permissionThreshold === "creator") {
      allow = User.can({ threshold: "creator", owner: this.props.post.authorId });
    } else if (User.can({ threshold: "admin" })) {
      allow = true;
    }
    return allow ? <Icon.EditIcon onClick={this.handleSetState} stateName="edit" /> : "";
  }

  getLayout() {
    const { post, totalComments, author } = this.props;
    let layout: any;
    if (this.props.post) {
      if (this.state.edit) {
        // EDIT
        layout = (
          <div>
            <h2>
              Edit <Icon.CancelEditIcon className="cancel-edit-icon" onClick={this.handleSetState} stateName="edit" />
            </h2>
            <div>{this.editLayout()}</div>
          </div>
        );
      } else {
        // VIEW PAGE
        layout = (
          <div>
            <h1>
              {post.title} {this.editLink()}
            </h1>
            {this.props.contentType === "post" ? (
              <div>
                <h6>
                  <Author authorId={post.authorId} />
                </h6>
                <h6>
                  {dateFormat(post.created, "dd mmmm yyyy")} | <CommentCount postId={post._id} /> Comments
                </h6>
              </div>
            ) : (
              ""
            )}
            <div dangerouslySetInnerHTML={this.createMarkup(post.body)} />
          </div>
        );
      }
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
      <Transition>
        <div className="container page-content">
          {this.getMeta()}
          {layout}
        </div>
      </Transition>
    );
  }
}
