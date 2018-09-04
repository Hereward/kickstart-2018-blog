import * as React from "react";
import { withStyles } from "@material-ui/core/styles";
//import Done from "@material-ui/icons/Done";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";

//import RaisedButton from "material-ui/RaisedButton";
import Button from "@material-ui/core/Button";
import * as BlockUi from "react-block-ui";
import * as Validation from "../../../modules/validation";
import Widget from "../../forms/Widget";
import { updateSettings } from "../../../api/admin/methods";
import * as Library from "../../../modules/library";
import RenderImage from "../components/RenderImage";

interface IProps {
  handleChange: any;
  handleSubmit: any;
  handleSetState: any;
  settingsObj: any;
  classes: any;
  updateDone: boolean;
  dispatch: any;
  imageUpdateMethod: string;
}

interface IState {
  [x: number]: any;
  imageId: string;
  title: string;
  shortTitle: string;
  copyright: string;
  summary: string;
  blockUI: boolean;
}

const styles = theme => ({
  adminSettingsForm: {
    marginTop: "1rem",
    marginBottom: "1rem"
  },

  done: {
    color: "red",
    marginLeft: "1rem",
    verticalAlign: "middle"
  }
});

class SettingsForm extends React.Component<IProps, IState> {
  formID: string = "SettingsForm";
  constructor(props) {
    super(props);

    const { settingsObj } = props;

    this.state = {
      title: settingsObj ? settingsObj.title : "",
      shortTitle: settingsObj ? settingsObj.shortTitle : "",
      copyright: settingsObj ? settingsObj.copyright : "",
      summary: settingsObj ? settingsObj.summary : "",
      imageId: settingsObj ? settingsObj.image_id : "",
      blockUI: false
    };
  }

  componentDidMount() {
    Validation.validate(this);
  }

  miniAlert = (message = "") => {
    this.props.dispatch({ type: "MINI_ALERT_ON", message: message });
  };

  handleChange = e => {
    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let id = target.id;
    this.setState({ [id]: value });
    log.info(`SettingsForm.handleChange()`, id, value, this.state);
  };

  handleSubmit = () => {
    log.info(`SettingsForm.handleSubmit()`, this.state);
    this.setState({ blockUI: true });
    const settings = {
      title: this.state.title,
      shortTitle: this.state.shortTitle,
      copyright: this.state.copyright,
      summary: this.state.summary,
      image_id: this.state.imageId
    };

    updateSettings.call(settings, err => {
      this.setState({ blockUI: false });

      if (err) {
        Library.modalErrorAlert(err.reason);
      } else {
        this.miniAlert("Update Succesful.");
      }
    });
  };

  getWidget(props: any) {
    let widgetType = props.widgetType ? props.widgetType : "simple";
    return (
      <Widget
        widgetType={widgetType}
        handleChange={this.handleChange}
        dataObj={this.props.settingsObj}
        wProps={props}
        uncontrolled={true}
      />
    );
  }

  updateImageId = (props: { imageId: string; newDataObject?: any }) => {
    log.info(`SettingsForm.updateImageId()`, props);
    this.setState({ imageId: props.imageId });
  };

  renderImage() {
    const { settingsObj } = this.props;
    return (
      <RenderImage
        allowEdit={false}
        updateMethod={this.props.imageUpdateMethod}
        updateImageId={this.updateImageId}
        dataObj={settingsObj}
        imageId={this.state.imageId}
      />
    );
  }

  render() {
    return (
      <div>
        <BlockUi tag="div" blocking={this.state.blockUI}>
          <form id={this.formID} className={this.props.classes.adminSettingsForm}>
            {this.renderImage()}
            {this.getWidget({ name: "title", label: "Main Title" })}
            {this.getWidget({ name: "shortTitle", label: "Short Title" })}
            {this.getWidget({ name: "copyright", label: "Copyright" })}
            {this.getWidget({ name: "summary", label: "Summary Description" })}

            <div className="form-group">
              <Button variant="raised" type="submit" color="primary">
                Save
              </Button>
            </div>
          </form>
        </BlockUi>
      </div>
    );
  }
}

export default connect()(
  withTracker(props => {
    return {};
  })(withStyles(styles, { withTheme: true })(SettingsForm))
);
