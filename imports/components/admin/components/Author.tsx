///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import { Link } from "react-router-dom";
import { Divider } from "@material-ui/core";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import OptionGroup from "./OptionGroup";
import { Profiles } from "../../../api/profiles/publish";
//import { userInfo } from "os";

let styles: any;
styles = theme => ({
  authorInfo: {
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
  dispatch: any;
  userId: string;
  user: PropTypes.object.isRequired;
  profile: PropTypes.object.isRequired;
  label?: string;
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
    const { user, classes, profile } = this.props;

    const profileLink = profile ? <span><strong>{profile.screenName}</strong> <Link to={`/members/profile/${user._id}`}>[view profile]</Link></span> : "";
    return (
      <div className={classes.authorInfo}>
        <div>
          <strong>id:</strong> {user._id}
        </div>
        {profileLink && <div>{profileLink}</div>}
        <div>{user.emails[0].address}</div>
      </div>
    );
  }

  layout() {
    const { label } = this.props;
    const layout = (
      <OptionGroup show={this.state.showAuthorInfo} transparent={true} label={label || "Author Info"} action={this.toggleAuthor}>
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

    const profile = Profiles.findOne({ owner: props.userId });
    //log.info(`Author tracker`, props);
    return { user: user, profile: profile };
  })(withStyles(styles, { withTheme: true })(Author))
);
