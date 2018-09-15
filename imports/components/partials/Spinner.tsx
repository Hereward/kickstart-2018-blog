///<reference path="../../../index.d.ts"/>
import * as React from "react";
import PropTypes from "prop-types";
import Loader from "react-loader-spinner";
import { withStyles } from "@material-ui/core/styles";

interface IProps {
  caption?: string;
  type?: string;
  error?: any;
  classes: PropTypes.object.isRequired;
}

const styles: any = theme => ({
  spinner: {
    opacity: "0.5",
    margin: "2rem"
  },
  spinnerCaption: {
    textAlign: "center",
    fontSize: "0.9rem",
    color: "red"
  },
  spinnerHolder: {
    margin: "auto",
    textAlign: "center"
  }
});

class Spinner extends React.Component<IProps> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getLayout() {
    const { caption, error, classes } = this.props;
    let layout = (
      <div className={`d-flex align-items-center ${classes.spinner}`}>
        <div className={classes.spinnerHolder}>
          <Loader type="Oval" color="red" height="60" width="60" />
          {caption && <div className={`mx-2 ${classes.spinnerCaption}`}>{this.props.caption}</div>}
          {error && <div className={`mx-2 ${classes.spinnerCaption}`}>Error! Something bad happened :(</div>}
        </div>
      </div>
    );
    return layout;
  }

  render() {
    return this.getLayout();
  }
}

export default withStyles(styles, { withTheme: true })(Spinner);
