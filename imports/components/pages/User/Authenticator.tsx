///<reference path="../../../../index.d.ts"/>
import { Meteor } from "meteor/meteor";
import * as speakeasy from "speakeasy";
import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import AuthenticatorForm from "../../forms/AuthenticatorForm";
import * as Library from "../../../modules/library";
import Transition from "../../partials/Transition";
import * as Methods from "../../../api/auth/methods";
import { Auth } from "../../../api/auth/publish";
import * as User from "../../../modules/user";
import AuthCodeDisplay from "../../partials/AuthCodeDisplay";
import QRCodeContainer from "../../partials/QRCode";
import { cancel2FA } from "../../../api/settings/methods";

interface IProps {
  history: any;
  boojam: string;
  enhancedAuth: boolean;
  userSettings: any;
  sessionToken: string;
}

interface IState {
  showQRcode: boolean;
  authCode: string;
  currentValidToken: string;
  disableSubmit: boolean;
  allowSubmit: boolean;
}

const opTypeMessage = {
  enabled: "2 Factor authentication has been activated.",
  disabled: "2 Factor authentication has been de-activated."
};

class Authenticator extends React.Component<IProps, IState> {
  oldToken: string;
  counter: number;
  timerID: any;
  expiredTokens: string[];
  allowKeyGeneration: boolean = true;
  timerWasSet: boolean;
  verifySuccessful: boolean = false;

  constructor(props) {
    super(props);

    this.handleQRClick = this.handleQRClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.cancel2FA = this.cancel2FA.bind(this);
    this.renderExpiredTokens = this.renderExpiredTokens.bind(this);
    this.oldToken = "";
    this.counter = 0;
    this.expiredTokens = [];
    this.timerID = 0;
    this.timerWasSet = false;
    let showQRcode = true;

    this.state = {
      showQRcode: showQRcode,
      authCode: "",
      currentValidToken: "",
      disableSubmit: false,
      allowSubmit: true
    };
    //log.info(`AUTHENTICATE CONSTRUCTOR`, this.props);
  }

  componentWillMount() {}

  componentDidUpdate() {
    //log.info(`AUTHENTICATE`, this.props);
  }

  componentWillReceiveProps(nextProps) {}

  componentWillUnmount() {}

  componentDidMount() {}

  handleSubmit() {
    this.setState({ allowSubmit: false });
    this.verifyToken();
  }

  handleQRClick() {
    this.setState({ showQRcode: false });
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let id = target.id;

    this.setState({ [id]: value });
  }

  cancel2FA() {
    this.setState({ allowSubmit: false });
    cancel2FA.call({ sessionToken: User.sessionToken("get") }, (err, res) => {
      if (err) {
        this.setState({ allowSubmit: true });
        Library.modalErrorAlert(err.reason);
        console.log(`cancel2FA error`, err);
      }
    });
  }

  verifyToken() {
    let myToken = this.state.authCode.trim();

    Methods.verifyToken.call({ myToken: myToken, sessionToken: User.sessionToken("get") }, (err, res) => {
      if (err) {
        if (err.error === "invalidCode") {
          Library.invalidAuthCodeAlert(err);
        }
        console.log(`verifyToken error`, err);
        this.setState({ allowSubmit: true });
      } else {
        this.verifySuccessful = true;
        if (res.operationIndicator) {
          Library.modalSuccessAlert({ message: opTypeMessage[res.operationIndicator] });
        }
      }
    });
  }

  getLayout() {
    let layout = (
      <Transition>
        <div className="container page-content">
          {this.state.showQRcode && this.props.userSettings && this.props.userSettings.authEnabled === 3 ? (
            <QRCodeContainer handleQRclick={this.handleQRClick} />
          ) : (
            this.verifyLayout()
          )}
        </div>
      </Transition>
    );
    return layout;
  }

  verifyLayout() {
    let layout = (
      <div>
        <AuthenticatorForm
          allowSubmit={this.state.allowSubmit}
          handleChange={this.handleChange}
          handleSubmit={this.handleSubmit}
          userSettings={this.props.userSettings}
          cancel2FA={this.cancel2FA}
        />

        {Meteor.settings.public.enhancedAuth.displayCode ? <AuthCodeDisplay /> : ""}
      </div>
    );
    return layout;
  }

  renderExpiredTokens() {
    let items = this.expiredTokens.map(d => <li key={d}>{d}</li>);

    return <div>{items}</div>;
  }

  render() {
    return this.getLayout();
  }
}

export default withTracker(() => {
  return {};
})(Authenticator);
