///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import { Link } from "react-router-dom";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import OptionGroup from "./OptionGroup";
import { Profiles } from "../../../api/profiles/publish";

let styles: any;
styles = theme => ({
  authorInfo: {
    marginLeft: "1rem",
    padding: 0,
    fontSize: "0.9rem",
    "& li": {
      padding: "0.1rem 0",
      display: "block"
    },
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

    const profileLink = profile ? (
      <span>
        <strong>{profile.screenName}</strong> <Link to={`/members/profile/${user._id}`}>[view profile]</Link>
      </span>
    ) : (
      ""
    );

    return (
      <List className={classes.authorInfo}>
        <ListItem>
          <strong>id:</strong> {user._id}
        </ListItem>
        {profileLink && <ListItem>{profileLink}</ListItem>}
        <ListItem>{user.emails[0].address}</ListItem>
      </List>
    );
  }

  layout() {
    const { label } = this.props;
    const layout = (
      <OptionGroup
        show={this.state.showAuthorInfo}
        transparent={true}
        label={label || "Author Info"}
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
    const profile = Profiles.findOne({ owner: props.userId });
    return { user: user, profile: profile };
  })(withStyles(styles, { withTheme: true })(Author))
);
