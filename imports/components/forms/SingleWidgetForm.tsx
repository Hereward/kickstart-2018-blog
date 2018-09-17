///<reference path="../../../index.d.ts"/>
import * as React from "react";
import * as PropTypes from "prop-types";
import IconButton from "material-ui/IconButton";
import ActionCheckCircle from "material-ui/svg-icons/action/check-circle";
import NavigationCancel from "material-ui/svg-icons/navigation/cancel";
import { Link } from "react-router-dom";
import * as jquery from "jquery";
import "react-block-ui/style.css";
import * as Validation from "../../modules/validation";


interface IProps {
  handleChange: PropTypes.object.isRequired;
  handleSubmit: PropTypes.object.isRequired;
  name: string;
  type: string;
  label: string;
  data: string;
}

interface IState {}

export default class SingleWidgetForm extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);
    this.submitMe = this.handleChange.bind(this);
  }

  static propTypes = {
    handleSubmit: PropTypes.func,
    handleChange: PropTypes.func,
    default: PropTypes.string
  };

  componentDidMount() {
    Validation.validate(this);
  }

  handleChange(e) {
    this.props.handleChange(e);
  }

  submitMe() {
    let res = jquery(`#${this.props.name}Form`).submit;
  }

  submitButton() {
    let iconStyle = {
      height: "2rem",
      width: "2rem",
      color: "lime",
      verticalAlign: "middle"
    };
    let buttonStyle = { width: "auto", height: "auto", padding: 0 };
    return (
      <IconButton style={buttonStyle} type="submit" iconStyle={iconStyle} tooltip="Save">
        <ActionCheckCircle />
      </IconButton>
    );
  }

  cancelButton() {
    let iconStyle = {
      height: "2rem",
      width: "2rem",
      color: "red",
      verticalAlign: "middle"
    };
    let buttonStyle = { width: "auto", height: "auto", padding: 0 };
    return (
      <IconButton style={buttonStyle} iconStyle={iconStyle} tooltip="Save">
        <NavigationCancel />
      </IconButton>
    );
  }

  render() {
    return (
      <div>
        <form id={`${this.props.name}Form`}>
          <div className="form-row">
            <div className="col-9">
              <input
                type={this.props.type}
                onChange={this.handleChange}
                className="form-control"
                id={this.props.name}
                name={this.props.name}
                placeholder={this.props.label}
                defaultValue={this.props.data ? this.props.data[this.props.name] : ""}
                required
              />
            </div>
            <div className="col">
              {this.submitButton()} {this.cancelButton()}
            </div>
          </div>
        </form>
      </div>
    );
  }
}
