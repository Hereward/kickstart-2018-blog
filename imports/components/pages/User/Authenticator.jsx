/*
"extends": "airbnb"
//"use strict";
// @ts-check
"extends": "sensible"
"extends": "defaults/configurations/airbnb/es6-react",
 "extends": ["plugin:meteor/recommended"]
*/

import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { withTracker } from "meteor/react-meteor-data";
import {
  Alert,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  FormText
} from "reactstrap";
import Transition from "../../partials/Transition";

const speakeasy = require("speakeasy");

class Authenticator extends Component {
  constructor(props) {
    super(props);

    // this.keyBase32 = "FRWFINCSNFMGKTDYGAXSIVCKJNOV2I2UF5CWE22BGVAEIMDFKR6Q"; //this.secret.base32;

    this.handleQRClick = this.handleQRClick.bind(this);
    this.handleVerifyClick = this.handleVerifyClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.checkTokens = this.checkTokens.bind(this);

    //this.getQRcodeURL = this.getQRcodeURL.bind(this);

    this.renderExpiredTokens = this.renderExpiredTokens.bind(this);
    this.getKey = this.getKey.bind(this);
    this.oldToken = "";
    this.counter = 0;

    this.expiredTokens = [];

    this.timerID = 0;

    this.state = {
      hideQRcode: !this.props.fresh,
      authCode: "",
      currentValidToken: "",
      QRcodeURL: "",
      keyBase32: ""
    };

    console.log(`CONSTUCTOR PRIVATE KEY = ${this.props.PrivateKey}`);
    console.log(`CONSTUCTOR SignedIn = ${this.props.SignedIn}`);
  }

  componentWillMount() {
    this.getKey();
  }

  componentDidMount() {}

  componentWillUnmount() {
    clearInterval(this.timerID);
    console.log(`Authenticator: componentWillUnmount`);
  }

  getLayout() {
    return this.state.hideQRcode ? this.verifyLayout() : this.QRLayout();
  }

  getQRcode() {
    let QRcode = (
      <div className="QRcode">
        <img alt="" src={this.state.QRcodeURL} />
      </div>
    );
    return QRcode;
  }

  getKey() {
    //let key = Meteor.user().private_key;
    //let SignedIn =  (Meteor.user());
    console.log(
      `getKey: SignedIn = [${this.props.SignedIn}] PrivateKey = [${
        this.props.PrivateKey
      }]`
    );
    if (this.props.SignedIn && this.props.PrivateKey) {
      this.setKeyProps(this.props.PrivateKey);
    } else {
      Meteor.call("authenticator.generateKey", (error, data) => {
        console.log("generating new key");
        if (error) {
          console.warn(error);
        }
        this.setKeyProps(data.key.base32);
        this.setState({ QRcodeURL: data.url });
      });
    }
  }

  setKeyProps(key) {
    console.log(`setKeyProps: ${key}`);
    this.setState({ keyBase32: key });
    this.timerID = setInterval(() => this.checkTokens(key), 2000);
  }

  handleVerifyClick() {
    this.verifyToken();
  }

  handleQRClick() {
    this.setState({ hideQRcode: true });
    this.updatePrivateKey();
  }

  updateAuthVerified(state) {
    let privateKey = this.state.keyBase32;
    let userId = Meteor.userId();
    console.log(`updateAuthVerified: verified = [${state}]`);
    if (userId) {
      console.log("Updating User Profile");
      Meteor.users.update(userId, {
        $set: {
          auth_verified: state
        }
      });
    }
  }

  updatePrivateKey() {
    let userId = Meteor.userId();
    let privateKey = this.state.keyBase32;

    if (userId) {
      Meteor.users.update(userId, {
        $set: {
          private_key: privateKey
        }
      });
    }
  }

  handleChange(e) {
    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let id = target.id;

    this.setState({ [id]: value });
  }

  verifyToken() {
    console.log(`QR CLICK - verifyToken`);
    console.log(`KEY - ${this.state.keyBase32}`);
    let myToken = this.state.authCode.trim();
    let verified;

    Meteor.call(
      "authenticator.verify",
      this.state.keyBase32,
      myToken,
      (error, response) => {
        if (error) {
          console.warn(error);
        }

        verified = response;
        if (!verified) {
          return swal({
            title: "Invalid Code",
            text: "You have 2 more attempts.",
            showConfirmButton: true,
            type: "error"
          });
        } else {
          this.updateAuthVerified(true);

          return swal({
            title: "Jackpot!",
            text: "You da man.",
            showConfirmButton: true,
            type: "success"
          });
        }
      }
    );
  }

  checkTokens(key) {
    console.log("CHECK TOKENS");
    let token;
    Meteor.call("authenticator.currentValidToken", key, (error, response) => {
      if (error) {
        console.warn(error);
      }
      token = response;
      if (this.oldToken !== token) {
        //console.log(`UPDATE SCREEN!`);
        console.log(`NEW TOKEN: ${token} | OLD TOKEN ${this.oldToken}`);
        this.setState({ currentValidToken: token });
        this.oldToken = token;
        this.expiredTokens.push(this.oldToken);
      }
    });
  }

  getlayout() {
    let layout = (
      <div>{this.state.hideQRcode ? this.verifyLayout() : this.QRLayout()}</div>
    );
    return layout;
  }

  QRLayout() {
    let QRLayout = (
      <Transition>
        <div>
          <h2>Register For 2 Factor Authentication</h2>
          <p className="lead">
            In order to use the full range of our services you will need to use
            2 factor authentication.
          </p>
          <div>{this.getQRcode()}</div>
          <p className="lead">
            Please scan the above QR code in Google Authenticator.
          </p>
          <Button id="QRDone" onClick={this.handleQRClick}>
            Click Here When Done
          </Button>
        </div>
      </Transition>
    );
    return QRLayout;
  }

  verifyLayout() {
    let layout = (
      <div>
        <Transition>
          <h2>Verify Authorisation Code</h2>
          <Form>
            <FormGroup>
              <Label for="authCode">
                Please enter the 6 digit authorisation code:
              </Label>
              <Input
                onChange={this.handleChange}
                type="text"
                name="authCode"
                id="authCode"
                placeholder="Enter the 6 digit authorisation code"
              />
            </FormGroup>
            <Button onClick={this.handleVerifyClick}>Submit</Button>
          </Form>

          <div>
            <Alert color="primary">{this.state.currentValidToken}</Alert>
          </div>

          <div>{this.renderExpiredTokens()}</div>
        </Transition>
      </div>
    );
    return layout;
  }

  renderExpiredTokens() {
    let items = this.expiredTokens.map(d => <li key={d}>{d}</li>);

    return <div>{items}</div>;
  }

  render() {
    return this.getlayout();
  }
}

export default withTracker(() => {
  Meteor.subscribe("userData");
  let SignedIn = Meteor.user() ? true : false;
  let PrivateKey = SignedIn ? Meteor.user().private_key : "";
  return { PrivateKey: PrivateKey, SignedIn: SignedIn };
})(Authenticator);

Authenticator.propTypes = {
  fresh: PropTypes.bool,
  SignedIn: PropTypes.bool,
  PrivateKey: PropTypes.string,
  EnhancedAuth: PropTypes.number
};
