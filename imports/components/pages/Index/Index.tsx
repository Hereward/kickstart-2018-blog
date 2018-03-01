import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import * as ReactDOM from "react-dom";
import Checkbox from "material-ui/Checkbox";

import { Tasks } from "../../../api/tasks/publish";
import Task from "../../partials/Task";
import * as Methods from "../../../api/tasks/methods";
import * as Library from "../../../modules/library";
import * as PageMethods from "../../../api/pages/methods";
import * as Icon from "../../../modules/icons";

import EditorModeEdit from "material-ui/svg-icons/editor/mode-edit";
import PageForm from "../../forms/PageForm";

import { Pages } from "../../../api/pages/publish";

declare var DocHead: any;

interface IProps {
  history: any;
  signedIn: any;
  ShortTitle: any;
  UserName: any;
  tasks: any;
  currentUser: any;
  incompleteCount: number;
  taskCount: number;
  page: any;
}

interface IState {
  hideCompleted: boolean;
  textInput: any;
  edit: boolean;
}

class Index extends React.Component<IProps, IState> {
  fieldsArray = ["body", "heading"];

  textInputDOM: any;
  constructor(props) {
    super(props);

    this.toggleHideCompleted = this.toggleHideCompleted.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSubmitTodos = this.handleSubmitTodos.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSetState = this.handleSetState.bind(this);

    this.state = this.fieldMapper("init") as any;
    /*
    this.state = {
      hideCompleted: false,
      textInput: ""
    };
    */
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

  fieldMapper(type, props = "") {
    let obj = {};
    if (type === "init") {
      this.fieldsArray.forEach(element => (obj[element] = ""));
      obj["hideCompleted"] = false;
      obj["textInput"] = "";
      obj["edit"] = false;
    } else if (type === "props") {
      this.fieldsArray.forEach(element => (obj[element] = props[element]));
    } else if (type === "method") {
      this.fieldsArray.forEach(element => (obj[element] = this.state[element]));
      obj["id"] = this.props.page._id;
    }
    return obj;
  }

  handleSetState(sVar, sVal) {
    //console.log(`handleSetState (About)`, sVar, sVal);
    this.setState({ [sVar]: sVal });
  }

  handleSubmit() {
    let pageFields = this.fieldMapper("method");
      
    PageMethods.updatePage.call(pageFields, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`ProfileMethods.updateProfile failed`, err);
      } else {
        this.setState({edit: false});
      }
    });
  }

  handleSubmitTodos(event) {
    event.preventDefault();

    // Find the text field via the React ref
    const text = this.state.textInput; //ReactDOM.findDOMNode(this.state.textInput).value.trim();

    let taskFields = { text: text };

    Methods.create.call(taskFields, (err, res) => {
      //console.log("createTask.call");
      if (err) {
        Library.modalErrorAlert(err.reason);
      } else {
        //console.log(`task successfully created`);
      }
    });

    // Clear form
    //ReactDOM.findDOMNode(this.textInputDOM).value = "";
    //this.textInputDOM.value = "";
    this.setState({ textInput: "" });
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

  handleChange(e) {
    let target = e.target;
    let value = target.value;
    let id = target.id;

    this.setState({ [id]: value });
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted
    });
  }

  renderTasks() {
    let filteredTasks = this.props.tasks;

    //console.log(filteredTasks);
    return filteredTasks.map(task => {
      const currentUserId =
        this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = task.owner === currentUserId;

      return (
        <Task
          task={task}
          key={task._id}
          taskLabel={task.text}
          showPrivateButton={showPrivateButton}
          hide={this.state.hideCompleted && task.checked}
        />
      );
    });
  }

  getForm() {
    if (this.props.currentUser) {
      return (
        <form id="todos-form" className="new-task" onSubmit={this.handleSubmitTodos}>
          <input
            type="text"
            ref={textInput => (this.textInputDOM = textInput)}
            id="textInput"
            placeholder="Type here &amp; hit return to add new tasks"
            value={this.state.textInput}
            onChange={this.handleChange}
          />
        </form>
      );
    }
  }

  getCheckBox() {
    if (this.props.currentUser && this.props.taskCount) {
      return (
        <Checkbox
          label="Hide Completed Tasks"
          checked={this.state.hideCompleted}
          onClick={this.toggleHideCompleted}
        />
      );
    }
  }

  createMarkup(html) {
    return { __html: html };
  }

  getPageContent() {
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
    let tasks: any;
    tasks = this.props.taskCount ? <div>Loading...</div> : <div />;

    if (this.props.tasks) {
      tasks = this.renderTasks();
    }

    return (
      <div className="container">
        <div className="todos-top-section">
          {this.getPageContent()}
          <div className="todos-form-wrapper">
            {this.getCheckBox()}
            {this.getForm()}
          </div>
        </div>
        <ul>{tasks}</ul>
      </div>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe("userData");
  let tasksDataReady = Meteor.subscribe("tasks");
  let tasks: any;
  let count = 0;

  let query = Tasks.find({}, { sort: { createdAt: -1 } });
  count = query.count();
  //console.log(`COUNT = ${count}`);
  //tasks = Tasks.find({}, { sort: { createdAt: -1 } }).fetch();

  let page: any;
  let PagesDataReady = Meteor.subscribe("pages");
  if (PagesDataReady) {
    page = Pages.findOne({ name: "home" });
  }

  if (count) {
    tasks = query.fetch();
  }

  return {
    tasks: tasks,
    taskCount: count,
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user(),
    page: page
  };
})(Index);
