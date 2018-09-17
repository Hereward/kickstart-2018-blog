///<reference path="../../../../index.d.ts"/>
import * as React from "react";
import * as PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import Avatar from "./Avatar";

let styles: any;
styles = theme => ({
  heading: {
    marginBottom: "1rem",
    textTransform: "capitalize"
  },
  about: {
    fontStyle: "italic"
  },
  avatar: {
    marginBottom: "1rem"
  },
  image: {
    maxWidth: "200px",
    display: "block",
    marginBottom: "1rem"
  }
});

interface IProps {
  classes: PropTypes.object.isRequired;
  profile: PropTypes.object.isRequired;
  dispatch: any;
}

interface IState {}

class About extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  layout() {
    const { profile, classes } = this.props;
    let image: any = "";

    return (
      <div>
        <h1 className={classes.heading}>{profile.screenName}</h1>
        {profile.avatarId && (
          <div className={classes.avatar}>
            <Avatar profile={profile} size="large" imageId={profile.avatarId} />
          </div>
        )}
        <div className={classes.about}>{profile.about}</div>
      </div>
    );
  }

  render() {
    return this.layout();
  }
}

export default withStyles(styles, { withTheme: true })(About);
