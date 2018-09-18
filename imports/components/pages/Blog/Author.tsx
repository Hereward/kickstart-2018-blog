///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import { Link } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import * as PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import { Profiles } from "../../../api/profiles/publish";
import Avatar from "..//Profile/Avatar";

let styles: any;

styles = theme => ({
  root: {},
  author: {
    marginLeft: "1rem",
    textTransform: "capitalize"
  },
  link: {
    color: "black"
  }
});

interface IProps {
  classes: PropTypes.object.isRequired;
  profile: PropTypes.object.isRequired;
  authorId: string;
  dispatch: any;
}

interface IState {}

class Author extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  layout() {
    const { classes, authorId, profile } = this.props;
    return (
      <div className="d-flex align-items-center">
        <Avatar profile={profile} imageId={profile.avatarId} />
        <div className={classes.author}>
          <Link className={classes.link} to={`/members/profile/${authorId}`}>
            {profile.screenName}
          </Link>
        </div>
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

  return { authorId: authorId, profile: profile };
})(withStyles(styles, { withTheme: true })(Author));
