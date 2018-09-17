///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import { Link } from "react-router-dom";
import * as classNames from "classnames";
import { Meteor } from "meteor/meteor";
import * as PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import Avatar from "@material-ui/core/Avatar";
import { AvatarImages } from "../../../api/images/methods";

let styles: any;

styles = theme => ({
  avatar: {},
  large: {
    width: 100,
    height: 100
  },
  small: {
    width: 50,
    height: 50
  },
  tiny: {
    width: 25,
    height: 25
  },
  letter: {
    textTransform: "uppercase"
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
    const letter = profile.screenName.substring(0, 1);
    const sizeClass = classes[configuredSize];
    let layout: any = "";
    if (imageObject) {
      const link = AvatarImages.link(imageObject);
      layout = <Avatar alt="AVATAR" src={link} className={classNames(classes.avatar, sizeClass)} />;
    } else {
      layout = (
        <Avatar alt="AVATAR" className={classNames(classes.avatar, sizeClass)}>
          <span className={classes.letter}>{letter}</span>
        </Avatar>
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
    imageObject = cursor.fetch()[0];
  }

  return { imageObject: imageObject };
})(withStyles(styles, { withTheme: true })(AvatarClass));
