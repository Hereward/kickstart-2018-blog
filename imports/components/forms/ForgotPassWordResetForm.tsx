import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import * as PropTypes from "prop-types";
import * as BlockUi from "react-block-ui";
import Button from "@material-ui/core/Button";
import * as Validation from "../../modules/validation";

interface IProps {
  handleChange: any;
  handleSubmit: any;
  allowSubmit: boolean;
}

interface IState {}

export default class ForgotPassWordResetForm extends React.Component<IProps, IState> {
  formID: string = "ForgotPassWordResetForm";
  baseCSSClass: string = "form-control tooltipster required";

  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

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

  handleChange(e) {
    this.props.handleChange(e);
  }

  handleSubmit() {
    this.props.handleSubmit();
  }

  render() {
    return (
      <div>
        <h2>Password Reset</h2>
        <BlockUi tag="div" blocking={!this.props.allowSubmit}>
          <form id={this.formID}>
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
              <Button disabled={!this.props.allowSubmit} variant="raised" type="submit" color="primary">
                Submit
              </Button>
            </div>
          </form>
        </BlockUi>
      </div>
    );
  }
}
