import * as React from "react";
import { withStyles } from "@material-ui/core/styles";
import Done from "@material-ui/icons/Done";
//import RaisedButton from "material-ui/RaisedButton";
import Button from "@material-ui/core/Button";
import * as BlockUi from "react-block-ui";
import * as Validation from "../../../modules/validation";
import Widget from "../../forms/Widget";

interface IProps {
  handleChange: any;
  handleSubmit: any;
  handleSetState: any;
  allowSubmit: boolean;
  settingsObj: any;
  classes: any;
  updateDone: boolean;
}

interface IState {}

const styles = theme => ({
  adminSettingsForm: {
    marginTop: '1rem',
    marginBottom: '1rem',
  },

  done: {
    color: "red",
    marginLeft: '1rem',
    verticalAlign: 'middle'
    //position: 'relative'
  },
});



class SettingsForm extends React.Component<IProps, IState> {
  formID: string = "SettingsForm";
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);

  }

  componentDidMount() {
    Validation.validate(this);
  }

  /*
  handleSetStateUpstream(sVar, sVal) {
    this.props.handleSetState(sVar, sVal);
  }

*/
  handleSubmit() {
    this.props.handleSubmit();
  }

  handleChange(e) {
    this.props.handleChange(e);
  }

  getWidget(props: any) {
    let widgetType = props.widgetType ? props.widgetType : "simple";
    return (
      <Widget
        widgetType={widgetType}
        handleChange={this.handleChange}
        dataObj={this.props.settingsObj}
        wProps={props}
      />
    );
  }

  render() {
    return (
      <div>
        <BlockUi tag="div" blocking={!this.props.allowSubmit}>
          <form id={this.formID} className={this.props.classes.adminSettingsForm}>
            {this.getWidget({ name: "mainTitle", label: "Main Title" })}
            {this.getWidget({ name: "shortTitle", label: "Short Title" })}
            {this.getWidget({ name: "copyright", label: "Copyright" })}

            <div className="form-group">
              <Button disabled={!this.props.allowSubmit} variant="raised" type="submit" color="primary">
                Save
              </Button>
              {this.props.updateDone ? <Done className={this.props.classes.done} /> : ''}
            </div>
          </form>
        </BlockUi>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(SettingsForm);
