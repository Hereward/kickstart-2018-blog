import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import * as PropTypes from "prop-types";
//import * as jquery from "jquery";
import RaisedButton from "material-ui/RaisedButton";
import * as Validation from "../../modules/validation";
/*
import "jquery-validation";
import "tooltipster";
import "tooltipster/dist/css/tooltipster.bundle.min.css";
import "tooltipster/dist/css/plugins/tooltipster/sideTip/themes/tooltipster-sideTip-light.min.css";
*/
import Widget from "./Widget";
import CountryWidget from "./CountryWidget";
import DateWidget from "./DateWidget";

interface IProps {
  handleChange: any;
  handleSubmit: any;
  profileObj: any;
  handleSetState: any;
}

interface IState {
  country: string;
  region: string;
  disableSubmit: boolean;
}

export default class ProfileForm extends React.Component<IProps, IState> {
  formID: string = "ProfileForm";

  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSetStateUpstream = this.handleSetStateUpstream.bind(this);

    this.state = {
      country: this.props.profileObj.country,
      region: this.props.profileObj.region,
      disableSubmit: false
    };

    console.log(`ProfileForm`, this.props, this.state);
  }

  static propTypes = {
    handleSubmit: PropTypes.func,
    handleChange: PropTypes.func,
    handleSetState: PropTypes.func,
    profileObj: PropTypes.object
  };

  componentDidMount() {
    Validation.validate(this);
    /*
    jquery(`.tooltipster, .tooltipsterParent input`).tooltipster({
      trigger: "custom",
      animation: "slide",
      theme: "tooltipster-light",
      zIndex: 1400
    });

    jquery(`#${this.formID}`).validate({
      errorPlacement: function ep(error, element) {
        let errorString = jquery(error).text();
        element.tooltipster("content", errorString);
        element.tooltipster("open");
      },
      success: function success(label, element) {
        jquery(`#${element.id}`).tooltipster("close");
      },
      submitHandler: form => {
        this.handleSubmit();
      }
    });
    */
  }

  handleSetStateUpstream(sVar, sVal) {
    this.props.handleSetState(sVar, sVal);
  }

  handleSubmit() {
    this.setState({
      disableSubmit: true
    });
    this.props.handleSubmit();
  }

  handleChange(e) {
    this.props.handleChange(e);
  }

  getWidget(props: any) {
    let widgetType = props.widgetType ? props.widgetType : "simple";
    return (
      <Widget widgetType={widgetType} handleChange={this.handleChange} dataObj={this.props.profileObj} wProps={props} />
    );
  }

  render() {
    return (
      <div>
        <form id={this.formID}>
          {this.getWidget({ name: "fname", label: "First Name" })}
          {this.getWidget({
            name: "initial",
            required: false,
            label: "Initial"
          })}
          {this.getWidget({ name: "lname", label: "Last Name" })}
          <DateWidget
            handleSetStateUpstream={this.handleSetStateUpstream}
            handleChange={this.handleChange}
            dataObj={this.props.profileObj}
            name="dob"
            label="Date of Birth"
          />

          {this.getWidget({ name: "street1", label: "Street Address 1" })}
          {this.getWidget({
            name: "street2",
            label: "Street Address 2",
            required: false
          })}
          {this.getWidget({ name: "city", label: "City", required: false })}

          <CountryWidget handleChange={this.handleChange} dataObj={this.props.profileObj} />

          {this.getWidget({ name: "postcode", label: "Postal Code" })}

          <div className="form-group">
            <RaisedButton disabled={this.state.disableSubmit} type="submit" primary={true} label="Submit" />
          </div>
        </form>
      </div>
    );
  }
}
