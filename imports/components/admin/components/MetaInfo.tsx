///<reference path="../../../../index.d.ts"/>

import * as React from "react";
//import { Divider } from "@material-ui/core";
import * as dateFormat from "dateformat";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import OptionGroup from "./OptionGroup";
//import { userInfo } from "os";

let styles: any;
styles = theme => ({
  info: {
    marginLeft: "1rem",
    fontStyle: "italic",
    maxWidth: "13rem",
    [theme.breakpoints.up("md")]: {
      maxWidth: "20rem"
    },
    [theme.breakpoints.up("lg")]: {
      maxWidth: "25rem"
    }
  }
});

interface IProps {
  classes: PropTypes.object.isRequired;
  data: PropTypes.object.isRequired;
}

interface IState {
  open: boolean;
}

class MetaInfo extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      open: false
    };
  }

  toggle = () => {
    const vis = !this.state.open;
    this.setState({ open: vis });
  };

  info() {
    const { classes, data } = this.props;
    return (
      <div className={classes.info}>
        <strong>id:</strong> {data._id} <br />
        <strong>c:</strong> {dateFormat(data.created, "dd mmmm yyyy")} <br />
        <strong>m:</strong> {dateFormat(data.modified, "dd mmmm yyyy")}
      </div>
    );
  }

  layout() {
    const layout = (
      <OptionGroup show={this.state.open} transparent={true} label="Meta Info" action={this.toggle}>
        {this.info()}
      </OptionGroup>
    );

    return layout;
  }

  render() {
    return this.layout();
  }
}

export default connect()(
  withTracker(props => {
    //const usersHandle = Meteor.subscribe("allUsers");
    //const user = Meteor.users.findOne(props.userId);
    //log.info(`Author tracker`, props);
    return {};
  })(withStyles(styles, { withTheme: true })(MetaInfo))
);
