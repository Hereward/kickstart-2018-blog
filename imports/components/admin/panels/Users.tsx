import * as React from "react";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import { toggleLocked } from "../../../api/admin/methods";
import * as Library from "../../../modules/library";
import SettingsForm from "../../admin/forms/SettingsForm";
import Snackbar from "../../partials/Snackbar";
import { userSettings } from "../../../api/settings/publish";
import User from "./User";

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
  }
});

class Users extends React.Component<IProps, IState> {
  cursorBlock: number = 1;
  currentLimitVal: number = 1;
  //state: any;

  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.closeSnackbar = this.closeSnackbar.bind(this);
    this.loadMore = this.loadMore.bind(this);

    this.state = {
      allowSubmit: true,
      mainTitle: this.props.systemSettings.mainTitle,
      shortTitle: this.props.systemSettings.shortTitle,
      copyright: this.props.systemSettings.copyright,
      updateDone: false,
      snackbarIsOpen: false,
      queryLimit: 1,
      expanded: ""
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

  handleChange = panel => (event, expanded) => {
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

  renderUser(userObj: any) {
    const { classes } = this.props;
    const { expanded } = this.state;
    return (
      <ExpansionPanel expanded={expanded === userObj._id} onChange={this.handleChange(userObj._id)}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <Typography className={classes.heading}>
            {userObj._id} | {userObj.emails[0].address}{" "}
          </Typography>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
          <div className={classes.userDetails}>
            {this.userDetail(userObj._id)}
          </div>
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
      <div>
        <h2 className={classes.heading}>User Settings</h2>

        <div>
          {this.props.allUsers ? this.users(this.props.allUsers) : ""}
          <div className={classes.loadMore}>
            <Button variant="raised" onClick={this.loadMore} size="small" color="primary">
              Load More
            </Button>
          </div>
        </div>
        <Snackbar message="Update Succesful." close={this.closeSnackbar} isOpen={this.state.snackbarIsOpen} />
      </div>
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
