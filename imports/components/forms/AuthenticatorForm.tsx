///<reference path="../../../index.d.ts"/>
import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import * as BlockUi from "react-block-ui";
import RaisedButton from "material-ui/RaisedButton";
import * as Validation from "../../modules/validation";

interface IProps {
  handleChange: any;
  handleSubmit: any;
  allowSubmit: boolean;
}

interface IState {}

export default class AuthenticatorForm extends React.Component<IProps, IState> {
  formID: string = "AuthenticatorForm";
  baseCSSClass: string = "form-control tooltipster required";

  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    Validation.validate(this);
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
        <h2>Verify Authorisation Code</h2>
        <BlockUi tag="div" blocking={!this.props.allowSubmit}>
          <form id={this.formID}>
            <div className="form-group">
              <label htmlFor="email">Please enter the 6 digit authorisation code:</label>
              <input
                onChange={this.handleChange}
                type="text"
                name="authCode"
                id="authCode"
                placeholder="Enter the 6 digit authorisation code"
                className={this.baseCSSClass}
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
