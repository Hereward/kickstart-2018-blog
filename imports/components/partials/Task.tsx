//import React, { Component } from 'react';
import * as React from 'react'
import { Component } from 'react';
import { Tasks } from '../../api/tasks.js';
//import classnames from 'classnames';
import * as classnames from 'classnames';

interface IProps {
  task: any;
  showPrivateButton: any;
}


// Task component - represents a single todo item
export default class Task extends Component<IProps> {
    toggleChecked() {
      // Set the checked property to the opposite of its current value
      Meteor.call('tasks.setChecked', this.props.task._id, !this.props.task.checked);
    }
  
    deleteThisTask() {
      Meteor.call('tasks.remove', this.props.task._id);
    }
  
    togglePrivate() {
      Meteor.call('tasks.setPrivate', this.props.task._id, ! this.props.task.private);
    }
  
    render() {
      // Give tasks a different className when they are checked off,
      // so that we can style them nicely in CSS
      const taskClassName = classnames({
        checked: this.props.task.checked,
        private: this.props.task.private,
      });
  
      return (
        <li className={taskClassName}>
          <button className="delete" onClick={this.deleteThisTask.bind(this)}>
            &times;
          </button>
  
          <input
            type="checkbox"
            readOnly
            checked={!!this.props.task.checked}
            onClick={this.toggleChecked.bind(this)}
          />
  
          { this.props.showPrivateButton ? (
            <button className="toggle-private" onClick={this.togglePrivate.bind(this)}>
              { this.props.task.private ? 'Private' : 'Public' }
            </button>
          ) : ''}
  
          <span className="text">
            <strong>{this.props.task.username}</strong>: {this.props.task.text}
          </span>
        </li>
      );
    }
  }