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
        caution: "Once 2FA is activated you'll need to enter an authorisation code in order to access your account."
      },
      disable: {
        message: "2 factor authentication is currently active.",
        btnText: "De-activate Now",
        alertLevel: "danger",
        caution:
          "In order to complete this action you'll need to enter an authorisation code or you'll be locked out of your account."
      }
    },
    verifyEmail: {
      message: "WARNING: Your email address is not verified.",
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
  panel: string;
  parentProps?: any;
  processingRequest?: boolean;
  authData?: any;
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
    let caution: string;

    let panelType = this.props.type;

    if (panelType === "auth") {
      if (!this.props.authData) {
        return null;
      }

      let stateChange: string;

      switch (this.props.authData.enabled) {
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
      caution = panelData[this.props.panel][panelType][stateChange].caution;
    } else {
      message = panelData[this.props.panel][panelType].message;
      alertLevel = panelData[this.props.panel][panelType].alertLevel;
      btnText = panelData[this.props.panel][panelType].btnText;
      caution = panelData[this.props.panel][panelType].caution;
    }

    layout = (
      <BlockUi tag="div" blocking={this.props.processingRequest}>
        <Alert color={alertLevel}>
          <strong>{message}</strong>
          <hr />{" "}
          <Button onClick={this.props.mainFunction} size="sm" color="primary">
            {btnText}
          </Button>{" "}
          {caution ? (
            <span>
              <strong>&nbsp;CAUTION: </strong>
              <em>{caution}</em>
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
    let caution: string;

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
