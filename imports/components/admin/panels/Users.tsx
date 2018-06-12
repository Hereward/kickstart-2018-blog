import * as React from "react";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import PowerIcon from "@material-ui/icons/SettingsPower";
import Typography from "@material-ui/core/Typography";
import { toggleSystemOnline, updateSettings } from "../../../api/admin/methods";
import * as Library from "../../../modules/library";
import SettingsForm from "../../admin/forms/SettingsForm";
import Snackbar from "../../partials/Snackbar";
import { systemSettings } from "../../../api/admin/publish";

const drawerWidth = 240;
let styles: any;

interface IProps {
  classes: any;
  theme: any;
  SystemOnline: boolean;
  systemSettings: any;
  dispatch: any;
  cursorLimit: number;
}

interface IState {
  allowSubmit: boolean;
  mainTitle: string;
  shortTitle: string;
  copyright: string;
  updateDone: boolean;
  snackbarIsOpen: boolean;
  queryLimit: number;
}

styles = theme => ({
  groupHeading: {
    fontSize: "1.2rem",
    fontWeight: "bold"
    //color: "rgba(0, 0, 0, 0.9)"
  },
  widgetItem: {
    maxWidth: "20rem",
    paddingLeft: 0
  },
  panelTitle: {
    fontSize: "1.5rem",
    color: "rgba(0, 0, 0, 0.9)"
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 250
  },
  heading: { color: "dimGray" }
});

class Users extends React.Component<IProps, IState> {
  cursorBlock: number = 1;
  currentLimitVal: number = 1;

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
      queryLimit: 1
    };
  }

  closeSnackbar() {
    this.setState({ snackbarIsOpen: false });
    //log.info(`closing snackbar`);
  }

  toggleOnline = () => event => {
    toggleSystemOnline.call({}, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`toggleSystemOnline failed`, err);
      }
    });
  };

  handleChange(e) {
    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let id = target.id;
    this.setState({ [id]: value, updateDone: false, snackbarIsOpen: false });
    log.info(`admin handleChange`, id, value, this.state);
  }

  handleSubmit() {
    log.info(`admin submit`, this.state);
    this.setState({ allowSubmit: false, updateDone: true });
    const settings = {
      mainTitle: this.state.mainTitle,
      shortTitle: this.state.shortTitle,
      copyright: this.state.copyright
    };

    updateSettings.call(settings, err => {
      this.setState({ allowSubmit: true, snackbarIsOpen: true });
      if (err) {
        Library.modalErrorAlert(err.reason);
      }
    });
  }

  loadMore() {
    this.props.dispatch({ type: "LOAD_MORE", cursorBlock: this.cursorBlock });
  }

  layout() {
    //log.info(`Settings`, this.props, this.state);
    return (
      <div>
        <h2 className={this.props.classes.heading}>User Settings</h2>

        <div>
          <Button variant="raised" onClick={this.loadMore} size="medium" color="primary">
            Load More
          </Button>{" "}
          CURRENT LIMIT: {this.props.cursorLimit}
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
    const options = {
      sort: { createdAt: -1 },  
      limit: props.cursorLimit
    };
    const users = Meteor.users.find({}, options).fetch();
    //log.info(`ADMIN PROPS`, props);
    log.info(`ADMIN USERS`, users);

    return {
      allUsers: users
    };
  })(withStyles(styles, { withTheme: true })(Users))
);
