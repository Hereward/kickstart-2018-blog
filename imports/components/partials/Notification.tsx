import { Meteor } from "meteor/meteor";
import * as React from "react";
import { Alert, Button } from "reactstrap";
import * as BlockUi from "react-block-ui";

const panelData = {
  action: {
    auth: {
      enable: {
        message: "WARNING: 2FA is disabled. Activate 2 factor authentication on your account for enhanced security.",
        btnText: "Activate Now",
        alertLevel: "danger",
        addendum: "Once 2FA is activated you'll need to enter an authorisation code in order to access your account."
      },
      disable: {
        message: "2 factor authentication is currently active.",
        btnText: "De-activate Now",
        alertLevel: "danger",
        addendum:
          "In order to complete this action you'll need to enter an authorisation code or you'll be locked out of your account."
      }
    },
    verifyEmail: {
      message: "WARNING: Your email address is not verified.",
      addendum:
          "You will receive an email with further instructions.",
      btnText: "Verify Now",
      alertLevel: "warning"
    },
    admin: {
      message: "DELETE ALL NON-ADMIN USERS.",
      btnText: "DELETE NOW",
      alertLevel: "warning"
    }
  },
  info: {
    authDisabled: {
      message: "2 factor authentication is off. You can turn it on once you have verified your email address.",
      alertLevel: "info"
    }
  }
};

interface IProps {
  mainFunction?: any;
  userSettings?: any;
  panel: string;
  parentProps?: any;
  processingRequest?: boolean;
  userSession?: any;
  type: string;
}

interface IState {}

export default class Notification extends React.Component<IProps, IState> {
  state: any;

  constructor(props) {
    super(props);
  }

  componentDidUpdate() {}

  componentDidMount() {}

  componentWillReceiveProps(nextProps) {}

  execute() {
    let layout: any = null;
    switch (this.props.panel) {
      case "action":
        layout = this.actionPanel();
        break;
      case "info":
        layout = this.infoPanel();
        break;
    }

    return layout;
  }

  actionPanel() {
    let layout: any;
    let message: string;
    let alertLevel: string;
    let btnText: string;
    let addendum: string;

    let panelType = this.props.type;

    if (panelType === "auth") {
      if (!this.props.userSettings) {
        return null;
      }

      let stateChange: string;

      switch (this.props.userSettings.authEnabled) {
        case 0:
          stateChange = "enable";
          break;
        case 1:
          stateChange = "disable";
          break;
        case 2:
          stateChange = "disable";
          break;
        case 3:
          stateChange = "enable";
          break;
      }

      message = panelData[this.props.panel][panelType][stateChange].message;
      alertLevel = panelData[this.props.panel][panelType][stateChange].alertLevel;
      btnText = panelData[this.props.panel][panelType][stateChange].btnText;
      addendum = panelData[this.props.panel][panelType][stateChange].addendum;
    } else {
      message = panelData[this.props.panel][panelType].message;
      alertLevel = panelData[this.props.panel][panelType].alertLevel;
      btnText = panelData[this.props.panel][panelType].btnText;
      addendum = panelData[this.props.panel][panelType].addendum;
    }

    layout = (
      <BlockUi tag="div" blocking={this.props.processingRequest}>
        <Alert color={alertLevel}>
          <strong>{message}</strong>
          <hr />{" "}
          <Button onClick={this.props.mainFunction} size="sm" color="primary">
            {btnText}
          </Button>{" "}
          {addendum ? (
            <span>
              <strong>&nbsp;NOTE: </strong>
              <em>{addendum}</em>
            </span>
          ) : (
            ""
          )}
        </Alert>
      </BlockUi>
    );

    return layout;
  }

  infoPanel() {
    let layout: any;
    let message: string;
    let alertLevel: string;
    let btnText: string;
    let addendum: string;

    let panelType = this.props.type;
    log.info(`infoPanel - panelType`, panelType);

    message = panelData[this.props.panel][panelType].message;
    alertLevel = panelData[this.props.panel][panelType].alertLevel;

    layout = (
      <BlockUi tag="div" blocking={this.props.processingRequest}>
        <Alert color={alertLevel}>
          <strong>{message}</strong>
        </Alert>
      </BlockUi>
    );

    return layout;
  }

  render() {
    let layout = this.execute();
    return layout;
  }
}
