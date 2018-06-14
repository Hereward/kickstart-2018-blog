import * as React from "react";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { toggleLocked } from "../../../api/admin/methods";
import * as Library from "../../../modules/library";
import { userSettings } from "../../../api/settings/publish";

const drawerWidth = 240;
let styles: any;

interface IProps {
  classes: any;
  theme: any;
  userId: string;
  user: any;
  email: string;
  settings: any;
  ready: boolean;
}

interface IState {
  [x: number]: any;
  allowSubmit: boolean;
}

styles = theme => ({});

class User extends React.Component<IProps, IState> {
  cursorBlock: number = 1;
  currentLimitVal: number = 1;
  //state: any;

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      allowSubmit: true
    };
  }

  toggleLocked = userId => event => {
    toggleLocked.call({ id: userId }, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`toggleLocked failed`, err);
      }
    });
  };


  handleChange = panel => (event, expanded) => {};

  handleSubmit() {}

  layout() {
    const { classes } = this.props;
    return this.props.ready ? (
      <div>
        <div>
          <Typography>Detailed info for {this.props.user.emails[0].address}.</Typography>
        </div>

        <div>
          <FormControlLabel
            control={<Switch onChange={this.toggleLocked(this.props.userId)} checked={this.props.settings.locked} />}
            label={this.props.settings.locked ? 'Locked' : "Unlocked"}
          />
        </div>
      </div>
    ) : (
      "loading..."
    );
  }

  render() {
    return this.layout();
  }
}

const mapStateToProps = state => {
  return {};
};

export default connect(mapStateToProps)(
  withTracker(props => {
    const usersHandle = Meteor.subscribe("allUsers");
    const settingsHandle = Meteor.subscribe("allSettings");
    const user = Meteor.users.findOne(props.userId);
    const settings = userSettings.findOne({ owner: props.userId });

    log.info(`user`, props.userId, user, settings);

    return {
      user: user,
      settings: settings,
      ready: user && settings
    };
  })(withStyles(styles, { withTheme: true })(User))
);
