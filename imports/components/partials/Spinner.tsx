///<reference path="../../../index.d.ts"/>
import * as React from "react";
import Loader from "react-loader-spinner";

interface IProps {
  caption: string;
}

export default class Spinner extends React.Component<IProps> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="d-flex align-items-center spinner-container">
        <div className="m-auto spinner-holder">
          <Loader type="Oval" color="red" height="120" width="120" />
          <div className="mx-2 mt-2 spinner-caption">{this.props.caption}</div>
        </div>
      </div>
    );
  }
}
