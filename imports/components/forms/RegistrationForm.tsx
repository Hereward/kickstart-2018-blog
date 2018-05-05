import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import * as PropTypes from "prop-types";
import * as BlockUi from "react-block-ui";
import RaisedButton from "material-ui/RaisedButton";
import Checkbox from "material-ui/Checkbox";
import * as Validation from "../../modules/validation";

interface IProps {
  handleChange: any;
  handleSubmit: any;
  allowSubmit: boolean;
  handleCheck: any;
}


interface IState {
  disableSubmit: boolean;
}

export default class RegistrationForm extends React.Component<IProps, IState> {
  formID: string = "RegistrationForm";
  baseCSSClass: string = "form-control tooltipster required";

  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.state = {
      disableSubmit: false
    };
  }

  static propTypes = {
    handleSubmit: PropTypes.func,
    handleChange: PropTypes.func
  };

  componentDidMount() {
    let rules = {
      password2: {
        equalTo: "#password1"
      },
      password1: {
        minlength: 6
      }
    };
    Validation.validate(this, rules);
  }

  handleSubmit() {
    this.props.handleSubmit();
  }

  handleChange(e) {
    this.props.handleChange(e);
  }

  handleCheck(event, isInputChecked) {
    this.props.handleCheck(isInputChecked);
  }

  render() {
    return (
      <div>
        <h2>Register</h2>
        <BlockUi tag="div" blocking={!this.props.allowSubmit}>
          <form id={this.formID}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                onChange={this.handleChange}
                type="email"
                className={this.baseCSSClass}
                id="email"
                name="email"
                placeholder="Email"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password1">Password</label>
              <input
                onChange={this.handleChange}
                type="password"
                className={this.baseCSSClass}
                id="password1"
                name="password1"
                placeholder="Password"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password2">Confirm Password</label>
              <input
                onChange={this.handleChange}
                type="password"
                className={this.baseCSSClass}
                id="password2"
                name="password2"
                placeholder="Confirm Password"
              />
            </div>

            <div className="form-group">
              <Checkbox
                id="keepMeLoggedIn"
                label="Keep me signed in"
                onCheck={(event, isInputChecked) => this.handleCheck(event, isInputChecked)}
              />
            </div>

            <div className="form-group">
              <RaisedButton disabled={!this.props.allowSubmit} type="submit" primary={true} label="Submit" />
            </div>
          </form>
        </BlockUi>
      </div>
    );
  }
}
