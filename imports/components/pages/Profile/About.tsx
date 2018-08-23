///<reference path="../../../../index.d.ts"/>

import * as React from "react";

//import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
//import { connect } from "react-redux";
//import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
//import Image from "../../partials/Image";
import { ProfileImages } from "../../../api/images/methods";

let styles: any;
styles = theme => ({
  heading: {
    marginBottom: "1rem"
  },
  about: {
    fontStyle: "italic"
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
  imageObj: PropTypes.object.isRequired;
  dispatch: any;
}

interface IState {}

class About extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  
  layout() {
    const { profile, classes, imageObj } = this.props;
    let image: any = "";
    if (imageObj) {
      const link = ProfileImages.link(imageObj);
      image = <img className={classes.image} src={link} alt={imageObj.fileName} />;
    }
    return (
      <div>
        <h1 className={classes.heading}>{profile.screenName}</h1>
        {image}
        <div className={classes.about}>{profile.about}</div>
      </div>
    );
  }

  // <img className={classes.image} src={link} alt={imageObj.fileName} />
  

  render() {
    return this.layout();
  }
}

/*
export default connect()(
  withTracker(props => {
    return {};
  })(withStyles(styles, { withTheme: true })(About))
);
*/

export default withStyles(styles, { withTheme: true })(About);
