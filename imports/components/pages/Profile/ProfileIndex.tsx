///<reference path="../../../../index.d.ts"/>

import { Meteor } from "meteor/meteor";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import Transition from "../../partials/Transition";
import { Profiles } from "../../../api/profiles/publish";

import Spinner from "../../partials/Spinner";
import MetaWrapper from "../../partials/MetaWrapper";
import ProfilePosts from "./ProfilePosts";
import About from "./About";
import { Posts } from "../../../api/posts/publish";
import Settings from "./Settings";
import { AvatarImages } from "../../../api/images/methods";

let styles: any;
styles = theme => ({
  cardHeader: {
    fontWeight: "bold"
  },
  tabsRoot: {
    flexGrow: 1,
    width: "100%",
    backgroundColor: "transparent",
    marginTop: "-0.4rem"
  }
});

interface IProps {
  match: PropTypes.object.isRequired;
  history: PropTypes.object.isRequired;
  classes: PropTypes.object.isRequired;
  systemSettings: PropTypes.object.isRequired;
  enhancedAuth: boolean;
  signedIn: boolean;
  profile: any;
  userData: any;
  userSettings: any;
  userEmail: string;
  emailVerified: boolean;
  userId: string;
  totalPosts: number;
  profileUserId: string;
  avatarImage: PropTypes.object.isRequired;
}

interface IState {
  tabValue: number;
}

class Profile extends React.Component<IProps, IState> {
  ownerView: boolean;

  constructor(props) {
    super(props);

    this.ownerView = props.userId === props.profile.owner;
    this.state = {
      tabValue: 0
    };
  }

  handleTabChange = (event, tabValue) => {
    this.setState({ tabValue });
  };

  tabItem(val: number) {
    const {
      match,
      userId,
      totalPosts,
      profile,
      avatarImage,
      profileUserId,
      emailVerified,
      enhancedAuth,
      userSettings
    } = this.props;
    let imageObj: any;
    //let link: any;
    switch (val) {
      case 0:
        if (totalPosts) {
          return (
            <div className="container">
              <ProfilePosts profile={profile} profileUserId={profileUserId} userId={userId} match={match} />
            </div>
          );
        } else {
          return <Spinner />;
        }

      case 1:
        return (
          <Transition>
            <div className="container">
              <About profile={profile} />
            </div>
          </Transition>
        );

      case 2:
        return (
          <div className="container">
            <Transition>
              <Settings
                userSettings={userSettings}
                enhancedAuth={enhancedAuth}
                emailVerified={emailVerified}
                avatarImage={avatarImage}
                userId={userId}
                profile={profile}
              />
            </Transition>
          </div>
        );

      default:
        return "";
    }
  }

  tabContents() {
    const { classes } = this.props;
    const { tabValue } = this.state;

    return (
      <div className={classes.tabsRoot}>
        <AppBar position="static" color="inherit">
          <Tabs
            className={classes.tabs}
            value={tabValue}
            onChange={this.handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            scrollable
            scrollButtons="auto"
          >
            <Tab label="Posts" />
            <Tab label="About" />
            {this.ownerView && <Tab label="Settings" />}
          </Tabs>
        </AppBar>
        {this.tabItem(tabValue)}
      </div>
    );
  }

  componentDidUpdate() {}

  componentWillUnmount() {}

  getMeta() {
    return (
      <MetaWrapper
        path={this.props.history.location.pathname}
        settings={this.props.systemSettings}
        title="Profile Page"
      />
    );
  }

  render() {
    const { profile } = this.props;
    return profile ? (
      <div>
        {this.getMeta()}
        {this.tabContents()}
      </div>
    ) : (
      <div className="page-content">
        <Spinner />
      </div>
    );
  }
}

export default withTracker(props => {
  log.info(`ProfileIndex tracker`, props);
  let avatarImage: any;
  const postsHandle = Meteor.subscribe("posts");
  const postsReady = postsHandle.ready();
  const avatarImagesDataHandle = Meteor.subscribe("avatarImages");

  //const profilesPublicHandle = Meteor.subscribe("profiles.public");

  const profileUserId = props.match.params.userId;
  const profile = Profiles.findOne({ owner: profileUserId });
  //log.info(`ProfileIndex tracker`, profile);
  let userEmail: string;
  let emailVerified: boolean = false;
  let totalPosts = 0;
  //let totalPublished = 0;

  if (props.userData) {
    emailVerified = props.userData.emails[0].verified;
    userEmail = props.userData.emails[0].address;
  }

  if (avatarImagesDataHandle.ready()) {
    if (profile) {
      const cursor: any = AvatarImages.find({ _id: profile.avatarId });
      avatarImage = cursor.fetch()[0];
    }
  }

  if (postsReady) {
    totalPosts = Posts.find({ authorId: profileUserId }).count();
  }

  log.info(`ProfileIndex tracker`, profile.avatarId, avatarImage);

  return {
    profile: profile,
    avatarImage: avatarImage,
    userEmail: userEmail,
    emailVerified: emailVerified,
    totalPosts: totalPosts,
    profileUserId: profileUserId
  };
})(withStyles(styles, { withTheme: true })(Profile));
