import * as React from "react";
import * as PropTypes from "prop-types";

interface IProps {
  handleChange: any;
  wProps: any;
  dataObj?: any;
  widgetType: string;
  stateValue?: any;
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

  simple(wprops: {
    name: string;
    label?: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
    baseName?: string;
  }) {
    const { stateValue } = this.props;

    let cssClass = wprops.required === false ? this.baseCSSClass : `${this.baseCSSClass} required`;
    let resolvedname = wprops.baseName || wprops.name;

    //const overrideVal = override && override[name] ? override[name] : "";
    let widget: any;
    const type = wprops.type || "text";
    if (type !== "textarea") {
      widget = (
        <input
          onChange={this.handleChange}
          type={type}
          className={cssClass}
          id={wprops.name}
          name={wprops.name}
          placeholder={wprops.placeholder || ""}
          value={stateValue || (this.props.dataObj ? this.props.dataObj[resolvedname] : "")}
        />
      );
    } else {
      widget = (
        <textarea
          onChange={this.handleChange}
          className={cssClass}
          id={wprops.name}
          name={wprops.name}
          placeholder={wprops.placeholder || ""}
        >
          {stateValue || (this.props.dataObj ? this.props.dataObj[resolvedname] : "")}
        </textarea>
      );
    }

    let layout = (
      <div className="form-group">
        <label htmlFor={wprops.name}>{wprops.label || "Enter Text"}:</label>
        {widget}
      </div>
    );

    return layout;
  }

  // defaultValue={this.props.dataObj ? this.props.dataObj[resolvedname] : ""}

  render() {
    let props = this.props.wProps;
    const simple = this.simpleInputTypes.includes(this.props.widgetType);
    if (simple) {
      return <div>{this.simple(props)}</div>;
    }
  }
}
