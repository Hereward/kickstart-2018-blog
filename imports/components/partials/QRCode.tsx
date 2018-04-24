///<reference path="../../../index.d.ts"/>
import * as React from "react";
import { Meteor } from "meteor/meteor";
import { Button } from "reactstrap";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import Loader from "react-loader-spinner";
import styled from "styled-components";
import * as Library from "../../modules/library";
import Transition from "./Transition";
import {getDecrpytedAuthData, cancel as cancel2FA } from "../../api/auth/methods";
import { Auth } from "../../api/auth/publish";
import * as User from "../../modules/user";

let QRCodeContainer: any;

interface IProps {
  handleQRclick: any;
  exit: any;
  authData: {
    QRCodeShown: boolean;
  };
}

interface IState {
  QRCodeURL: string;
  privateKey: string;
  cancelEnabled: boolean;
}

const LoadingPlaceHolder = styled.div`
  border: 1px dashed Silver;
  margin: 1rem;
  height: 228px;
  width: 228px;
  text-align: center;
  background-color: WhiteSmoke;
  color: #303030;
`;

class QRCode extends React.Component<IProps, IState> {
  tipInitialised: boolean = false;
  clearTip: boolean = false;
  currentTip: string = "";
  emailVerifyPrompted: boolean;

  constructor(props) {
    super(props);
    this.handleQRClick = this.handleQRClick.bind(this);
    this.cancel2FA = this.cancel2FA.bind(this);
    this.state = {
      QRCodeURL: "",
      privateKey: "",
      cancelEnabled: false
    };
    
  }

  componentWillReceiveProps(nextProps) {}

  componentWillUpdate(nextProps) {}

  componentDidUpdate() {}

  componentWillMount() {
    
    getDecrpytedAuthData.call({}, (err, res) => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`initAuth error`, err);
      } else {
        log.info(`initAuth - DONE (Client)!`, res);
        this.setState({ privateKey: res.key, QRCodeURL: res.url });
      }
    });
    
  }

  componentDidMount() {}

  handleQRClick() {
    this.props.handleQRclick();
  }

  cancel2FA() {
    this.setState({cancelEnabled: false});
    cancel2FA.call({}, (err, res) => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`cancel2FA error`, err);
      }
      this.props.exit();
    });
  }

  getLoadingPlaceHolder() {
    let tag = (
      <LoadingPlaceHolder className="d-flex align-items-center">
        <div className="m-auto">
          <Loader type="Oval" color="red" height="80" width="80" />
          <div className="mx-2 mt-2">Loading QR code, please wait...</div>
        </div>
      </LoadingPlaceHolder>
    );

    return tag;
  }

  getQRCodeLayout() {
    let QRcode = (
      <div className="QRcode">
        <div>
          <img alt="QR Code" src={this.state.QRCodeURL} />
        </div>
        <div className="private-key">{this.state.privateKey}</div>
      </div>
    );
    return QRcode;
  }

  render() {
    return (
      <Transition>
        <div>
          <h2>Register For 2 Factor Authentication</h2>
          <p className="lead">
            In order to use the full range of our services you will need to use 2 factor authentication.
          </p>
          <p className="lead">Below you will see a graphical QR code followed by the private key text string.</p>
          <div>{this.state.QRCodeURL ? this.getQRCodeLayout() : this.getLoadingPlaceHolder()}</div>

          <p className="lead">Please scan the QR code or manually enter the private key into Google Authenticator.</p>
          <Button color="primary" id="QRDone" onClick={this.handleQRClick}>
            Click Here When Done
          </Button> &nbsp;
          <Button color="secondary" disabled={this.state.cancelEnabled} id="cancel2FA" onClick={this.cancel2FA}>
            Cancel
          </Button>
        </div>
      </Transition>
    );
  }
}

export default (QRCodeContainer = withTracker(() => {
  let authData: any;
  //Meteor.subscribe("userData");
  let authDataReady = Meteor.subscribe("enhancedAuth");

  if (User.id()) {
    let id = User.id();

    if (authDataReady) {
      authData = Auth.findOne({ owner: id });
    }
  }

  return { authData: authData };
})(QRCode));
