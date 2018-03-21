import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import RaisedButton from "material-ui/RaisedButton";
import { Link } from "react-router-dom";
import "react-block-ui/style.css";
import * as Validation from "../../modules/validation";

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
    Validation.validate(this);
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
