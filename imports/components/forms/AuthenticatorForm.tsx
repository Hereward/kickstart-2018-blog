///<reference path="../../../index.d.ts"/>
import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import * as BlockUi from "react-block-ui";
import RaisedButton from "material-ui/RaisedButton";
import * as Validation from "../../modules/validation";
import * as Library from "../../modules/library";

interface IProps {
  handleChange: any;
  handleSubmit: any;
  allowSubmit: boolean;
  userSettings: any;
  cancel2FA: any;
}

interface IState {}

export default class AuthenticatorForm extends React.Component<IProps, IState> {
  formID: string = "AuthenticatorForm";
  baseCSSClass: string = "form-control tooltipster required";

  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.cancel2FA = this.cancel2FA.bind(this);
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

  cancel2FA() {
    // this.setState({cancelEnabled: false});
     this.props.cancel2FA();
  }

  cancelButton() {
    let layout: any;
    if (this.props.userSettings && this.props.userSettings.authEnabled > 1) {
      layout =  <RaisedButton secondary={true} label="Cancel" onClick={this.cancel2FA} />;
    }
    return layout;
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
              <RaisedButton disabled={!this.props.allowSubmit} type="submit" primary={true} label="Submit" /> {" "}
              {this.cancelButton()}
            </div>
          </form>
        </BlockUi>
      </div>
    );
  }
}
