import * as React from "react";
import { Link } from "react-router-dom";
import * as PropTypes from "prop-types";
import * as jquery from "jquery";
import "jquery-validation";
import RaisedButton from 'material-ui/RaisedButton';
//import BlockUi from "react-block-ui";

interface IProps {
  handleSubmit: any;
  handleChange: any;
}

interface IState {
  DisableSubmit: boolean;
  SubmitText: string;
}

export default class SignInForm extends React.Component<IProps, IState> {
  formID: string = "SignInForm";

  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      DisableSubmit: false,
      SubmitText: "Submit"
    };
  }

  static propTypes = {
    handleSubmit: PropTypes.func,
    handleChange: PropTypes.func
  };


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
    //this.setState({ DisableSubmit: true, SubmitText: "processing..." });
    this.props.handleSubmit(e);
  }

  handleChange(e) {
    this.props.handleChange(e);
  }

  render() {
    return (
      <div>
        <h2>Sign In</h2>
        <form id={this.formID}>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              required
              name="email"
              onChange={this.handleChange}
              type="email"
              className="form-control"
              id="email"
              placeholder="Email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              required
              name="password"
              onChange={this.handleChange}
              type="password"
              className="form-control"
              id="password"
              placeholder="Password"
            />
          </div>

          
          <div className="form-group">
            <RaisedButton disabled={this.state.DisableSubmit} type="submit" primary={true} label={this.state.SubmitText} />
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
      </div>
    );
  }
}

/*

<div className="form-group">
            <button
              type="submit"
              disabled={this.state.DisableSubmit}
              className="btn btn-default"
            >
              {this.state.SubmitText}
            </button>
          </div>

          */
