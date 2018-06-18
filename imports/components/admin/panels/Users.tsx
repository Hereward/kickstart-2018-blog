import * as React from "react";
import { Meteor } from "meteor/meteor";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import DropUpIcon from "@material-ui/icons/ArrowDropUp";
import DropDownIcon from "@material-ui/icons/ArrowDropDown";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import DeleteIcon from '@material-ui/icons/Delete';

import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { Alert } from "reactstrap";
import * as BlockUi from "react-block-ui";
import { toggleLocked, deleteAllUsers } from "../../../api/admin/methods";
import * as Library from "../../../modules/library";
import SettingsForm from "../../admin/forms/SettingsForm";
import Snackbar from "../../partials/Snackbar";
import { userSettings } from "../../../api/settings/publish";
import * as UserModule from "../../../modules/user";
import User from "./User";
import OptionGroup from "../components/OptionGroup";

/*
import TextField from "@material-ui/core/TextField";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import PowerIcon from "@material-ui/icons/SettingsPower";
*/

//import { systemSettings } from "../../../api/admin/publish";

const drawerWidth = 240;
let styles: any;

interface IProps {
  classes: any;
  theme: any;
  SystemOnline: boolean;
  systemSettings: any;
  dispatch: any;
  cursorLimit: number;
  allUsers: any;
  userData: any;
}

interface IState {
  [x: number]: any;
  allowSubmit: boolean;
  mainTitle: string;
  shortTitle: string;
  copyright: string;
  updateDone: boolean;
  snackbarIsOpen: boolean;
  queryLimit: number;
  expanded: string;
  block: boolean;
  showGodOptions: boolean;
}

styles = theme => ({
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 250
  },
  heading: { color: "dimGray" },
  loadMore: {
    marginTop: "1rem",
    textAlign: "center"
  },
  userDetails: {
    backgroundColor: "LightYellow",
    borderTop: "1px solid LightGray",
    paddingTop: "1rem"
  },
  summaryData: {
    color: "dimGray"
  },
  summaryDataEmail: {},
  summaryDataID: {
    fontWeight: "bold"
  },
  deleteAllRoot: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper
  }
});

class Users extends React.Component<IProps, IState> {
  cursorBlock: number = 1;
  currentLimitVal: number = 1;
  snackbarMessage: string = "Operation completed normally.";
  //state: any;

  constructor(props) {
    super(props);
    this.handleExPanelChange = this.handleExPanelChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.closeSnackbar = this.closeSnackbar.bind(this);
    this.deleteAll = this.deleteAll.bind(this);
    this.confirmDeleteAll = this.confirmDeleteAll.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.toggleGodOptions = this.toggleGodOptions.bind(this);

    this.state = {
      allowSubmit: true,
      mainTitle: this.props.systemSettings.mainTitle,
      shortTitle: this.props.systemSettings.shortTitle,
      copyright: this.props.systemSettings.copyright,
      updateDone: false,
      snackbarIsOpen: false,
      queryLimit: 1,
      expanded: "",
      block: false,
      showGodOptions: false
    };
  }

  UNSAFE_componentWillMount() {
    this.props.dispatch({ type: "LOAD_INIT" });
  }

  closeSnackbar() {
    this.setState({ snackbarIsOpen: false });
    //log.info(`closing snackbar`);
  }

  toggleLocked = userId => event => {
    toggleLocked.call({ id: userId }, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`toggleLocked failed`, err);
      }
    });
  };

  handleExPanelChange = panel => (event, expanded) => {
    this.setState({
      expanded: expanded ? panel : false
    });
  };

  handleSubmit() {}

  loadMore() {
    this.props.dispatch({ type: "LOAD_MORE" }); // cursorBlock: this.cursorBlock
  }

  userDetail(id) {
    return this.state.expanded === id ? <User userId={id} /> : <div>boojam</div>;
  }

  confirmDeleteAll() {
    Library.confirmDialog().then(result => {
      if (result) {
        this.deleteAll();
      }
    });
  }

  deleteAll() {
    log.info(`deleteAll`);
    this.setState({ block: true });
    deleteAllUsers.call({}, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`deleteAllUsers failed`, err);
      } else {
        this.snackbarMessage = "All users were deleted!";
        this.setState({ block: false, snackbarIsOpen: true });
      }
    });
  }

  toggleGodOptions() {
    const vis = !this.state.showGodOptions;
    this.setState({ showGodOptions: vis });
  }

  godOptionsDetail() {
    const { classes } = this.props;
    const layout = (
      <div className={classes.deleteAllRoot}>
        <List component="nav">
          <ListItem onClick={this.confirmDeleteAll} button>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
            <ListItemText primary="Delete ALL users" />
          </ListItem>
        </List>
      </div>
    );

    return layout;
  }

  godOptions() {
    const layout = (
      <OptionGroup show={this.state.showGodOptions} label="Bulk Operations" action={this.toggleGodOptions}>
        {this.godOptionsDetail()}
      </OptionGroup>
    );

    return layout;
  }

  renderUser(userObj: any) {
    const { classes } = this.props;
    const { expanded } = this.state;
    return (
      <ExpansionPanel expanded={expanded === userObj._id} onChange={this.handleExPanelChange(userObj._id)}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <div className={classes.summaryData}>
            <span className={classes.summaryDataID}>{userObj._id}:</span>{" "}
            <span className={classes.summaryDataEmail}>{userObj.emails[0].address}</span>{" "}
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.userDetails}>
          <div>{this.userDetail(userObj._id)}</div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }

  users(usersArray: any) {
    const { classes } = this.props;
    const { expanded } = this.state;

    const userList = usersArray.map(user => <div key={user._id}>{this.renderUser(user)}</div>);
    return <div>{userList}</div>;
  }

  layout() {
    const { classes } = this.props;
    //log.info(`Settings`, this.props, this.state);
    return (
      <BlockUi tag="div" blocking={this.state.block}>
        <h2 className={classes.heading}>User Settings</h2>
        {UserModule.can({ threshold: "god" }) ? this.godOptions() : ""}

        <div>
          {this.props.allUsers ? this.users(this.props.allUsers) : ""}
          <div className={classes.loadMore}>
            <Button variant="raised" onClick={this.loadMore} size="small" color="secondary">
              Load More
            </Button>
          </div>
        </div>
        <Snackbar message={this.snackbarMessage} close={this.closeSnackbar} isOpen={this.state.snackbarIsOpen} />
      </BlockUi>
    );
  }

  render() {
    //log.info(`USERS PANEL PROPS`, this.props);
    return this.layout();
  }
}

//const bundle = withStyles(styles, { withTheme: true });

//export default withStyles(styles, { withTheme: true })(Users);

const mapStateToProps = state => {
  return { cursorLimit: state.cursorLimit };
};

export default connect(mapStateToProps)(
  withTracker(props => {
    const usersHandle = Meteor.subscribe("allUsers");
    const settingsHandle = Meteor.subscribe("allSettings");
    const options = {
      sort: { createdAt: -1 },
      limit: props.cursorLimit
    };
    const users = Meteor.users.find({}, options).fetch();

    //log.info(`ADMIN PROPS`, props);
    //log.info(`ADMIN USERS`, users);

    return {
      allUsers: users
    };
  })(withStyles(styles, { withTheme: true })(Users))
);
