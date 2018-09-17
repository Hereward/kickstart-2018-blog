import * as React from "react";
import * as PropTypes from "prop-types";

interface IProps {
  handleChange: PropTypes.object.isRequired;
  wProps: any;
  dataObj?: any;
  widgetType: string;
  stateValue?: any;
  uncontrolled?: boolean;
  readOnly?: boolean;
}

interface IState {}

export default class Widget extends React.Component<IProps, IState> {
  baseCSSClass: string = "form-control tooltipster";
  simpleInputTypes: Array<string> = ["simple", "email", "text", "url"];
  defaultState: boolean = true;

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  static propTypes = {
    handleChange: PropTypes.func,
    default: PropTypes.string
  };

  componentDidMount() {
    this.defaultState = false;
  }

  componentDidUpdate() {}

  handleChange(e) {
    this.props.handleChange(e);
  }

  resolveControlledInputValue(resolvedname) {
    const { dataObj } = this.props;
    const { stateValue } = this.props;
    let val = stateValue;
    if (dataObj && this.defaultState && !stateValue) {
      val = this.props.dataObj ? this.props.dataObj[resolvedname] : "";
    }
    return val;
  }

  simple(wprops: {
    name: string;
    label?: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
    baseName?: string;
  }) {
    const { stateValue, uncontrolled, readOnly } = this.props;
    let cssClass = wprops.required === false ? this.baseCSSClass : `${this.baseCSSClass} required`;
    let resolvedname = wprops.baseName || wprops.name;
    let widget: any;
    const type = wprops.type || "text";
    const tagTypes = { text: "input", email: "input", textarea: "textarea" };
    const attributeTypes = { text: "text", email: "email" };
    const CustomTag = tagTypes[type];
    const typeAttribute = type === "textarea" ? "" : { type: attributeTypes[type] };
    const valueAttribute = uncontrolled
      ? { defaultValue: this.props.dataObj ? this.props.dataObj[wprops.name] : "" }
      : { value: this.resolveControlledInputValue(resolvedname) };
    // stateValue || (this.props.dataObj ? this.props.dataObj[resolvedname] : "")

    widget = (
      <CustomTag
        onChange={this.handleChange}
        className={cssClass}
        id={wprops.name}
        name={wprops.name}
        readOnly={readOnly || false}
        placeholder={wprops.placeholder || ""}
        {...typeAttribute}
        {...valueAttribute}
      />
    );

    let layout = (
      <div className="form-group">
        <label htmlFor={wprops.name}>{wprops.label || "Enter Text"}:</label>
        {widget}
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
