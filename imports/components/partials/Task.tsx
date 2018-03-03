import * as PropTypes from "prop-types";
import * as React from "react";
import * as classnames from "classnames";
//import { Tasks } from "../../api/tasks/publish";
import * as Methods from "../../api/tasks/methods";
import * as Library from "../../modules/library";

interface IProps {
  task: { _id: string; checked: any; private: any };
  taskLabel: string;
  showPrivateButton: boolean;
  hide: boolean;
}

// Task component - represents a single todo item
export default class Task extends React.Component<IProps> {
  constructor(props) {
    super(props);

    //console.log('ZZZZZZZ SUB TASK:', this.props.task);
  }

  static propTypes = {
    task: PropTypes.object,
    taskLabel: PropTypes.string,
    showPrivateButton: PropTypes.bool,
    hide: PropTypes.bool
  };

  toggleChecked() {
    let fields = { taskId: this.props.task._id, checked: !this.props.task.checked };
    Methods.setChecked.call(fields, (err, res) => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`error`, err);
      }
    });
  }

  togglePrivate() {
    let fields = { taskId: this.props.task._id, private: !this.props.task.private };
    Methods.setPrivate.call(fields, (err, res) => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`error`, err);
      }
    });
  }

  deleteThisTask() {
    //console.log(`deleteThisTask.call [${this.props.task._id}]`);
    //Meteor.call("tasks.remove", this.props.task._id);

    let fields = { taskId: this.props.task._id };

    Methods.remove.call(fields, (err, res) => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`error`, err);
      } else {
        //console.log(`task successfully removed`);
      }
    });
  }

  getLayout() {}

  render() {
    //console.log(`TASK ID = [${this.props.task._id}]`);
    const taskClassName = classnames({
      checked: this.props.task.checked,
      private: this.props.task.private,
      hidden: this.props.hide
    });

    return (
      <li className={taskClassName}>
        <button className="delete" onClick={this.deleteThisTask.bind(this)}>
          &times;
        </button>

        <input type="checkbox" readOnly checked={!!this.props.task.checked} onClick={this.toggleChecked.bind(this)} />

        {this.props.showPrivateButton ? (
          <button className="toggle-private" onClick={this.togglePrivate.bind(this)}>
            {this.props.task.private ? "Private" : "Public"}
          </button>
        ) : (
          ""
        )}

        <span className="text">
          <strong>ID: [{this.props.task._id}]</strong>: [{this.props.taskLabel}]
        </span>
      </li>
    );
  }
}
