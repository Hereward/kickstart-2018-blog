import * as React from "react";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
//import IconButton from "@material-ui/core/IconButton";
//import DropUpIcon from "@material-ui/icons/ArrowDropUp";
//import DropDownIcon from "@material-ui/icons/ArrowDropDown";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from "@material-ui/core/TextField";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import DeleteIcon from "@material-ui/icons/Delete";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import * as BlockUi from "react-block-ui";
import { toggleLocked, deleteAllUsers, deleteUserList, sendInvitation } from "../../../api/admin/methods";
import * as Library from "../../../modules/library";
import Snackbar from "../../partials/Snackbar";
import * as UserModule from "../../../modules/user";
import User from "./User";
import OptionGroup from "../components/OptionGroup";
import InvitationForm from "../../admin/forms/InvitationForm";
import { Profiles } from "../../../api/profiles/publish";

const defaultRoles = Meteor.settings.public.admin.roles;

//const drawerWidth = 240;
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
  userId: string;
  totalUsers: number;
}

interface IState {
  [x: number]: any;
  allowSubmit: boolean;
  mainTitle: string;
  shortTitle: string;
  copyright: string;
  updateDone: boolean;
  queryLimit: number;
  expanded: string;
  block: boolean;
  showBulkOptions: boolean;
  showFilterOptions: boolean;
  showInviteOptions: boolean;
  selectedUsers: any;
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
    backgroundColor: "#fdf9f4",
    borderTop: "1px solid LightGray",
    paddingTop: "1rem",
    display: "block"
  },
  summaryData: {
    color: "dimGray"
  },
  summaryDataEmail: {
    maxWidth: "10rem",
    overflow: "hidden",
    display: "inline-block",
    textOverflow: "ellipsis",
    [theme.breakpoints.up("sm")]: {
      maxWidth: "15rem",
      verticalAlign: "top",
      marginLeft: "0.5rem"
    },
    [theme.breakpoints.up("md")]: {
      maxWidth: "20rem"
    }
  },
  summaryDataID: {
    display: "none",
    fontWeight: "bold",
    [theme.breakpoints.up("sm")]: {
      display: "inline"
    }
  },
  deleteAllRoot: {
    width: "100%"
  },
  optionsRoot: {
    margin: "1rem"
  },
  userListItem: {
    display: "flex"
  },
  userListExpRoot: {
    width: "100%"
  },
  expandedExpansionPanel: {
    margin: 0
  },
  messageField: {
    marginBottom: "1rem"
  },
  checkBoxLarge: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "inline-flex"
    }
  },
  checkBoxSmall: {
    display: "inline-flex",
    [theme.breakpoints.down("md")]: {
      display: "none"
    }
  },
  checkBoxSmallContainer: {
    display: "block",
    [theme.breakpoints.up("md")]: {
      display: "none"
    }
  }
});

class Users extends React.Component<IProps, IState> {
  cursorBlock: number = 1;
  currentLimitVal: number = 1;
  selectedUsers = [];
  isGod: boolean = false;

  constructor(props) {
    super(props);
    this.handleExPanelChange = this.handleExPanelChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.deleteAll = this.deleteAll.bind(this);
    this.confirmDeleteAll = this.confirmDeleteAll.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.toggleBulkOptions = this.toggleBulkOptions.bind(this);
    this.toggleFilterOptions = this.toggleFilterOptions.bind(this);
    this.changeFilter = this.changeFilter.bind(this);
    this.isGod = UserModule.can({ threshold: "god" });

    this.state = {
      allowSubmit: true,
      mainTitle: this.props.systemSettings.mainTitle,
      shortTitle: this.props.systemSettings.shortTitle,
      copyright: this.props.systemSettings.copyright,
      updateDone: false,
      queryLimit: 1,
      expanded: "",
      block: false,
      showBulkOptions: false,
      showFilterOptions: false,
      showInviteOptions: false,
      selectedUsers: {}
    };
  }

  UNSAFE_componentWillMount() {
    this.props.dispatch({ type: "LOAD_INIT" });
    this.props.dispatch({ type: "FILTER_INIT" });
  }

  miniAlert = (message = "") => {
    this.props.dispatch({ type: "MINI_ALERT_ON", message: message });
  };

  toggleLocked = userId => event => {
    toggleLocked.call({ id: userId }, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        log.error(`toggleLocked failed`, err);
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

  toggleUserSelect = id => event => {
    const currentState = Object.assign({}, this.state.selectedUsers);
    //const currentState = this.state.selectedUsers;
    const selected = currentState[id] === true;
    currentState[id] = !selected;
    this.setState({ selectedUsers: currentState });

    this.selectedUsers = Object.keys(currentState).reduce((filtered, option) => {
      if (currentState[option]) {
        filtered.push(option);
      }
      return filtered;
    }, []);

    return "";
  };

  allowUser(targetId) {
    if (this.isGod) {
      return true;
    }
    const selfEdit = targetId === this.props.userId;
    const protectedUser = Roles.userIsInRole(targetId, ["god", "super-admin"]);
    const allowed = selfEdit || !protectedUser;
    return allowed;
  }

  userDetail(userObj) {
    const id = userObj._id;
    const allowed = this.allowUser(id);
    const email = userObj.emails[0].address;
    return this.state.expanded === id && allowed ? (
      <User loggedInUserId={this.props.userId} targetUserId={id} />
    ) : (
      <div>
        <strong>Protected User:</strong>
        <br />
        {id}
        <br />
        {email}
      </div>
    );
  }

  confirmDeleteAll() {
    Library.confirmDialog().then(result => {
      if (result) {
        this.deleteAll();
      }
    });
  }

  confirmDeleteSelected = () => {
    Library.confirmDialog().then(result => {
      if (result) {
        this.deleteSelected();
      }
    });
  };

  deleteSelected() {
    this.setState({ block: true });
    deleteUserList.call({ selected: this.state.selectedUsers }, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        log.error(`deleteUserList failed`, err);
      } else {
        this.miniAlert("Selected users were deleted!");
        this.setState({ block: false });
      }
    });
  }

  deleteAll() {
    log.info(`deleteAll`);
    this.setState({ block: true });
    deleteAllUsers.call({}, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        log.error(`deleteAllUsers failed`, err);
      } else {
        this.miniAlert("All users were deleted!");
        this.setState({ block: false });
      }
    });
  }

  toggleBulkOptions() {
    const vis = !this.state.showBulkOptions;
    this.setState({ showBulkOptions: vis });
  }

  toggleInviteOptions = () => {
    const vis = !this.state.showInviteOptions;
    this.setState({ showInviteOptions: vis });
  };

  toggleFilterOptions() {
    const vis = !this.state.showFilterOptions;
    this.setState({ showFilterOptions: vis });
    this.props.dispatch({ type: "FILTER_INIT" });
    this.props.dispatch({ type: "LOAD_INIT" });
  }

  bulkOptionsDetail() {
    const { classes } = this.props;
    const layout = (
      <div className={classes.deleteAllRoot}>
        <List component="nav">
          {this.isGod ? (
            <ListItem onClick={this.confirmDeleteAll} button>
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              <ListItemText primary="Delete ALL users" />
            </ListItem>
          ) : (
            ""
          )}
          <ListItem onClick={this.confirmDeleteSelected} button>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText primary="Delete SELECTED" />
          </ListItem>
        </List>
      </div>
    );

    return layout;
  }

  bulkOptions() {
    const layout = (
      <OptionGroup show={this.state.showBulkOptions} label="Bulk Operations" action={this.toggleBulkOptions}>
        {this.bulkOptionsDetail()}
      </OptionGroup>
    );

    return layout;
  }

  changeFilter = name => event => {
    let filters: any = {};
    filters[name] = event.target.value;
    this.props.dispatch({ type: "FILTER_USERS", filters: filters });
  };

  filterOptionsDetail() {
    const { classes } = this.props;
    const layout = (
      <div className={classes.optionsRoot}>
        <TextField
          id="userId"
          InputLabelProps={{
            shrink: true
          }}
          placeholder="User ID"
          fullWidth
          margin="normal"
          onChange={this.changeFilter("userId")}
        />
        <TextField
          id="email"
          InputLabelProps={{
            shrink: true
          }}
          placeholder="Email"
          fullWidth
          margin="normal"
          onChange={this.changeFilter("email")}
        />
        <TextField
          id="screenName"
          InputLabelProps={{
            shrink: true
          }}
          placeholder="Screen Name"
          fullWidth
          margin="normal"
          onChange={this.changeFilter("screenName")}
        />
      </div>
    );

    return layout;
  }

  inviteOptionsDetail() {
    const { classes } = this.props;
    const layout = (
      <div className={classes.optionsRoot}>
        <InvitationForm />
      </div>
    );

    return layout;
  }

  inviteOptions() {
    const layout = (
      <OptionGroup show={this.state.showInviteOptions} label="Send Invitation" action={this.toggleInviteOptions}>
        {this.inviteOptionsDetail()}
      </OptionGroup>
    );

    return layout;
  }

  filterOptions() {
    const layout = (
      <OptionGroup show={this.state.showFilterOptions} label="Filters" action={this.toggleFilterOptions}>
        {this.filterOptionsDetail()}
      </OptionGroup>
    );

    return layout;
  }

  renderUser(userObj: any) {
    const { classes } = this.props;
    const { expanded } = this.state;

    const disabledC = this.disableCheckBox(userObj);
    const checkedC = this.checkCheckBox(userObj);

    const checkBox = this.checkBox("default", disabledC, userObj, checkedC);

    return (
      <ExpansionPanel
        classes={{
          expanded: classes.expandedExpansionPanel
        }}
        className={classes.userListExpRoot}
        expanded={expanded === userObj._id}
        onChange={this.handleExPanelChange(userObj._id)}
      >
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <div className={classes.summaryData}>
            <span className={classes.summaryDataID}>{userObj._id}</span>{" "}
            <span className={classes.summaryDataEmail}>{userObj.emails[0].address}</span>
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.userDetails}>
          <div>
            {this.allowUser(userObj._id) ? (
              <div className={classes.checkBoxSmallContainer}>
                <FormControlLabel control={checkBox} label="selected" />
              </div>
            ) : (
              ""
            )}
            {this.userDetail(userObj)}
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }

  checkBox(type, disabled, user, checked) {
    const { classes } = this.props;
    let cssClass: string;

    switch (type) {
      case "small":
        cssClass = classes.checkBoxSmall;
        break;
      case "large":
        cssClass = classes.checkBoxLarge;
        break;
      case "default":
        cssClass = "";
        break;
      default:
        cssClass = "";
    }

    return (
      <Checkbox className={cssClass} disabled={disabled} onChange={this.toggleUserSelect(user._id)} checked={checked} />
    );
  }

  disableCheckBox(user) {
    const disabled =
      user._id === this.props.userId || (Roles.userIsInRole(user._id, ["god", "super-admin"]) && !this.isGod);
    return disabled;
  }

  checkCheckBox(user) {
    const checked = this.state.selectedUsers[user._id] === true;
    return checked;
  }

  mapUsers(usersArray) {
    const { classes } = this.props;
    //const isGod = UserModule.can({ threshold: "god" });

    const mapped = usersArray.map(user => {
      const disabledC = this.disableCheckBox(user);
      const checkedC = this.checkCheckBox(user);
      const layout = (
        <div className={classes.userListItem} key={user._id}>
          {this.checkBox("large", disabledC, user, checkedC)}
          {this.renderUser(user)}
        </div>
      );
      return layout;
    });

    return mapped;
  }

  users(usersArray: any) {
    const userList = this.mapUsers(usersArray);
    return <div>{userList}</div>;
  }

  loadMoreButton() {
    const { classes } = this.props;
    return (
      <div className={classes.loadMore}>
        <Button variant="outlined" onClick={this.loadMore} size="small">
          Load More
        </Button>
      </div>
    );
  }

  layout() {
    const { classes, totalUsers, cursorLimit, allUsers } = this.props;
    //log.info(`Users.layout()`, allUsers, totalUsers, cursorLimit);
    return (
      <BlockUi tag="div" blocking={this.state.block}>
        {this.inviteOptions()}

        {this.bulkOptions()}
        {this.filterOptions()}

        <div>
          <h2 className={classes.heading}>Users</h2>
          {allUsers ? this.users(this.props.allUsers) : ""}
          {allUsers.length && totalUsers > cursorLimit ? this.loadMoreButton() : ""}
        </div>
      </BlockUi>
    );
  }

  render() {
    return this.layout();
  }
}

const mapStateToProps = state => {
  return {
    cursorLimit: state.cursorLimit,
    filters: state.filters
  };
};

export default connect(mapStateToProps)(
  withTracker(props => {
    const usersHandle = Meteor.subscribe("allUsers");
    const settingsHandle = Meteor.subscribe("allSettings");
    const rolesHandle = Meteor.subscribe("roles");
    const totalUsers = Meteor.users.find().count();
    const options = {
      sort: { created: -1 },
      limit: props.cursorLimit
    };
    let filters = props.filters;
    const idString = props.filters.userId;
    const emailString = props.filters.email;
    const screenNameString = props.filters.screenName;
    let idFilter: any;
    let emailFilter: any;
    let screenNameFilter: any;
    let combinedFilters = [];
    let filterCount: number = 0;
    let users: any = [];
    let filter: boolean = false;

    if (idString) {
      filterCount += 1;
      const regex = new RegExp(`^${idString}.*`, "i");
      idFilter = { _id: regex };
      combinedFilters.push(idFilter);
    }

    if (emailString) {
      filterCount += 1;
      let regex = new RegExp(`^${emailString}.*`, "i");
      emailFilter = { "emails.0.address": regex };
      combinedFilters.push(emailFilter);
    }

    if (screenNameString) {
      let regex = new RegExp(`^${screenNameString}.*`, "i");
      const profile = Profiles.findOne({ screenName: regex });
      //log.info(`Users.tracker() filter screenNameString`, screenNameString, profile);
      if (profile) {
        filterCount += 1;
        screenNameFilter = { _id: profile.owner };
        combinedFilters.push(screenNameFilter);
      }
    }

    if (filterCount > 0 || screenNameString) {
      filter = true;
    }

    if (filter) {
      //log.info(`Users.tracker() combinedFilters`, combinedFilters);
      if (combinedFilters.length) {
        users = Meteor.users.find({ $or: combinedFilters }, options).fetch();
      }
    } else {
      users = Meteor.users.find({}, options).fetch();
    }

    return {
      allUsers: users,
      totalUsers: totalUsers
    };
  })(withStyles(styles, { withTheme: true })(Users))
);
