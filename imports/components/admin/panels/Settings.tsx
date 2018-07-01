import * as React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import { toggleSystemOnline, updateSettings } from "../../../api/admin/methods";
import * as Library from "../../../modules/library";
import SettingsForm from "../../admin/forms/SettingsForm";

/*
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import PowerIcon from "@material-ui/icons/SettingsPower";
import Typography from "@material-ui/core/Typography";
*/

const drawerWidth = 240;
let styles: any;

interface IProps {
  classes: any;
  theme: any;
  SystemOnline: boolean;
  systemSettings: any;
  dispatch: any;
}

interface IState {
  [x: number]: any;
  allowSubmit: boolean;
  mainTitle: string;
  shortTitle: string;
  copyright: string;
  description: string;
  updateDone: boolean;
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

class Settings extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      allowSubmit: true,
      mainTitle: this.props.systemSettings.mainTitle,
      shortTitle: this.props.systemSettings.shortTitle,
      copyright: this.props.systemSettings.copyright,
      description: this.props.systemSettings.description,
      updateDone: false
    };
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
    this.setState({ [id]: value, updateDone: false });
    log.info(`admin handleChange`, id, value, this.state);
  }

  handleSubmit() {
    log.info(`admin submit`, this.state);
    this.setState({ allowSubmit: false, updateDone: true });
    const settings = {
      mainTitle: this.state.mainTitle,
      shortTitle: this.state.shortTitle,
      copyright: this.state.copyright,
      description: this.state.description
    };

    updateSettings.call(settings, err => {
      this.setState({ allowSubmit: true });
      
      if (err) {
        Library.modalErrorAlert(err.reason);
      } else {
        this.miniAlert("Update Succesful.");
      }
    });
  }

  miniAlert = (message = "") => {
    this.props.dispatch({ type: "MINI_ALERT_ON", message: message });
  };

  layout() {
    //log.info(`Settings`, this.props, this.state);
    return (
      <div>
        <h2 className={this.props.classes.heading}>General Settings</h2>

        <div className="form-group">
          <div>
            System Online: <Switch onChange={this.toggleOnline()} checked={this.props.systemSettings.systemOnline} />
          </div>
        </div>

        <SettingsForm
          allowSubmit={this.state.allowSubmit}
          handleChange={this.handleChange}
          handleSubmit={this.handleSubmit}
          settingsObj={this.props.systemSettings}
          updateDone={this.state.updateDone}
        />
      </div>
    );
  }

  render() {
    return this.layout();
  }
}

export default connect()(withStyles(styles, { withTheme: true })(Settings));
