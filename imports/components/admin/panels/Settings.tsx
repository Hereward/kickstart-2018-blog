import * as React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
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
import { toggleSystemOnline } from "../../../api/admin/methods";
import * as Library from "../../../modules/library";
import SettingsForm from "../../admin/forms/SettingsForm";

const drawerWidth = 240;
let styles: any;

interface IProps {
  classes: any;
  theme: any;
  SystemOnline: boolean;
  systemSettings: any;
  settings: any;
}

interface IState {
  allowSubmit: boolean;
  mainTitle: string;
  shortTitle: string;
  copyright: string;
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
    this.state = {
      allowSubmit: true,
      mainTitle: "",
      shortTitle: "",
      copyright: ""
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

  zhandleChange = name => event => {
    log.info(`admin handleChange`, name, event.target.value);
    /*
    this.setState({
      [name]: event.target.value,
    });
    */
  };

  handleChange(e) {
    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let id = target.id;
    this.setState({ [id]: value });
  }

  handleSubmit() {
    log.info(`admin submit`, this.state);
  }

  handleSetState() {}

  layout() {
    
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
          handleSetState={this.handleSetState}
          settingsObj={this.props.settings}
        />
      </div>
    );
  }

  render() {
    return this.layout();
  }
}

export default withStyles(styles, { withTheme: true })(Settings);
