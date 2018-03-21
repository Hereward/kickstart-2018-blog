import * as React from "react";
import * as PropTypes from "prop-types";
import DatePicker from "material-ui/DatePicker";
import * as dateFormat from "dateformat";
import * as jquery from "jquery";
import "tooltipster";

interface IProps {
  handleChange: any;
  handleSetStateUpstream: any;
  dataObj: any;
  name: string;
  label: string;
  required?: boolean;
}

interface IState {
  controlledDate: any;
}

export default class DateWidget extends React.Component<IProps, IState> {
  baseCSSClass: string = "form-control tooltipsterParent";
  hintText: string = "Choose a Date";
  formatDate: boolean = false;

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSetStateUpstream = this.handleSetStateUpstream.bind(this);
    let initialDate: any;

    this.state = {
      controlledDate: this.props.dataObj.dob ? new Date(this.props.dataObj.dob) : undefined
    };
  }

  static propTypes = {
    handleChange: PropTypes.func,
    handleSetStateUpstream: PropTypes.func,
    default: PropTypes.string,
    required: PropTypes.bool
  };

  componentDidMount() {}

  handleSetStateUpstream(sVar, sVal) {
    this.props.handleSetStateUpstream(sVar, sVal);
  }

  handleChange = (event, date) => {
    let dateStringISO = dateFormat(date, "yyyy-mm-dd");
    let dateStringPretty = dateFormat(date, "yyyy-mm-dd");
    this.setState({
      controlledDate: date
    });
    this.handleSetStateUpstream(this.props.name, dateStringISO);
    jquery(`#${this.props.name}`).tooltipster("close");
  };

  date() {
    let layout = (
      <div className="form-group">
        <label htmlFor={this.props.name}>{this.props.label || "Enter Text"}</label>
        <DatePicker
          name={this.props.name}
          id={this.props.name}
          hintText={this.hintText}
          className={this.baseCSSClass}
          value={this.state.controlledDate}
          onChange={this.handleChange}
          formatDate={date => dateFormat(date, "dd mmmm yyyy")}
          required={this.props.required === false ? false : true}
        />
      </div>
    );

    return layout;
  }

  render() {
    return <div>{this.date()}</div>;
  }
}
