///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import { Link } from "react-router-dom";
import * as classNames from "classnames";
import GenericPersonIcon from "@material-ui/icons/Person";
import PageviewIcon from '@material-ui/icons/Pageview';
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
//import { Profiles } from "../../../api/profiles/publish";
import { AvatarImages } from "../../../api/images/methods";

let styles: any;

styles = theme => ({
  avatar: {
    //margin: 10
  },
  large: {
    width: 100,
    height: 100
  },
  small: {
    width: 50,
    height: 50,
    float: "left",
    marginRight: "1rem"
  },
  letter: {
  }
});

interface IProps {
  classes: PropTypes.object.isRequired;
  imageObject: PropTypes.object.isRequired;
  profile: PropTypes.object.isRequired;
  size?: string;
  altTag: string;
}

interface IState {}

class AvatarClass extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  getImage() {
    const { classes, imageObject, altTag, size, profile } = this.props;

    let configuredSize = size || "small";

    const sizeClass = classes[configuredSize];

    let layout: any = "";
    if (imageObject) {
      const link = AvatarImages.link(imageObject);
      log.info(`Avatar.getImage()`, link, this.props);
      layout = <Avatar alt="AVATAR" src={link} className={classNames(classes.avatar, sizeClass)} />;
      //return <Avatar alt="BOOJAM" src={link} className={classNames(classes.avatar, classes.bigAvatar)} />; //classNames(classes.avatar, classes.bigAvatar)
    } else {
      const letter = profile.screenName.substring(0, 1);
      layout = (
        <Avatar alt="AVATAR" className={classNames(classes.avatar, sizeClass)}><span className={classes.letter}>{letter}</span></Avatar>
      );
    }

    return layout;
  }

  render() {
    return this.getImage();
  }
}

export default withTracker(props => {
  const avatarImagesDataHandle = Meteor.subscribe("avatarImages");
  let imageObject: any = "";

  if (props.imageId && avatarImagesDataHandle.ready()) {
    const cursor: any = AvatarImages.find({ _id: props.imageId });
    const count = cursor.count();
    log.info(`Avatar.tracker() count = [${count}]`, cursor, props);
    imageObject = cursor.fetch()[0];
  }

  return { imageObject: imageObject };
})(withStyles(styles, { withTheme: true })(AvatarClass));
