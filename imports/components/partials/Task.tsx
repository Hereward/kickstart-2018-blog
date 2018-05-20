import * as PropTypes from "prop-types";
import * as React from "react";
import * as classnames from "classnames";
import * as Methods from "../../api/tasks/methods";
import * as Library from "../../modules/library";

interface IProps {
  task: { _id: string; checked: any; private: any };
  taskLabel: string;
  showPrivateButton: boolean;
  allowDelete: boolean;
  hide: boolean;
}

export default class Task extends React.Component<IProps> {
  constructor(props) {
    super(props);
  }

  static propTypes = {
    task: PropTypes.object,
    taskLabel: PropTypes.string,
    showPrivateButton: PropTypes.bool,
    allowDelete: PropTypes.bool,
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
    let fields = { taskId: this.props.task._id };

    Methods.remove.call(fields, (err, res) => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`error`, err);
      }
    });
  }

  getLayout() {}

  render() {
    const taskClassName = classnames({
      checked: this.props.task.checked,
      private: this.props.task.private,
      hidden: this.props.hide
    });

    return (
      <li className={taskClassName}>
        <div className="row">
          <div className="col-auto">
            <input
              type="checkbox"
              className="checkbox"
              readOnly
              checked={!!this.props.task.checked}
              onClick={this.toggleChecked.bind(this)}
            />
          </div>

          {this.props.allowDelete ? (
            <div className="col-auto">
              <button className="delete" onClick={this.deleteThisTask.bind(this)}>
                &times;
              </button>
            </div>
          ) : (
            ""
          )}

          {this.props.showPrivateButton ? (
            <div className="col-auto">
              <button className="toggle-private" onClick={this.togglePrivate.bind(this)}>
                {this.props.task.private ? "Private" : "Public"}
              </button>
            </div>
          ) : (
            ""
          )}

          <div className="col-12 col-md-auto">
            <span className="text">{this.props.taskLabel}</span>
          </div>
        </div>
      </li>
    );
  }
}
