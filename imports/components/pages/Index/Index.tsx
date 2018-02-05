import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import * as ReactDOM from "react-dom";
import { Tasks } from "../../../api/tasks/publish";
import Task from "../../partials/Task";
import * as Methods from "../../../api/tasks/methods";
import * as Library from "../../../modules/library";

interface IProps {
  history: any;
  signedIn: any;
  ShortTitle: any;
  UserName: any;
  tasks: any;
  currentUser: any;
  incompleteCount: number;
  taskCount: number;
}

interface IState {
  hideCompleted: boolean;
}

class Index extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.toggleHideCompleted = this.toggleHideCompleted.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      hideCompleted: false
    };
  }

  handleSubmit(event) {
    event.preventDefault();

    // Find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

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
    ReactDOM.findDOMNode(this.refs.textInput).value = "";
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
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = task.owner === currentUserId;

      return (
        <Task
          task={task}
          key={task._id}
          taskLabel={task.text}
          showPrivateButton={showPrivateButton}
          hide={(this.state.hideCompleted && (task.checked))}
        />
      );
    });
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
          <h1>Todo List ({this.props.incompleteCount})</h1>

          <label className="hide-completed">
            <input
              type="checkbox"
              readOnly
              checked={this.state.hideCompleted}
              onClick={this.toggleHideCompleted}
            />
            Hide Completed Tasks
          </label>

          {this.props.currentUser ? (
            <form className="new-task" onSubmit={this.handleSubmit}>
              <input
                type="text"
                ref="textInput"
                placeholder="Type to add new tasks"
              />
            </form>
          ) : (
            ""
          )}
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

  if (count) {
    tasks = query.fetch();
  }

  return {
    tasks: tasks,
    taskCount: count,
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user()
  };
})(Index);
