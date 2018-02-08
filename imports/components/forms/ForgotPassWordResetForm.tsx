import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import * as jquery from "jquery";
import "jquery-validation";

interface IProps {
  handleChange: any;
  handleSubmit: any;
}

interface IState {
  DisableSubmit: boolean;
  SubmitText: string;
}

export default class ForgotPassWordResetForm extends React.Component<IProps,IState> {
  formID: string = "ForgotPassWordResetForm";

  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      DisableSubmit: false,
      SubmitText: "Submit"
    };
  }

  componentDidMount() {
    console.log(`ComponentDidMount`);
    jquery(`#${this.formID}`).validate({
      submitHandler: (form) => {
        this.props.handleSubmit();
      }
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({ DisableSubmit: true, SubmitText: "processing..." });
    this.props.handleSubmit(e);
  }

  handleChange(e) {
    this.props.handleChange(e);
  }

  render() {
    return (
      <div>
        <h2>Password Reset</h2>
        <form id={this.formID}>
          <div className="form-group">
            <label htmlFor="password1">Password</label>
            <input
              onChange={this.handleChange}
              type="password"
              className="form-control"
              id="password1"
              name="password1"
              placeholder="Password"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password2">Confirm Password</label>
            <input
              onChange={this.handleChange}
              type="password"
              className="form-control"
              id="password2"
              name="password2"
              placeholder="Confirm Password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={this.state.DisableSubmit}
            className="btn btn-default"
          >
            {this.state.SubmitText}
          </button>
        </form>
      </div>
    );
  }
}

/*
ForgotPassWordResetForm.propTypes = {
  handleSubmit: PropTypes.func,
  handleChange: PropTypes.func,
};
*/
