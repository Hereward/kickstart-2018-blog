import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import { Link } from "react-router-dom";
import * as ReactDOM from "react-dom";
import * as dateFormat from "dateformat";
import * as moment from "moment";
import * as momentDurationFormatSetup from "moment-duration-format";
import { Card, Button, CardHeader, CardFooter, CardBody, CardTitle, CardText } from "reactstrap";

import Checkbox from "material-ui/Checkbox";
import { Tasks } from "../../../api/tasks/publish";
import Task from "../../partials/Task";
import PageContent from "../../partials/PageContent";
import Transition from "../../partials/Transition";
import * as Methods from "../../../api/tasks/methods";
import * as Library from "../../../modules/library";
import * as Icon from "../../../modules/icons";
import { Pages } from "../../../api/pages/publish";
import HomeContent from "../../partials/Home";
import * as User from "../../../modules/user";

momentDurationFormatSetup(moment);

declare var Chronos: any;

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
  userSession: any;
  remainingTime: any;
  timeNow: any;
  remainingTimeFormatted: any;
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
    this.handleSubmitTodos = this.handleSubmitTodos.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      hideCompleted: false,
      textInput: "",
      edit: false
    };
  }

  handleSetState(sVar, sVal) {
    this.setState({ [sVar]: sVal });
  }

  handleSubmitTodos(event) {
    event.preventDefault();

    const text = this.state.textInput;

    let taskFields = { text: text };

    Methods.create.call(taskFields, (err, res) => {
      if (err) {
        Library.modalErrorAlert(err.reason);
      }
    });

    this.setState({ textInput: "" });
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

    return filteredTasks.map(task => {
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = task.owner === currentUserId;
      const allowDelete = task.owner === currentUserId;

      return (
        <Task
          task={task}
          key={task._id}
          taskLabel={task.text}
          showPrivateButton={showPrivateButton}
          allowDelete={allowDelete}
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
            placeholder="Type new tasks here &amp; hit return"
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
        <Checkbox label="Hide Completed Tasks" checked={this.state.hideCompleted} onClick={this.toggleHideCompleted} />
      );
    }
  }

  sessionData() {
    let layout: any;
    if (this.props.currentUser && this.props.userSession) {
      let display: any;

      if (!this.props.userSession.persist) {
        let timeOutOn = Meteor.settings.public.session.timeOutOn === false ? false : true;
        let expiresOn = dateFormat(this.props.userSession.expiresOn, "mmmm dS, yyyy, h:MM:ss TT");

        display = (
          <div>
            <p>
              <strong>Expires:</strong> {timeOutOn ? expiresOn : "Session timeout disabled in config."}
            </p>
            <p>
              <strong>Remaining:</strong> {this.props.remainingTimeFormatted}
            </p>
          </div>
        );
      } else {
        display = (
          <div>
            <p>
              <strong>Expires:</strong> Never.
            </p>
          </div>
        );
      }

      layout = (
        <Card>
          <CardHeader>
            <h2>Session Data</h2>
          </CardHeader>
          <CardBody>
            <div className="card-text">{display}</div>
          </CardBody>
        </Card>
      );
    }

    return layout;
  }

  todosSection() {
    let tasks: any;
    let loggedOutMsg = !this.props.currentUser ? (
      <CardText>
        <em>You can add and remove tasks here when you are logged in to your account.</em>
      </CardText>
    ) : (
      ""
    );
    tasks = this.props.taskCount ? <div>Loading...</div> : <div />;

    if (this.props.tasks) {
      tasks = this.renderTasks();
    }

    let loggedInContent = this.props.currentUser ? (
      <div className="card-text">
        <div className="todos-form-wrapper">
          {this.getCheckBox()}
          {this.getForm()}
        </div>
        <ul>{tasks}</ul>
      </div>
    ) : (
      ""
    );

    let todosLayout = (
      <Card>
        <CardHeader>
          <h2>Simple Todos App</h2>
        </CardHeader>
        <CardBody>
          {loggedOutMsg}
          {loggedInContent}
        </CardBody>
      </Card>
    );
    return todosLayout;
  }

  render() {
    return (
      <Transition>
        <HomeContent />
        <div className="container sessionData">{this.sessionData()}</div>
        <div className="container todos">{this.todosSection()}</div>
      </Transition>
    );
  }
}

export default withTracker(props => {
  let tasksDataReady = Meteor.subscribe("tasks");
  let tasks: any;
  let remainingTime: any;
  let remainingTimeFormatted: any;
  let timeNow = Chronos.date();
  let count = 0;
  let query = Tasks.find({}, { sort: { createdAt: -1 } });
  count = query.count();

  let page: any;
  let PagesDataReady = Meteor.subscribe("pages");
  if (PagesDataReady) {
    page = Pages.findOne({ name: "home" });
  }

  if (count) {
    tasks = query.fetch();
  }

  if (props.userSession) {
    remainingTime = props.userSession.expiresOn - timeNow;
    let myDuration: any;
    myDuration = moment.duration(remainingTime, "milliseconds");
    remainingTimeFormatted = myDuration.format("hh:mm:ss", {
      trim: false
    });
  }

  return {
    tasks: tasks,
    taskCount: count,
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    currentUser: props.userData,
    page: page,
    remainingTime: remainingTime,
    timeNow: timeNow,
    remainingTimeFormatted: remainingTimeFormatted
  };
})(Index);
