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
  constructor(props) {
    super(props);
  }

  static propTypes = {
    handleChange: PropTypes.func,
    default: PropTypes.string
  };

  componentDidMount() {}

  simple(wprops: {
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
          onChange={this.props.handleChange}
          type={wprops.type || "text"}
          className="form-control tooltipster"
          id={wprops.name}
          name={wprops.name}
          placeholder={wprops.placeholder || ""}
          defaultValue={
            this.props.dataObj ? this.props.dataObj[wprops.name] : ""
          }
          required={wprops.required === false ? false : true}
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
