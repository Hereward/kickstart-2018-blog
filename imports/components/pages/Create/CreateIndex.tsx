///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";

let styles: any;
styles = theme => ({});

interface IProps {
  classes: PropTypes.object.isRequired;
  dispatch: any;
}

interface IState {}

class Boojam extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div className="container page-content">
        {" "}
        <h1>Create</h1>
        <p>oink</p>
      </div>
    );
  }
}

export default connect()(
  withTracker(props => {
    return {};
  })(withStyles(styles, { withTheme: true })(Boojam))
);
