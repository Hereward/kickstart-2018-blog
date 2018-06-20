import * as React from "react";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import * as BlockUi from "react-block-ui";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { toggleLocked, toggleRole, deleteUser } from "../../../api/admin/methods";
import * as Library from "../../../modules/library";
import { userSettings } from "../../../api/settings/publish";
import * as UserModule from "../../../modules/user";
import OptionGroup from "../components/OptionGroup";

const defaultRoles = Meteor.settings.public.admin.roles;
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
  blockUI: boolean;
}

styles = theme => ({
  heading: {
    color: "#4d4d4d"
  },
  switchLabel: {
    fontWeight: "bold",
    color: "#4d4d4d"
  },
  innerSection: {
    margin: "1rem"
  }
});

class User extends React.Component<IProps, IState> {
  cursorBlock: number = 1;
  currentLimitVal: number = 1;
  //state: any;

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    //this.confirmDelete = this.confirmDelete.bind(this);

    this.state = {
      allowSubmit: true,
      blockUI: false
    };
  }

  toggleLocked = userId => event => {
    toggleLocked.call({ id: userId }, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        log.error(`toggleLocked failed`, err);
      }
    });
  };

  toggleRole = role => event => {
    toggleRole.call({ role: role, id: this.props.userId }, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        log.error(`toggleRole failed`, err);
      }
    });
  };

  getRoleStatus(role) {
    const val = Roles.userIsInRole(this.props.userId, role);
    return val;
  }

  handleChange = panel => (event, expanded) => {};

  handleSubmit() {}

  confirmDelete = (event) => {
    this.setState({ blockUI: true });
    Library.confirmDialog().then(result => {
      if (result) {
        deleteUser.call({ id: this.props.userId }, err => {
          if (err) {
            Library.modalErrorAlert(err.reason);
            log.error(`deleteUser failed`, err);
          }
          this.setState({ blockUI: false });
        });
      }
    });
  };

  layout() {
    const { classes } = this.props;
    return this.props.ready ? (
      <BlockUi tag="div" blocking={this.state.blockUI}>
        <h3 className={classes.heading}>Data</h3>
        <div className={classes.innerSection}>
          <ul className="list-group">
            <li className="list-group-item">
              <strong>id:</strong> {this.props.user._id}
            </li>
            <li className="list-group-item">
              <strong>email:</strong> {this.props.user.emails[0].address}
            </li>
          </ul>
        </div>

        <h3 className={classes.heading}>Properties</h3>
        <div className={classes.innerSection}>
          <FormControlLabel
            control={<Switch onChange={this.toggleLocked(this.props.userId)} checked={this.props.settings.locked} />}
            label={this.props.settings.locked ? "Locked" : "Unlocked"}
          />
        </div>

        <h3 className={classes.heading}>Actions</h3>
        <div className={classes.innerSection}>
          <Button onClick={this.confirmDelete} variant="raised" size="small" color="secondary">
            Delete User
          </Button>
        </div>

        <div>
          <h3 className={classes.heading}>Groups</h3>
          <List>{this.mapRoles()}</List>
        </div>
      </BlockUi>
    ) : (
      "loading..."
    );
  }

  mapRoles() {
    const { classes } = this.props;
    const isGod = UserModule.can({ threshold: "god" });
    const layout = defaultRoles.map(value => {
      return value !== "user" && (value !== "god" || isGod) ? (
        <ListItem key={value} dense button className={classes.listItem}>
          <ListItemText primary={value} />
          <ListItemSecondaryAction>
            <Checkbox onChange={this.toggleRole(value)} checked={this.getRoleStatus(value)} />
          </ListItemSecondaryAction>
        </ListItem>
      ) : (
        ""
      );
    });

    return layout;
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
