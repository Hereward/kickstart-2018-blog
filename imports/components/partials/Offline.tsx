import * as React from "react";
import Typography from "@material-ui/core/Typography";
import { withStyles } from "@material-ui/core/styles";
import SyncProblem from "@material-ui/icons/SyncProblem";

let styles: any;

interface IProps {
  classes: any;
}

styles = theme => ({
  offline: {
    marginTop: "15%",
    textAlign: "center",
    fontWeight: "bold",
    color: "red",
    margin: "auto"
  },
  message: {
    maxWidth: "30rem",
    fontWeight: "bold",
    margin: "auto"
  }
});

class Offline extends React.Component<IProps> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  getLayout() {
    let layout = (
      <div className={`container ${this.props.classes.offline}`}>
        <div>
          <SyncProblem color="error" style={{ fontSize: 80 }} />
        </div>
        <Typography className={this.props.classes.message} variant="title" color="error">
          We are doing scheduled maintentance.<br />Please come back later.
        </Typography>
      </div>
    );
    return layout;
  }

  render() {
    return this.getLayout();
  }
}

export default withStyles(styles, { withTheme: true })(Offline);
