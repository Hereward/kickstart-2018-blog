import * as React from 'react';
//import { Component, React } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
//import * as withTracker from 'meteor/react-meteor-data';

//import ReactDOM from 'react-dom';
import * as ReactDOM from 'react-dom';
import { Tasks } from '../../../api/tasks.js';
import Task from '../../partials/Task.js';
//import AccountsUIWrapper from '../../partials/AccountsUIWrapper.js';

interface IProps {
  history: any;
  signedIn: any;
  ShortTitle: any;
  UserName: any;
  tasks: any;
  currentUser: any;
  incompleteCount: number;
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
        hideCompleted: false,
      };
    }
  
    handleSubmit(event) {
      event.preventDefault();
  
      // Find the text field via the React ref
      const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
  
      Meteor.call('tasks.insert', text);
  
      // Clear form
      ReactDOM.findDOMNode(this.refs.textInput).value = '';
    }
  
    toggleHideCompleted() {
      this.setState({
        hideCompleted: !this.state.hideCompleted,
      });
    }
  
    renderTasks() {
      let filteredTasks = this.props.tasks;
      if (this.state.hideCompleted) {
        filteredTasks = filteredTasks.filter(task => !task.checked);
      }
      return filteredTasks.map((task) => {
        const currentUserId = this.props.currentUser && this.props.currentUser._id;
        const showPrivateButton = task.owner === currentUserId;
  
        return (
          <Task
            key={task._id}
            task={task}
            showPrivateButton={showPrivateButton}
          />
        );
      });
    }
  
    render() {
      return (
        <div className="container">
          <div className='todos-top-section'>
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
    
            { this.props.currentUser ?
              <form className="new-task" onSubmit={this.handleSubmit} >
                <input
                  type="text"
                  ref="textInput"
                  placeholder="Type to add new tasks"
                />
              </form> : ''
            }
          </div>
  
          <ul>
            {this.renderTasks()}
          </ul>
        </div>
      );
    }
  }
  
  export default withTracker(() => {
    Meteor.subscribe('tasks');
    Meteor.subscribe("userData");
  
    return {
      tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
      incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
      currentUser: Meteor.user(),
    };
  })(Index);