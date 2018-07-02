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
//import { toggleAuthEnabledPending } from "../../../api/settings/methods";
//import { purgeAllSessions } from "../../../api/sessions/methods";
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
    overflowX: "scroll",
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
    toggleRole.call({ role: role, id: this.props.userId }, err => {
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
    const val = Roles.userIsInRole(this.props.userId, role);
    return val;
  }

  handleChange = panel => (event, expanded) => {};

  handleSubmit() {}

  confirmDelete = event => {
    this.setState({ blockUI: true });
    Library.confirmDialog().then(result => {
      if (result) {
        deleteUser.call({ id: this.props.userId }, err => {
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
    //Library.confirmDialog({ title: data, message: "off", icon: "off" });
    return true;
  };

  /*
  <div className={classes.clickToView}>
                  <Button
                    className={classes.clickToViewButton}
                    onClick={e => this.viewData("email")}
                    color="secondary"
                    variant="raised"
                    size="small"
                  >
                    view
                  </Button>
                </div>
                */

  /*
                 <ul className="list-group">
              <li className={`list-group-item ${classes.listGroupItem}`}>
                <strong>id:</strong> {this.props.user._id}
              </li>
              <li className={`list-group-item ${classes.listGroupItem}`}>
                <strong>email:</strong> <span className={classes.email}>{this.props.user.emails[0].address}</span>
              </li>
            </ul>

            */

  layout() {
    const { classes } = this.props;

    if (this.props.ready) {
      const protectedUser = Roles.userIsInRole(this.props.userId, ["god", "super-admin"]);
      const authEnabled = this.props.settings.authEnabled;
      return (
        <BlockUi tag="div" blocking={this.state.blockUI}>
          <h3 className={classes.heading}>User Data</h3>
          <div className={`${classes.innerSection} ${classes.userDetail}`}>{this.props.user._id}<br />{this.props.user.emails[0].address}</div>

          <h3 className={classes.heading}>Properties</h3>
          <div className={classes.innerSection}>
            <FormControlLabel
              className={classes.switch}
              control={
                <Switch
                  disabled={protectedUser}
                  onChange={this.toggleLocked(this.props.userId)}
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
                  onChange={this.toggle2FA(this.props.userId)}
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
    const { classes } = this.props;
    const isGod = UserModule.can({ threshold: "god" });

    const layout = defaultRoles.map(value => {
      //let disabled = false;
      const disabled = (value === "god" || value === "super-admin") && !isGod; //{
      //disabled = true;
      //}
      return value !== "user" ? (
        <ListItem key={value} dense button className={classes.listItem}>
          <ListItemText primary={value} />
          <ListItemSecondaryAction>
            <Checkbox onChange={this.toggleRole(value)} disabled={disabled} checked={this.getRoleStatus(value)} />
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

    log.info(`user`, settings);

    return {
      user: user,
      settings: settings,
      ready: user && settings
    };
  })(withStyles(styles, { withTheme: true })(User))
);
