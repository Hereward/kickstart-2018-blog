import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import * as PropTypes from "prop-types";
import * as jquery from "jquery";
import "jquery-validation";
import "tooltipster";
import "tooltipster/dist/css/tooltipster.bundle.min.css";
import "tooltipster/dist/css/plugins/tooltipster/sideTip/themes/tooltipster-sideTip-light.min.css";
import Widget from "./Widget";
import CountryWidget from "./CountryWidget";

interface IProps {
  handleChange: any;
  handleSubmit: any;
  profileObj: any;
}

interface IState {
  country: string;
  region: string;
}

export default class ProfileForm extends React.Component<IProps, IState> {
  formID: string = "ProfileForm";

  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      country: this.props.profileObj.country,
      region: this.props.profileObj.region
    };

    console.log(`ProfileForm`, this.props, this.state);
  }

  static propTypes = {
    handleSubmit: PropTypes.func,
    handleChange: PropTypes.func,
    profileObj: PropTypes.object
  };

  /*
  PropTypes.shape({
      _id: PropTypes.string,
      fname: PropTypes.string,
      initial: PropTypes.string,
      lname: PropTypes.string,
      street1: PropTypes.string,
      street2: PropTypes.string,
      city: PropTypes.string,
      region: PropTypes.string,
      postcode: PropTypes.string,
      country: PropTypes.string,
      verificationEmailSent: PropTypes.number,
      new: PropTypes.bool,
      createdAt: PropTypes.date,
      owner: PropTypes.string
    })
    */

  componentDidMount() {

    jquery(`.tooltipster`).tooltipster({
      trigger: "custom", // default is 'hover' which is no good here
      animation: "slide",
      theme: "tooltipster-light"
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
  }


  /*
      jquery.validator.addMethod(
      "valueNotEquals",
      function valueNotEquals(value, element, arg) {
        return arg !== value;
      },
      "Value must not equal arg."
    );
      rules: {
        country: {
          valueNotEquals: ''
        },
        region: {
          valueNotEquals: ''
        }
      },
      messages: {
        country: { valueNotEquals: "Please select an item!" },
        region: { valueNotEquals: "Please select an item!" }
      },
      */

  handleSubmit() {
    //e.preventDefault();
    this.props.handleSubmit();
  }

  handleChange(e) {
    this.props.handleChange(e);
  }

  getWidget(props: any) {
    let widgetType = props.widgetType ? props.widgetType : "simple";
    return (
      <Widget
        widgetType={widgetType}
        handleChange={this.handleChange}
        dataObj={this.props.profileObj}
        wProps={props}
      />
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
          {this.getWidget({ name: "street1", label: "Street Address 1" })}
          {this.getWidget({
            name: "street2",
            label: "Street Address 2",
            required: false
          })}
          {this.getWidget({ name: "city", label: "City", required: false })}

          <CountryWidget
            handleChange={this.handleChange}
            dataObj={this.props.profileObj}
          />

          {this.getWidget({ name: "postcode", label: "Postal Code" })}

          <button type="submit" className="btn btn-default">
            Submit
          </button>
        </form>
      </div>
    );
  }
}

// {this.getWidget({ name: "region", label: "Region/State" })}
//  {this.getWidget({ name: "country", label: "Country" })}

/*
 {
        _id: string;
        fname: string;
        initial: string;
        lname: string;
        street1: string;
        street2: string;
        city: string;
        region: string;
        postcode: string;
        country: string;
        verificationEmailSent: number,
        new: boolean,
        createdAt: string;
        owner: string;
      };
      */
