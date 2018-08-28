///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";

let styles: any;
styles = theme => ({});

interface IProps {}

interface IState {}

class Error404 extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className="page-content">
        {" "}
        <h1>Oops...</h1>
        <p>Page Not Found</p>
      </div>
    );
  }
}

export default connect()(
  withTracker(props => {
    return {};
  })(withStyles(styles, { withTheme: true })(Error404))
);
