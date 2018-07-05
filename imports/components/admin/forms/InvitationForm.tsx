import * as React from "react";
import { connect } from "react-redux";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import * as BlockUi from "react-block-ui";
import * as Validation from "../../../modules/validation";
import Widget from "../../forms/Widget";
import * as UserModule from "../../../modules/user";
import { sendInvitation } from "../../../api/admin/methods";
import * as Library from "../../../modules/library";

const defaultRoles = ["creator", "editor", "moderator", "admin"];

interface IProps {
  classes: any;
  dispatch: any;
}

interface IState {
  inviteMessage: string;
  inviteEmail: string;
  inviteName: string;
  inviteRoles: any;
  block: boolean;
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
  },
  heading: {
    color: "#4d4d4d"
  }
});

class InvitationForm extends React.Component<IProps, IState> {
  formID: string = "invitationForm";
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      block: false,
      inviteMessage: "",
      inviteEmail: "",
      inviteName: "",
      inviteRoles: { creator: false, editor: false, admin: false, moderator: false }
    };
  }

  miniAlert = (message = "") => {
    this.props.dispatch({ type: "MINI_ALERT_ON", message: message });
  };

  componentDidMount() {
    Validation.validate(this);
  }

  handleSubmit() {
    this.confirmSendInvitation();
  }

  getWidget(props: any) {
    let widgetType = props.widgetType ? props.widgetType : "simple";
    return <Widget widgetType={widgetType} handleChange={this.handleChange} wProps={props} />;
  }

  handleChange = e => {
    let target = e.target;
    let value = target.value;
    let id = target.id;
    this.setState({ [id]: value });
    log.info(`admin changeInviteText`, id, value, this.state);
  };

  confirmSendInvitation() {
    Library.confirmDialog({ title: "Send Invitation Now ?", message: "off", icon: "off" }).then(result => {
      if (result) {
        this.sendInvitation();
      }
    });
  }

  sendInvitation = () => {
    log.info(`sendInvitation`, this.state);
    this.setState({ block: true });
    sendInvitation.call(
      {
        email: this.state.inviteEmail,
        message: this.state.inviteMessage,
        name: this.state.inviteName,
        roles: this.state.inviteRoles
      },
      err => {
        if (err) {
          Library.modalErrorAlert(err.reason);
          log.error(`sendInvitation failed`, err);
        } else {
          this.miniAlert(`Invitation was sent to ${this.state.inviteEmail}`);
        }
        this.setState({ block: false });
      }
    );
  };

  mapRoles() {
    const { classes } = this.props;
    const layout = defaultRoles.map(role => {
      return (
        <ListItem key={role} dense button className={classes.listItem}>
          <ListItemText primary={role} />
          <ListItemSecondaryAction>
            <Checkbox onChange={this.toggleInvitationRole(role)} checked={this.getInvitationRoleStatus(role)} />
          </ListItemSecondaryAction>
        </ListItem>
      );
    });

    return layout;
  }

  toggleInvitationRole = role => event => {
    const currentState = this.state.inviteRoles[role] === true;
    const newState = !currentState;
    let props = { ...this.state.inviteRoles };
    props[role] = newState;
    this.setState({ inviteRoles: props });
  };

  getInvitationRoleStatus(role) {
    return this.state.inviteRoles[role] === true;
  }

  render() {
    log.info(`Invitation Form State`, this.state);
    const { classes } = this.props;
    return (
      <div>
        <BlockUi tag="div" blocking={this.state.block}>
          <form id={this.formID} className={this.props.classes.adminSettingsForm}>
            {this.getWidget({ name: "inviteEmail", label: "Email", required: true, type: "email" })}
            {this.getWidget({ name: "inviteName", label: "Optional Name", required: false })}
            {this.getWidget({ name: "inviteMessage", label: "Optional Message", required: false })}

            <div className="form-group">
              <label htmlFor="boo">
                Optional Roles:
                <List id="boo">{this.mapRoles()}</List>
              </label>
            </div>

            <div className="form-group">
              <Button variant="raised" type="submit" color="primary">
                Send Invitation
              </Button>
            </div>
          </form>
        </BlockUi>
      </div>
    );
  }
}

export default connect()(withStyles(styles, { withTheme: true })(InvitationForm));
