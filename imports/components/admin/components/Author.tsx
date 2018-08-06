///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import { Divider } from "@material-ui/core";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import OptionGroup from "./OptionGroup";
//import { userInfo } from "os";

let styles: any;
styles = theme => ({
  authorInfo: {
    marginLeft: "1rem",
    fontStyle: "italic"
  }
});

interface IProps {
  classes: PropTypes.object.isRequired;
  dispatch: any;
  userId: string;
  user: PropTypes.object.isRequired;
}

interface IState {
  showAuthorInfo: boolean;
}

class Author extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      showAuthorInfo: false
    };
  }

  toggleAuthor = () => {
    const vis = !this.state.showAuthorInfo;
    this.setState({ showAuthorInfo: vis });
  };

  authorDetails() {
    const { user, classes } = this.props;
    return (
      <div className={classes.authorInfo}>
        {user._id} <br />
        {user.emails[0].address}
      </div>
    );
  }

  layout() {
    const layout = (
      <OptionGroup
        show={this.state.showAuthorInfo}
        transparent={true}
        label="Author Info"
        action={this.toggleAuthor}
      >
        {this.authorDetails()}
      </OptionGroup>
    );

    return layout;
  }

  render() {
    return this.props.user ? this.layout() : "";
  }
}

export default connect()(
  withTracker(props => {
    const usersHandle = Meteor.subscribe("allUsers");
    const user = Meteor.users.findOne(props.userId);
    //log.info(`Author tracker`, props);
    return { user: user };
  })(withStyles(styles, { withTheme: true })(Author))
);
