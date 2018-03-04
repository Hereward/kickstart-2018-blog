import * as React from "react";
import * as PropTypes from "prop-types";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";

interface IProps {
  handleChange: any;
  dataObj: any;
}

interface IState {
  country: string;
  region: string;
}

export default class CountryWidget extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = {
      country: this.props.dataObj.country,
      region: this.props.dataObj.region
    };
  }

  static propTypes = {
    handleChange: PropTypes.func,
    default: PropTypes.string
  };

  componentDidMount() {}

  handleChange(e) {
    this.props.handleChange(e);
  }

  selectCountry(val, event) {
    console.log(`selectCountry`, val);
    this.setState({ country: val });
    this.props.handleChange(event);
  }

  selectRegion(val, event) {
    console.log(`selectRegion`, val);
    this.setState({ region: val });
    this.props.handleChange(event);
  }

  render() {
    return (
      <div>
        <div className="form-group">
          <label htmlFor="country">country</label>
          <CountryDropdown
            classes="required tooltipster form-control"
            value={this.state.country}
            onChange={(val, event) => {
              this.selectCountry(val, event);
            }}
            id="country"
            name="country"
          />
        </div>
        <div className="form-group">
          <label htmlFor="region">region</label>
          <RegionDropdown
            classes="required tooltipster form-control"
            country={this.state.country}
            value={this.state.region}
            onChange={(val, event) => {
              this.selectRegion(val, event);
            }}
            id="region"
            name="region"
          />
        </div>
      </div>
    );
  }
}
