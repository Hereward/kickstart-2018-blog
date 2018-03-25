///<reference path="../../../index.d.ts"/>
import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import RaisedButton from "material-ui/RaisedButton";
import * as Validation from "../../modules/validation";
import Widget from "./Widget";

interface IProps {
  handleChange: any;
  handleSubmit: any;
  allowSubmit: boolean;
}

interface IState {}

export default class ChangePasswordForm extends React.Component<IProps, IState> {
  formID: string = "ChangePasswordForm";
  baseCSSClass: string = "form-control tooltipster required";

  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    let rules = {
      confirmNewPassword: {
        equalTo: "#newPassword"
      },
      newPassword: {
        minlength: 6
      }
    };

    Validation.validate(this, rules);
  }

  handleChange(e) {
    this.props.handleChange(e);
  }

  handleSubmit() {
    this.props.handleSubmit();
  }

  render() {
    return (
      <div>
        <h2>Change Password</h2>
        <form id={this.formID}>
          <div className="form-group">
            <label htmlFor="oldPassword">Old Password:</label>
            <input
              onChange={this.handleChange}
              type="password"
              className={this.baseCSSClass}
              id="oldPassword"
              name="oldPassword"
              placeholder=""
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password:</label>
            <input
              onChange={this.handleChange}
              type="password"
              className={this.baseCSSClass}
              id="newPassword"
              name="newPassword"
              placeholder=""
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmNewPassword">Confirm New Password:</label>
            <input
              onChange={this.handleChange}
              type="password"
              className={this.baseCSSClass}
              id="confirmNewPassword"
              name="confirmNewPassword"
              placeholder=""
            />
          </div>

          <div className="form-group">
            <RaisedButton disabled={!this.props.allowSubmit} type="submit" primary={true} label="Submit" />
          </div>
        </form>
      </div>
    );
  }
}
