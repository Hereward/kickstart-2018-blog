///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import { Meteor } from "meteor/meteor";
import * as PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import { EditorialImages } from "../../../api/images/methods";

let styles: any;

styles = theme => ({
  editorialImage: {
    display: "block",
    maxWidth: "500px",
    margin: "1rem 0",
    borderRadius: "7px",
    height: "auto",
    [theme.breakpoints.down("sm")]: {
      maxWidth: "100%;"
    }
  }
});

interface IProps {
  classes: PropTypes.object.isRequired;
  imageObject: PropTypes.object.isRequired;
  altTag: string;
}

interface IState {}

class EditorialImage extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  getImage() {
    const { classes, imageObject, altTag } = this.props;
    let layout: any = "";
    if (imageObject.length) {
      const link = EditorialImages.link(imageObject[0]);
      layout = <img className={classes.editorialImage} src={link} alt={altTag} />;
    }

    return layout;
  }

  render() {
    return this.getImage();
  }
}

export default withTracker(props => {
  let imagesDataHandle = Meteor.subscribe("editorialImages");
  let imageObject: string[] = [];

  if (props.imageId && imagesDataHandle.ready()) {
    const cursor: any = EditorialImages.find({ _id: props.imageId });
    imageObject = cursor.fetch();
  }

  return { imageObject: imageObject };
})(withStyles(styles, { withTheme: true })(EditorialImage));
