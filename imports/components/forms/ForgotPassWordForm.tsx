import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import RaisedButton from "material-ui/RaisedButton";
//import BlockUi from "react-block-ui";
import { Link } from "react-router-dom";
import "react-block-ui/style.css";
import * as jquery from "jquery";
import "jquery-validation";
import "tooltipster";
import "tooltipster/dist/css/tooltipster.bundle.min.css";
import "tooltipster/dist/css/plugins/tooltipster/sideTip/themes/tooltipster-sideTip-light.min.css";

interface IProps {
  handleChange: any;
  handleSubmit: any;
}

interface IState {
  disableSubmit: boolean;
  submitText: string;
  blocking: boolean;
}

export default class ForgotPassWordForm extends React.Component<IProps, IState> {
  formID: string = "ForgotPassWordForm";
  baseCSSClass: string = "form-control tooltipster required";

  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);

    this.state = {
      disableSubmit: false,
      submitText: "Submit",
      blocking: false
    };
  }

  componentDidMount() {
    jquery(`.tooltipster, .tooltipsterParent input`).tooltipster({
      trigger: "custom",
      animation: "slide",
      theme: "tooltipster-light",
      zIndex: 1400
    });
    console.log(`ComponentDidMount`);
    jquery(`#${this.formID}`).validate({
      errorPlacement: function ep(error, element) {
        let errorString = jquery(error).text();
        element.tooltipster("content", errorString);
        element.tooltipster("open");
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
        <h2>Forgot Your Password ?</h2>

        <p>
          Let&#8217;s recover it! Please enter your email address below. You will receive an email with further
          instructions.
        </p>

        <form id={this.formID}>
          <div className="form-group">
            <label htmlFor="email">Email Address:</label>
            <input
              type="email"
              onChange={this.handleChange}
              className={this.baseCSSClass}
              id="email"
              name="email"
              placeholder=""
            />
          </div>

          <div className="form-group">
            <RaisedButton disabled={this.state.disableSubmit} type="submit" primary={true} label="Submit" />
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
