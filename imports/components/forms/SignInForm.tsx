import * as React from "react";
import { Link } from "react-router-dom";
import * as PropTypes from "prop-types";
import RaisedButton from "material-ui/RaisedButton";
import * as BlockUi from "react-block-ui";
import * as Validation from "../../modules/validation";

interface IProps {
  handleSubmit: any;
  handleChange: any;
  allowSubmit: boolean;
}

interface IState {
  SubmitText: string;
}

export default class SignInForm extends React.Component<IProps, IState> {
  formID: string = "SignInForm";
  baseCSSClass: string = "form-control tooltipster required";

  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      SubmitText: "Submit"
    };
  }

  /*
  static propTypes = {
    handleSubmit: PropTypes.func,
    handleChange: PropTypes.func
  };
  */

  componentDidMount() {
    Validation.validate(this);
  }

  handleSubmit() {
    this.props.handleSubmit();
  }

  handleChange(e) {
    this.props.handleChange(e);
  }

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
              <RaisedButton
                disabled={!this.props.allowSubmit}
                type="submit"
                primary={true}
                label={this.state.SubmitText}
              />
            </div>

            <div className="form-group">
              <Link href="/" to="/register">
                Click here to register...
              </Link>
            </div>
            <div className="form-group">
              <Link href="/" to="/forgot-password">
                Forgot Password ?
              </Link>
            </div>
          </form>
        </BlockUi>
      </div>
    );
  }
}
