import * as React from "react";
import * as PropTypes from "prop-types";

interface IProps {
  handleChange: any;
  wProps: any;
  dataObj: any;
  widgetType: string;
}

interface IState {}

export default class Widget extends React.Component<IProps, IState> {
  baseCSSClass: string = "form-control tooltipster";

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  static propTypes = {
    handleChange: PropTypes.func,
    default: PropTypes.string
  };

  componentDidMount() {}

  handleChange(e) {
    this.props.handleChange(e);
  }

  simple(wprops: { name: string; label?: string; type?: string; required?: boolean; placeholder?: string }) {
    let cssClass = wprops.required === false ? this.baseCSSClass : `${this.baseCSSClass} required`;
    let layout = (
      <div className="form-group">
        <label htmlFor={wprops.name}>{wprops.label || "Enter Text"}:</label>
        <input
          onChange={this.handleChange}
          type={wprops.type || "text"}
          className={cssClass}
          id={wprops.name}
          name={wprops.name}
          placeholder={wprops.placeholder || ""}
          defaultValue={this.props.dataObj ? this.props.dataObj[wprops.name] : ""}
        />
      </div>
    );

    return layout;
  }

  render() {
    let props = this.props.wProps;
    if (this.props.widgetType === "simple") {
      return <div>{this.simple(props)}</div>;
    }
  }
}
