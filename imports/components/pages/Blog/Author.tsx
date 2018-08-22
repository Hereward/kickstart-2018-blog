///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import { Link } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import { Profiles } from "../../../api/profiles/publish";

let styles: any;

styles = theme => ({
  link: {}
});

interface IProps {
  classes: PropTypes.object.isRequired;
  dispatch: any;
  author: string;
  authorId: string;
}

interface IState {}

class Author extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { author, authorId, classes } = this.props;
    return <Link className={classes.link} to={`/members/profile/${authorId}`}>{author}</Link>;
  }
}

export default withTracker(props => {
  let profilesHandle = Meteor.subscribe("profiles.public");
  let author: any;
  let profile: any;
  //let profileCursor: any;
  //let count: any;
  const authorId = props.authorId;
  if (profilesHandle.ready()) {
    profile = Profiles.findOne({ owner: authorId });
    //profileCursor = Profiles.find();
    //count = profileCursor.count();
    
    //log.info(`Author tracker`, profile);
    if (profile) {
      author = profile.screenName;
    }
  }

  return { author: author };
})(withStyles(styles, { withTheme: true })(Author));
