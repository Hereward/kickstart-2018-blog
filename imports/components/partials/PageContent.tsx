////<reference path="index.d.ts"/>
import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import * as dateFormat from "dateformat";
import { Pages } from "../../api/pages/publish";
import Transition from "../partials/Transition";
import PostForm from "../forms/PostForm";
import * as PageMethods from "../../api/pages/methods";
import * as Library from "../../modules/library";
import * as Icon from "../../modules/icons";
import * as User from "../../modules/user";
import Spinner from "./Spinner";

interface IProps {
  post: any;
  updateMethod: string;
  contentType: string;
  permissionThreshold?: string;
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
    log.info(`PageContent.editLink()`, permissionThreshold);
    if (permissionThreshold === "creator") {
      allow = User.can({ threshold: "creator", owner: this.props.post.author });
    } else if (User.can({ threshold: "admin" })) {
      allow = true;
    }
    return allow ? <Icon.EditIcon onClick={this.handleSetState} stateName="edit" /> : "";
  }

  getLayout() {
    const { post } = this.props;
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
              {this.props.post.title} {this.editLink()}
            </h1>
            {this.props.contentType === "post" ? (
              <div>{dateFormat(post.published, "dd mmmm yyyy")} | 0 Comments</div>
            ) : (
              ""
            )}
            <div dangerouslySetInnerHTML={this.createMarkup(post.body)} />
          </div>
        );
      }
    } else {
      // LOADING
      layout = <Spinner caption="loading" type="component" />;
    }

    return layout;
  }

  render() {
    let layout = this.getLayout();
    return <div className="container page-content">{layout}</div>;
  }
}
