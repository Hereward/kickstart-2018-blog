import * as React from "react";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";
import { toggleSystemOnline } from "../../../api/admin/methods";
import * as Library from "../../../modules/library";
import SettingsForm from "../../admin/forms/SettingsForm";
//import RenderImage from "../components/RenderImage";
import Spinner from "../../partials/Spinner";

//const drawerWidth = 240;
let styles: any;

interface IProps {
  classes: any;
  theme: any;
  SystemOnline: boolean;
  systemSettings: any;
  dispatch: any;
  imageUpdateMethod: string;
}

interface IState {}

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
      title: this.props.systemSettings.title,
      shortTitle: this.props.systemSettings.shortTitle,
      copyright: this.props.systemSettings.copyright,
      summary: this.props.systemSettings.summary,
      image_id: this.props.systemSettings.image_id
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

  updateImageId = (props: { image_id: string; dataObj?: any }) => {
    this.setState({ image_id: props.image_id });
  };

  layout() {
    const { systemSettings, imageUpdateMethod } = this.props;
    return (
      <div>
        <h2 className={this.props.classes.heading}>General Settings</h2>

        <div className="form-group">
          <div>
            System Online: <Switch onChange={this.toggleOnline()} checked={this.props.systemSettings.systemOnline} />
          </div>
        </div>

        <SettingsForm imageUpdateMethod={imageUpdateMethod} settingsObj={systemSettings} />
      </div>
    );
  }

  render() {
    const { systemSettings, imageUpdateMethod } = this.props;
    return systemSettings ? this.layout() : <Spinner />;
  }
}

//export default connect()(withStyles(styles, { withTheme: true })(Settings));

export default connect()(
  withTracker(props => {
    const imagesHandle = Meteor.subscribe("editorialImages");
    return {};
  })(withStyles(styles, { withTheme: true })(Settings))
);
