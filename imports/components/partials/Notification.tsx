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
      message: "2FA is enabled. De-activate 2 factor authentication.",
      btnText: "De-activate Now",
      alertLevel: "info"
    }
  }
};

interface IProps {
  mainFunction: any;
  panel: string;
  parentProps: any;
  processingRequest: boolean;
  authData: any;
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

  standardPanel() {
    return <div>boo</div>;
  }

  execute() {
    let layout: any = null;
    switch (this.props.panel) {
      case "standard":
        layout = this.standardPanel();
        break;
      case "auth":
        if (this.props.authData) {
          layout = this.render2FAPanel();
        }
        break;
    }

    return layout;
  }

  render2FAPanel() {
    let layout: any;

    let panelType = this.props.panel;
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

    let message = panelData[panelType][stateChange].message;
    let alertLevel = panelData[panelType][stateChange].alertLevel;
    let btnText = panelData[panelType][stateChange].btnText;

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
