///<reference path="../../../index.d.ts"/>
import * as React from "react";
import Loader from "react-loader-spinner";

interface IProps {
  caption: string;
  type: string;
}

export default class Spinner extends React.Component<IProps> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getLayout() {
    let spinnerClass = `d-flex align-items-center spinner-${this.props.type}`;
    let layout = (
      <div className={spinnerClass}>
        <div className="m-auto spinner-holder">
          <Loader type="Oval" color="red" height="140" width="140" />
          <div className="mx-2 mt-2 spinner-caption">{this.props.caption}</div>
        </div>
      </div>
    );
    return layout;
  }

  render() {
    return this.getLayout();
  }
}
