import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
//import BlockUi from "react-block-ui";
import { Link } from "react-router-dom";
import "react-block-ui/style.css";
import * as jquery from "jquery";
import "jquery-validation";


interface IProps {
  handleChange: any;
  handleSubmit: any;
}

interface IState {
  disableSubmit: boolean;
  submitText: string;
  blocking: boolean;
}

export default class ForgotPassWordForm extends React.Component<IProps,IState> {
  formID: string = "ForgotPassWordForm";

  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      disableSubmit: false,
      submitText: "Submit",
      blocking: false
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
    this.setState({
      disableSubmit: true,
      submitText: "processing...",
      blocking: true
    });
    this.props.handleSubmit(e);
  }

  handleChange(e) {
    this.props.handleChange(e);
  }

  render() {
    return (
      <div>
        <h2>Forgot Your Password ?</h2>

        <p>
          Let&#8217;s recover it! Please enter your email address below. You
          will receive an email with further instructions.
        </p>

        
          <form id={this.formID}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                onChange={this.handleChange}
                className="form-control"
                id="email"
                name="email"
                placeholder="Email"
                required
              />
            </div>

            <div className="form-group">
              <button
                disabled={this.state.disableSubmit}
                type="submit"
                className="btn btn-default"
              >
                {this.state.submitText}
              </button>
            </div>

            <div className="form-group">
              <Link href="/" to="/register">
                Click here to register...
              </Link>
            </div>
          </form>
      </div>
    );
  }
}

//<BlockUi tag="div" blocking={this.state.blocking}>
