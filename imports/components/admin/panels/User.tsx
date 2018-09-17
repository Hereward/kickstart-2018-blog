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
import { toggleLocked, toggleRole, deleteUser, adminToggle2FA } from "../../../api/admin/methods";
import * as Library from "../../../modules/library";
import { userSettings } from "../../../api/settings/publish";
import * as UserModule from "../../../modules/user";
import Author from "../components/Author";

const defaultRoles = Meteor.settings.public.admin.roles;
let styles: any;

interface IProps {
  classes: any;
  theme: any;
  targetUserId: string;
  user: any;
  email: string;
  settings: any;
  ready: boolean;
  loggedInUserId: string;
  dispatch: any;
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
  userDetail: {
    overflowX: "auto",
    whiteSpace: "nowrap",
    width: "14rem",
    fontSize: "0.9rem",
    [theme.breakpoints.up("md")]: {
      fontSize: "1rem",
      width: "25rem"
    },
    [theme.breakpoints.up("lg")]: {
      width: "30rem"
    }
  },
  innerSection: {
    margin: "1rem 0 1rem 0",
    [theme.breakpoints.up("md")]: {
      marginLeft: "1rem"
    }
  },
  email: {
    width: "10rem",
    display: "block",
    verticalAlign: "top",
    [theme.breakpoints.up("lg")]: {
      marginLeft: "0.5rem",
      display: "inline-block"
    }
  },
  clickToView: {
    display: "block",
    marginTop: "0.5rem",
    [theme.breakpoints.up("md")]: {
      display: "none"
    }
  },
  clickToViewButton: {},
  listGroupItem: {},
  switch: {}
});

class User extends React.Component<IProps, IState> {
  cursorBlock: number = 1;
  currentLimitVal: number = 1;

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      allowSubmit: true,
      blockUI: false
    };
  }

  toggle2FA = userId => event => {
    adminToggle2FA.call({ id: userId }, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        log.error(`toggle2FA failed`, err);
      }
    });
  };

  toggleLocked = userId => event => {
    toggleLocked.call({ id: userId }, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        log.error(`toggleLocked failed`, err);
      }
    });
  };

  toggleRole = role => event => {
    toggleRole.call({ role: role, targetId: this.props.targetUserId }, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        log.error(`toggleRole failed`, err);
      }
    });
  };

  miniAlert = (message = "") => {
    this.props.dispatch({ type: "MINI_ALERT_ON", message: message });
  };

  getRoleStatus(role) {
    const val = Roles.userIsInRole(this.props.targetUserId, role);
    return val;
  }

  handleChange = panel => (event, expanded) => {};

  handleSubmit() {}

  confirmDelete = event => {
    this.setState({ blockUI: true });
    Library.confirmDialog().then(result => {
      if (result) {
        deleteUser.call({ id: this.props.targetUserId }, err => {
          if (err) {
            Library.modalErrorAlert(err.reason);
            log.error(`deleteUser failed`, err);
          } else {
            this.miniAlert("User Deleted!");
          }
          this.setState({ blockUI: false });
        });
      }
    });
  };

  viewData = type => {
    let data: string;
    if (type === "email") {
      data = this.props.user.emails[0].address;
    }
    Library.simpleAlert(data);
    return true;
  };

  layout() {
    const { classes, user, targetUserId } = this.props;

    if (this.props.ready) {
      const protectedUser = Roles.userIsInRole(targetUserId, ["god", "super-admin", "admin"]);
      const authEnabled = this.props.settings.authEnabled;
      return (
        <BlockUi tag="div" blocking={this.state.blockUI}>
          <div>
            <Author label="User Info" userId={user._id} />
          </div>
          <h3 className={classes.heading}>Properties</h3>
          <div className={classes.innerSection}>
            <FormControlLabel
              className={classes.switch}
              control={
                <Switch
                  disabled={protectedUser}
                  onChange={this.toggleLocked(targetUserId)}
                  checked={this.props.settings.locked}
                />
              }
              label={this.props.settings.locked ? "Locked" : "Unlocked"}
            />

            <FormControlLabel
              className={classes.switch}
              control={
                <Switch
                  disabled={protectedUser}
                  onChange={this.toggle2FA(targetUserId)}
                  checked={authEnabled === 1 || authEnabled === 2 || authEnabled === 3}
                />
              }
              label={this.props.settings.authEnabled ? "2F Auth ON" : "2F Auth OFF"}
            />
          </div>

          <h3 className={classes.heading}>Actions</h3>
          <div className={classes.innerSection}>
            <Button onClick={this.confirmDelete} variant="raised" size="small" color="secondary">
              Delete User
            </Button>
          </div>

          <div>
            <h3 className={classes.heading}>Roles</h3>
            <List>{this.mapRoles()}</List>
          </div>
        </BlockUi>
      );
    } else if (this.props.settings) {
      return "loading...";
    } else {
      return "Invitation sent, not activated...";
    }
  }

  mapRoles() {
    const { classes, targetUserId, loggedInUserId } = this.props;
    const layout = defaultRoles.map(role => {
      const allow = UserModule.hasAuthority(targetUserId, role);
      const disabled = !allow;
      return role !== "user" ? (
        <ListItem key={role} dense button className={classes.listItem}>
          <ListItemText primary={role} />
          <ListItemSecondaryAction>
            <Checkbox onChange={this.toggleRole(role)} disabled={disabled} checked={this.getRoleStatus(role)} />
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
    const user = Meteor.users.findOne(props.targetUserId);
    const settings = userSettings.findOne({ owner: props.targetUserId });

    return {
      user: user,
      settings: settings,
      ready: user && settings
    };
  })(withStyles(styles, { withTheme: true })(User))
);
