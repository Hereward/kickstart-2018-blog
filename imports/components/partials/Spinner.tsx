///<reference path="../../../index.d.ts"/>
import * as React from "react";
import Loader from "react-loader-spinner";

interface IProps {
  caption?: string;
  type: string;
  error?: any;
}

export default class Spinner extends React.Component<IProps> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getLayout() {
    const { caption, error } = this.props;
    let spinnerClass = `d-flex align-items-center spinner-${this.props.type}`;
    let layout = (
      <div className={spinnerClass}>
        <div className="m-auto spinner-holder">
          <Loader type="Oval" color="red" height="100" width="100" />
          {caption && <div className="mx-2 mt-2 spinner-caption">{this.props.caption}</div>}
          {error && <div className="mx-2 mt-2 spinner-caption">Error! Something bad happened :(</div>}
        </div>
      </div>
    );
    return layout;
  }

  render() {
    return this.getLayout();
  }
}
