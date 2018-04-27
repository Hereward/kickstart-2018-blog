///<reference path="../../../../index.d.ts"/>
import { Meteor } from "meteor/meteor";
import * as speakeasy from "speakeasy";
import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import AuthenticatorForm from "../../forms/AuthenticatorForm";
import * as Library from "../../../modules/library";
import Transition from "../../partials/Transition";
import * as Methods from "../../../api/auth/methods";
import { Auth } from "../../../api/auth/publish";
import * as User from "../../../modules/user";
import AuthCodeDisplay from "../../partials/AuthCodeDisplay";
import QRCodeContainer from "../../partials/QRCode";

interface IProps {
  history: any;
  boojam: string;
  enhancedAuth: boolean;
  userSettings: any;
  loginToken: string;
  userSession: any;
  authData: {
    _id: string;
    verified: boolean;
    currentAttempts: number;
    private_key: string;
    owner: string;
    keyObj: any;
    QRCodeShown: boolean;
    QRCodeURL: string;
    enabled: number;
  };
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
    this.goHome = this.goHome.bind(this);
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
  }

  componentWillMount() {}

  componentDidUpdate() {
    if (this.props.userSettings && ((this.props.userSession && this.props.userSession.auth && this.props.userSession.auth.verified) || !this.props.userSettings.authEnabled)) {
       //this.props.history.push("/");
    }
  }

  componentWillReceiveProps(nextProps) {}

  componentWillUnmount() {}

  componentDidMount() {}

  getQRCodeLayout() {
    let QRcode = (
      <div className="QRcode">
        <div>
          <img alt="QR Code" src={this.props.authData.QRCodeURL} />
        </div>
        <div className="private-key">{this.props.authData.private_key}</div>
      </div>
    );
    return QRcode;
  }

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

  verifyToken() {
    let myToken = this.state.authCode.trim();

    Methods.verifyToken.call({ myToken: myToken, loginToken: User.sessionToken('get') }, (err, res) => {
      if (err) {
        Library.invalidAuthCodeAlert(err);
        console.log(`verifyToken error`, err);
        this.setState({ allowSubmit: true });
      } else {
        this.verifySuccessful = true;
        if (res.operationIndicator) {
          Library.modalSuccessAlert({ message: opTypeMessage[res.operationIndicator] });
        }
        log.info(`verifyToken - SUCCESS`);
        //this.props.history.push("/");
      }
    });
  }

  goHome() {
    log.info("GO HOME");
    this.props.history.push("/");
  }

  getLayout() {
    let layout = (
      <div className="container page-content">
        {this.state.showQRcode && this.props.userSettings && this.props.userSettings.authEnabled === 3 ? (
          <QRCodeContainer handleQRclick={this.handleQRClick} exit={this.goHome} />
        ) : (
          this.verifyLayout()
        )}
      </div>
    );
    return layout;
  }

  verifyLayout() {
    let layout = (
      <Transition>
        <div>
          <AuthenticatorForm
            allowSubmit={this.state.allowSubmit}
            handleChange={this.handleChange}
            handleSubmit={this.handleSubmit}
          />

          {Meteor.settings.public.enhancedAuth.displayCode ? <AuthCodeDisplay /> : ""}
        </div>
      </Transition>
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

export default withRouter(
  withTracker(() => {
    return {};
  })(Authenticator)
);
