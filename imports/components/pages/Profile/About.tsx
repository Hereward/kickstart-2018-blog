///<reference path="../../../../index.d.ts"/>
import * as React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
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

  render() {
    return this.layout();
  }
}

export default withStyles(styles, { withTheme: true })(About);
