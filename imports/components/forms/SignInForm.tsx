import * as React from "react";
import { Link } from "react-router-dom";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import * as PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import * as BlockUi from "react-block-ui";
import * as Validation from "../../modules/validation";

interface IProps {
  handleSubmit: PropTypes.object.isRequired;
  handleChange: PropTypes.object.isRequired;
  allowSubmit: boolean;
  handleCheck: any;
}

interface IState {
  SubmitText: string;
  keepMeLoggedIn: boolean;
}

export default class SignInForm extends React.Component<IProps, IState> {
  formID: string = "SignInForm";
  baseCSSClass: string = "form-control tooltipster required";

  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleCheck = this.handleCheck.bind(this);

    this.state = {
      SubmitText: "Submit",
      keepMeLoggedIn: false
    };
  }

  componentDidMount() {
    Validation.validate(this);
  }

  handleSubmit() {
    this.props.handleSubmit();
  }

  handleChange(e) {
    this.props.handleChange(e);
  }

  handleCheck = name => event => {
    this.props.handleCheck(event.target.checked);
  };

  render() {
    return (
      <div>
        <h2>Sign In</h2>
        <BlockUi tag="div" blocking={!this.props.allowSubmit}>
          <form id={this.formID}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                name="email"
                onChange={this.handleChange}
                type="email"
                className={this.baseCSSClass}
                id="email"
                placeholder="Email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                name="password"
                onChange={this.handleChange}
                type="password"
                className={this.baseCSSClass}
                id="password"
                placeholder="Password"
              />
            </div>

            <div className="form-group">
              <FormControlLabel
                control={<Checkbox onChange={this.handleCheck("keepMeLoggedIn")} id="keepMeLoggedIn" value="checked" />}
                label="Keep me signed in"
              />
            </div>

            <div className="form-group">
              <Button disabled={!this.props.allowSubmit} variant="raised" type="submit" color="primary">
                {this.state.SubmitText}
              </Button>
            </div>

            <div className="form-group">
              <Link href="/" to="/members/register">
                Click here to register...
              </Link>
            </div>
            <div className="form-group">
              <Link href="/" to="/members/forgot-password">
                Forgot Password ?
              </Link>
            </div>
          </form>
        </BlockUi>
      </div>
    );
  }
}
