import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import * as PropTypes from "prop-types";
import * as jquery from "jquery";
import "jquery-validation";
import "tooltipster";
import "tooltipster/dist/css/tooltipster.bundle.min.css";
import "tooltipster/dist/css/plugins/tooltipster/sideTip/themes/tooltipster-sideTip-light.min.css";
import Widget from "./Widget";

interface IProps {
  handleChange: any;
  handleSubmit: any;
  profileObj: any;
}

interface IState {
  DisableSubmit: boolean;
  SubmitText: string;
}

export default class ProfileForm extends React.Component<IProps, IState> {
  formID: string = "ProfileForm";

  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  static propTypes = {
    handleSubmit: PropTypes.func,
    handleChange: PropTypes.func,
    profileObj: PropTypes.shape({
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
  };

  /*
  componentDidMount() {
    console.log(`ComponentDidMount`);
    jquery(`#${this.formID}`).validate({
      submitHandler: (form) => {
        this.props.handleSubmit();
      }
    });
  }
  */

  componentDidMount() {
    jquery(`.tooltipster`).tooltipster({
      trigger: 'custom', // default is 'hover' which is no good here
      animation: 'slide',
   theme: 'tooltipster-light',
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

  handleSubmit() {
    //e.preventDefault();
    this.props.handleSubmit();
  }

  handleChange(e) {
    this.props.handleChange(e);
  }

  getWidget(props: any) {
      let widgetType = (props.widgetType) ? props.widgetType : 'simple';
      return <Widget widgetType={widgetType} handleChange={this.handleChange} dataObj={this.props.profileObj} wProps={props} />;

  }
/*
  widget(wprops: {
    name: string;
    label?: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
  }) {
    let layout = (
      <div className="form-group">
        <label htmlFor="fname">{wprops.label || "Enter Text"}</label>
        <input
          onChange={this.handleChange}
          type={wprops.type || "text"}
          className="form-control tooltipster"
          id={wprops.name}
          name={wprops.name}
          placeholder={wprops.placeholder || ""}
          defaultValue={
            this.props.profileObj ? this.props.profileObj[wprops.name] : ""
          }
          required={wprops.required===false ? false : true}
        />
      </div>
    );

    return layout;
  }
  */

  // {wprops.required ? 'required' : ''}

  /*
  street1: "",
        street2: "",
        city: "",
        region: "",
        postcode: "",
        country: "",
        */
//          {this.widget({ name: "fname", label: "First Name" })}

  render() {
    return (
      <div>
        <form id={this.formID}>
          {this.getWidget({ name: "fname", label: "First Name" })}
          {this.getWidget({ name: "initial", required: false, label: "Initial" })}
          {this.getWidget({ name: "lname", label: "Last Name" })}
          {this.getWidget({ name: "street1",label: "Street Address 1" })}
          {this.getWidget({ name: "street2", label: "Street Address 2" })}
          {this.getWidget({ name: "region", label: "Region/State" })}
          {this.getWidget({ name: "postcode", label: "Postal Code" })}
          {this.getWidget({ name: "country", label: "Country" })}
          <button type="submit" className="btn btn-default">
            Submit
          </button>
        </form>
      </div>
    );
  }
}

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
