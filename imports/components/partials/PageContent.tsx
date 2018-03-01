///<reference path="../../../index.d.ts"/>

import * as React from "react";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Pages } from "../../api/pages/publish";
import Transition from "../partials/Transition";
import * as Icon from "../../modules/icons";
import PageForm from "../forms/PageForm";
import EditorModeEdit from "material-ui/svg-icons/editor/mode-edit";
import * as PageMethods from "../../api/pages/methods";
import * as Library from "../../modules/library";
//import * as ReactQuill from "react-quill";
//const ReactQuill = require("react-quill");
//import "react-quill/dist/quill.snow.css";

interface IProps {
  page: any;
}

interface IState {
  edit: boolean;
}

export default class PageContent extends React.Component<IProps, IState> {

  fieldsArray = ["body", "heading"];

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSetState = this.handleSetState.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.state = this.fieldMapper("init") as any;
    //this.state = Object.assign({}, this.state, extraStates);
  }

  fieldMapper(type, props = "") {
    let obj = {};
    if (type === "init") {
      this.fieldsArray.forEach(element => (obj[element] = ""));
      obj["edit"] = false;
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
    //console.log(`About Page HandleChange`, value, id);
    this.setState({ [id]: value });
  }

  handleSetState(sVar, sVal) {
    //console.log(`handleSetState (About)`, sVar, sVal);
    this.setState({ [sVar]: sVal });
  }

  /*
  handleChange(value) {
    this.setState({ body: value });
  }
  */

  handleSubmit() {
    let pageFields = this.fieldMapper("method");

    PageMethods.updatePage.call(pageFields, err => {
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

  getLayout() {
    let layout = [];

    if (this.props.page) {
      if (this.state.edit) {
        layout.push(<div key="quillEditor">{this.editLayout()}</div>);
      } else {
        layout.push(
          <h2 key="heading">
            {this.props.page.heading}
            {Icon.edit({ onClick: this.handleSetState, stateName: "edit" })}
          </h2>
        );
        layout.push(
          <div
            key="bodyText"
            dangerouslySetInnerHTML={this.createMarkup(this.props.page.body)}
          />
        );
      }
    } else {
      layout.push(<div key="loading">Loading...</div>);
    }

    return layout;
  }

  render() {
    let layout = this.getLayout();
    return <div className="page-content">{layout}</div>;
  }
}

/*
export default withRouter(
  withTracker(props => {
    let page: any;
    if (props.pageName) {
      let PagesDataReady = Meteor.subscribe("pages");
      if (PagesDataReady) {
        page = Pages.findOne({ name: props.pageName });
      }
    }
   
    return { page: page };
  })(PageContent)
);
*/

/*
ForgotPassWord.propTypes = {
  signedIn: PropTypes.bool,
  EnhancedAuth: PropTypes.bool,
  history: ReactRouterPropTypes.history
};
*/
