///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import { Link } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import { Profiles } from "../../../api/profiles/publish";
import Avatar from "..//Profile/Avatar";

let styles: any;

styles = theme => ({
  link: {}
});

interface IProps {
  classes: PropTypes.object.isRequired;
  profile: PropTypes.object.isRequired;
  dispatch: any;
}

interface IState {}

class Author extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  layout() {
    const { classes, profile } = this.props;
    return (
      <div>
        <Avatar profile={profile} imageId={profile.avatarId} />
        <Link className={classes.link} to={`/members/profile/${profile._id}`}>
          {profile.screenName}
        </Link>
      </div>
    );
  }

  render() {
    const { profile } = this.props;
    let layout: any = "";
    if (profile) {
      layout = this.layout();
    }
    return layout;
  }
}

export default withTracker(props => {
  let author: any;
  let profile: any;
  const authorId = props.authorId;
  profile = Profiles.findOne({ owner: authorId });

  return { profile: profile };
})(withStyles(styles, { withTheme: true })(Author));
