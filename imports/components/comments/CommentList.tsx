///<reference path="../../../index.d.ts"/>

import * as React from "react";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";

let styles: any;
styles = theme => ({});

interface IProps {}

interface IState {}

class CommentList extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className="container page-content">
        <h2>Oops...</h2>
        <p>ooh</p>
      </div>
    );
  }
}

export default connect()(
  withTracker(props => {
    return {};
  })(withStyles(styles, { withTheme: true })(CommentList))
);
