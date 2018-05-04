///<reference path="../../../index.d.ts"/>

import * as React from "react";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Pages } from "../../api/pages/publish";
import Transition from "../partials/Transition";
import PageForm from "../forms/PageForm";
import * as PageMethods from "../../api/pages/methods";
import * as Library from "../../modules/library";
import * as Icon from "../../modules/icons";
import * as User from "../../modules/user";
import Spinner from "./Spinner";

interface IProps {
  page: any;
}

interface IState {
  edit: boolean;
  allowSubmit: boolean;
}

export default class PageContent extends React.Component<IProps, IState> {
  fieldsArray = ["body", "heading"];

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
      obj["id"] = this.props.page._id;
    }
    return obj;
  }

  initState(props) {
    let obj = this.fieldMapper("props", props); //this.fieldsToProps(props);
    this.setState(obj);
  }

  componentDidMount() {
    if (this.props.page) {
      this.initState(this.props.page);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.page !== this.props.page) {
      this.initState(nextProps.page);
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
    let pageFields = this.fieldMapper("method");
    this.setState({ allowSubmit: false });
    PageMethods.updatePage.call(pageFields, err => {
      this.setState({ allowSubmit: true });
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`ProfileMethods.updateProfile failed`, err);
      } else {
        this.setState({ edit: false });
      }
    });
  }

  editLayout() {
    return (
      <PageForm
        allowSubmit={this.state.allowSubmit}
        pageObj={this.props.page}
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
    return User.id() ? <Icon.EditIcon onClick={this.handleSetState} stateName="edit" /> : "";
  }

  getLayout() {
    let layout: any;
    if (this.props.page) {
      if (this.state.edit) {
        // EDIT PAGE
        layout = (
          <div>
            <h2>
              Edit Page{" "}
              <Icon.CancelEditIcon className="cancel-edit-icon" onClick={this.handleSetState} stateName="edit" />
            </h2>
            <div>{this.editLayout()}</div>
          </div>
        );
      } else {
        // VIEW PAGE
        layout = (
          <div>
            <h1>
              {this.props.page.heading} {this.editLink()}
            </h1>

            <div dangerouslySetInnerHTML={this.createMarkup(this.props.page.body)} />
          </div>
        );
      }
    } else {
      // LOADING
      layout = <Spinner caption="loading" />;
    }

    return layout;
  }

  render() {
    let layout = this.getLayout();
    return <div className="container page-content">{layout}</div>;
  }
}
