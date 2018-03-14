///<reference path="../../../index.d.ts"/>
import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import RaisedButton from "material-ui/RaisedButton";
import * as Validation from "../../modules/validation";
import * as jquery from "jquery";
import "jquery-validation";
import "tooltipster";
import "tooltipster/dist/css/tooltipster.bundle.min.css";
import "tooltipster/dist/css/plugins/tooltipster/sideTip/themes/tooltipster-sideTip-light.min.css";
import Widget from "./Widget";

interface IProps {
  handleChange: any;
  handleSubmit: any;
}

interface IState {
  disableSubmit: boolean;
}

export default class ChangePasswordForm extends React.Component<IProps, IState> {
  formID: string = "ChangePasswordForm";
  baseCSSClass: string = "form-control tooltipster required";

  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);

    this.state = {
      disableSubmit: false
    };
  }

  componentDidMount() {    
    jquery(`.tooltipster, .tooltipsterParent input`).tooltipster({
      trigger: "custom",
      animation: "slide",
      theme: "tooltipster-light",
      zIndex: 1400
    });

    jquery(`#${this.formID}`).validate({
      errorPlacement: function ep(error, element) {
        let errorString = jquery(error).text();
        element.tooltipster("content", errorString);
        element.tooltipster("open");
      },
      rules: {
        confirmNewPassword: {
          equalTo: "#newPassword"
        },
        newPassword: {
          minlength: 6
        }
      },
      submitHandler: form => {
        this.setState({ disableSubmit: true });
        this.props.handleSubmit();
      },
      success: function success(label, element) {
        jquery(`#${element.id}`).tooltipster("close");
      }
    });
  }


  handleChange(e) {
    this.props.handleChange(e);
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
            <RaisedButton disabled={this.state.disableSubmit} type="submit" primary={true} label="Submit" />
          </div>
        </form>
      </div>
    );
  }
}
