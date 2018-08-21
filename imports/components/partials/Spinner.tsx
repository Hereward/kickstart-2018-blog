///<reference path="../../../index.d.ts"/>
import * as React from "react";
import Loader from "react-loader-spinner";

interface IProps {
  caption?: string;
  type?: string;
  error?: any;
}

export default class Spinner extends React.Component<IProps> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getLayout() {
    const { caption, error } = this.props;
    let spinnerClass = `d-flex align-items-center spinner`;
    let layout = (
      <div className={spinnerClass}>
        <div className="spinner-holder">
          <Loader type="Oval" color="red" height="60" width="60" />
          {caption && <div className="mx-2 spinner-caption">{this.props.caption}</div>}
          {error && <div className="mx-2 spinner-caption">Error! Something bad happened :(</div>}
        </div>
      </div>
    );
    return layout;
  }

  render() {
    return this.getLayout();
  }
}
