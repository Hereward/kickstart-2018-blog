import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import * as PropTypes from "prop-types";
import IconButton from "material-ui/IconButton";
import ActionCheckCircle from "material-ui/svg-icons/action/check-circle";
import NavigationCancel from "material-ui/svg-icons/navigation/cancel";

//import BlockUi from "react-block-ui";
import { Link } from "react-router-dom";
import "react-block-ui/style.css";
import * as jquery from "jquery";
import "jquery-validation";
import "tooltipster";
import "tooltipster/dist/css/tooltipster.bundle.min.css";

interface IProps {
  handleChange: any;
  handleSubmit: any;
  name: string;
  type: string;
  label: string;
  data: string;
}

interface IState {}

export default class SingleWidgetForm extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    //this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.submitMe = this.handleChange.bind(this);

    //this.state = {};
  }

  static propTypes = {
    handleSubmit: PropTypes.func,
    handleChange: PropTypes.func,
    default: PropTypes.string
  };

  componentDidMount() {
    jquery(`#${this.props.name}`).tooltipster({
      trigger: "custom", // default is 'hover' which is no good here
      onlyOne: true // allow multiple tips to be open at a time
    });

    let FormID = `${this.props.name}Form`;

    jquery(`#${FormID}`).validate({
      errorPlacement: function ep(error, element) {
        let errorString = jquery(error).text();
        element.tooltipster("content", errorString);
        element.tooltipster("open");
      },
      success: function success(label, element) {
        jquery(`#${element.id}`).tooltipster("close");
      },
      submitHandler: form => {
        this.props.handleSubmit(this.props.name);
      }
    });
  }

  /*
  handleSubmit(e) {
    e.preventDefault();
    jQuery(`#${this.props.name}`).tooltipster('content', 'boo');
    console.log("fuck you.");
    //this.setState({});
    //this.props.handleSubmit(e);
  }
  */

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
      <IconButton
        style={buttonStyle}
        type="submit"
        iconStyle={iconStyle}
        tooltip="Save"
      >
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

  // onSubmit={this.handleSubmit}

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
                defaultValue={
                  this.props.data ? this.props.data[this.props.name] : ""
                }
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

/*
        <button type="submit" className="btn btn-default">
                save
              </button>
              */

//onClick={this.submitMe}

//<label htmlFor={this.props.name}>{this.props.label}</label>
