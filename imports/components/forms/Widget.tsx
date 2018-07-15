import * as React from "react";
import * as PropTypes from "prop-types";

interface IProps {
  handleChange: any;
  wProps: any;
  dataObj?: any;
  widgetType: string;
}

interface IState {}



export default class Widget extends React.Component<IProps, IState> {
  baseCSSClass: string = "form-control tooltipster";
  simpleInputTypes: Array<string> = ["simple", "email", "text", "url"];

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

  simple(wprops: { name: string; label?: string; type?: string; required?: boolean; placeholder?: string; baseName?: string }) {
    let cssClass = wprops.required === false ? this.baseCSSClass : `${this.baseCSSClass} required`;
    let resolvedname =  wprops.baseName ||  wprops.name;
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
          defaultValue={this.props.dataObj ? this.props.dataObj[resolvedname] : ""}
        />
      </div>
    );

    return layout;
  }

  render() {
    let props = this.props.wProps;
    const simple = this.simpleInputTypes.includes(this.props.widgetType);
    if (simple) {
      return <div>{this.simple(props)}</div>;
    }
  }
}
