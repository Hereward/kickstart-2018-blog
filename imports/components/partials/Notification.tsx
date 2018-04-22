import { Meteor } from "meteor/meteor";
import * as React from "react";
import { Alert, Button } from "reactstrap";
import * as BlockUi from "react-block-ui";

const panelData = {
  auth: {
    enable: {
      message: "WARNING: 2FA is disabled. Activate 2 factor authentication on your account for enhanced security.",
      btnText: "Activate Now",
      alertLevel: "danger"
    },
    disable: {
      message: "2 factor authentication is active. You can de-activate it, but will need to enter an authorisation code first.",
      btnText: "De-activate Now",
      alertLevel: "info"
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
};

interface IProps {
  mainFunction: any;
  panel: string;
  parentProps: any;
  processingRequest: boolean;
  authData: any;
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
      case "standard":
        layout = this.standardPanel();
        break;
    }

    return layout;
  }

  standardPanel() {
    let layout: any;
    let message: string;
    let alertLevel: string;
    let btnText: string;

    let panelType = this.props.type;

    if (panelType === "auth") {
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

      message = panelData[panelType][stateChange].message;
      alertLevel = panelData[panelType][stateChange].alertLevel;
      btnText = panelData[panelType][stateChange].btnText;
    } else {
      message = panelData[panelType].message;
      alertLevel = panelData[panelType].alertLevel;
      btnText = panelData[panelType].btnText;
    }

    layout = (
      <BlockUi tag="div" blocking={this.props.processingRequest}>
        <Alert color={alertLevel}>
          <strong>{message}</strong>
          <hr />{" "}
          <Button onClick={this.props.mainFunction} size="sm" color="primary">
            {btnText}
          </Button>{" "}
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
