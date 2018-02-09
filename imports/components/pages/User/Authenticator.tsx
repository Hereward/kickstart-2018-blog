import { Meteor } from "meteor/meteor";
//import { Session } from 'meteor/session';
import * as speakeasy from "speakeasy";
import ReactRouterPropTypes from "react-router-prop-types";
import * as PropTypes from "prop-types";
import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import Loader from "react-loader-spinner";
import {
  Alert,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  FormText
} from "reactstrap";

import * as Library from "../../../modules/library";
import Transition from "../../partials/Transition";
import * as Methods from "../../../api/auth/methods";
import { Auth } from "../../../api/auth/publish";

//const speakeasy = require("speakeasy");

const LoadingPlaceHolder = styled.div`
  border: 1px dashed Silver;
  margin: 1rem;
  height: 228px;
  width: 228px;
  text-align: center;
  background-color: WhiteSmoke;
  color: #303030;
`;

interface IProps {
  signedIn: boolean;
  history: any;
  boojam: string;
  authData: {
    _id: string;
    verified: boolean;
    currentAttempts: number;
    private_key: string;
    owner: string;
    keyObj: any;
    QRCodeShown: boolean;
    QRCodeURL: string;
  };
}

interface IState {
  showQRcode: boolean;
  authCode: string;
  currentValidToken: string;
}

class Authenticator extends React.Component<IProps, IState> {
  oldToken: string;
  counter: number;
  timerID: any;
  expiredTokens: string[];
  allowKeyGeneration: boolean = true;
  timerWasSet: boolean;

  constructor(props) {
    super(props);

    if (this.props.authData && this.props.authData.verified) {
      this.props.history.push("/");
    }

    this.handleQRClick = this.handleQRClick.bind(this);
    this.handleVerifyClick = this.handleVerifyClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.checkTokens = this.checkTokens.bind(this);
    this.renderExpiredTokens = this.renderExpiredTokens.bind(this);
    this.oldToken = "";
    this.counter = 0;
    this.expiredTokens = [];
    this.timerID = 0;
    this.timerWasSet = false;
    let showQRcode =
      this.props.authData && this.props.authData.QRCodeShown === false
        ? true
        : false;

    //Session.get("showQRcode") ? true : false;

    this.state = {
      showQRcode: showQRcode,
      authCode: "",
      currentValidToken: ""
    };

    //let objData = JSON.stringify(this.props);
    console.log(
      `Authenticator constructor: showQRcode= [${showQRcode}]`,
      this.props,
      this.state
    );
  }

  static propTypes = {
    signedIn: PropTypes.bool,
    history: ReactRouterPropTypes.history,
    authData: PropTypes.shape({
      _id: PropTypes.string,
      verified: PropTypes.bool,
      currentAttempts: PropTypes.number,
      private_key: PropTypes.string,
      owner: PropTypes.string,
      keyObj: PropTypes.any,
      QRCodeShown: PropTypes.bool,
      QRCodeURL: PropTypes.string
    })
  };

  componentWillMount() {
    //this.getKey();
    console.log(`componentWillMount`, this.props.authData);
  }

  componentDidUpdate() {}

  componentWillReceiveProps(nextProps) {
    this.setTimer();
    /*
    console.log(`componentWillReceiveProps`, nextProps.authData);
    if (this.props.authData !== nextProps.authData) {
      if (typeof nextProps.authData.keyObj !== "undefined" && !nextProps.authData.QRCodeShown) {
        this.getQRCodeURL(nextProps.authData.keyObj.otpauth_url);
        this.setTimer(nextProps.authData);
      }
    }
    */
  }

  componentDidMount() {
    this.setTimer();
    /*
    console.log(`componentDidMount`, this.props.authData);
    if (this.props.authData && !this.props.authData.QRCodeShown) {
      if (typeof this.props.authData.keyObj !== "undefined") {
        this.getQRCodeURL(this.props.authData.keyObj.otpauth_url);
        //this.setTimer(this.props.authData);
      }
    }
      this.setTimer(this.props.authData);
      */
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
    //console.log(`Authenticator: componentWillUnmount`);
  }

  /*
  getLayout() {
    return this.state.showQRcode ? this.QRLayout() : this.verifyLayout();
  }
  */

  //typeof this.props.private_key !== "undefined"
  setTimer() {
    console.log(`set timer A`);
    if (this.props.authData) {
      console.log(`set timer B`);
      if (this.props.authData.private_key && !this.timerWasSet) {
        console.log(`set timer C`);
        this.timerID = setInterval(
          () => this.checkTokens(this.props.authData.private_key),
          2000
        );
        this.timerWasSet = true;
      }
    }
  }

  getQRCodeLayout() {
    let QRcode = (
      <div className="QRcode">
        <img alt="QR Code" src={this.props.authData.QRCodeURL} />
      </div>
    );
    return QRcode;
  }

  /*
  getQRCodeURL(OTPauthUrl) {
    if (OTPauthUrl) {
      let authFields = {
        otpauth_url: OTPauthUrl,
        id: this.props.authData._id
      };

      console.log(`getQRCode`, authFields);

      Methods.generateQRCode.call(authFields, (err, res) => {
        if (err) {
          Library.modalErrorAlert(err.reason);
          console.log(`generateQRCode error`, err);
        } else {
          console.log(`QRCODE successfully generated`, res);
        }
      });
    }
  }
  */

  /*
  getKey(nextProps) {
    if (
      this.props.authData !== nextProps.authData &&
      nextProps.authData.private_key
    ) {
      //this.setKeyProps(nextProps);
      this.timerID = setInterval(
        () => this.checkTokens(nextProps.authData.private_key),
        2000
      );
      console.log(
        `getKey: Props were received for Private Key`,
        nextProps.authData.private_key
      );
    } else if (
      nextProps.authData &&
      nextProps.authData.private_key === null &&
      this.allowKeyGeneration
    ) {
      this.allowKeyGeneration = false;

      let authFields = {
        key: this.props.authData.private_key
      };

      console.log(
        "getKey: Props were received for authData - generateQRCode.call",
        authFields
      );
      Methods.generateQRCode.call(authFields, (err, res) => {
        if (err) {
          Library.modalErrorAlert(err.reason);
          console.log(`generateQRCode error`, err);
        } else {
          //this.setKeyProps(res.key);
          //this.setKeyProps();
          console.log(`QRCODE successfully generated`);
        }
      });
    }
  }

  */

  /*
  setKeyProps(nextProps) {
    //let key = (newKey) ? newKey : this.props.privateKey;
    let key = nextProps.privateKey;
    this.setState({ keyBase32: key });
    this.timerID = setInterval(() => this.checkTokens(key), 2000);
  }
  */

  handleVerifyClick() {
    this.verifyToken();
  }

  handleQRClick() {
    this.setState({ showQRcode: false });
    //Session.set("showQRcode", false);
  }

  /*

  updatePrivateKey() {
    let userId = Meteor.userId();
    let privateKey = this.state.keyBase32;

    let authFields = {
      private_key: privateKey
    };

    Methods.setPrivateKey.call(authFields, (err, res) => {
      console.log("setPrivateKey.call", authFields);
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`setPrivateKey error`, err);
      } else {
        console.log(`Private Key successfully created`);
      }
    });

    
    if (userId) {
      Meteor.users.update(userId, {
        $set: {
          "enhancedAuth.private_key": privateKey
        }
      });
    }
    
  }

  */

  handleChange(e) {
    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let id = target.id;

    this.setState({ [id]: value });
  }

  updateAuthVerified(state) {
    let authFields = {
      verified: true
    };

    Methods.setVerified.call(authFields, (err, res) => {
      console.log("setVerified.call", authFields);
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`setVerified error`, err);
      } else {
        console.log(`Session was verified`);
      }
    });
  }

  verifyToken() {
    let myToken = this.state.authCode.trim();
    let verified;

    let authFields = {
      key: this.props.authData.private_key,
      myToken: myToken
    };

    Methods.verifyToken.call(authFields, (err, verified) => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`verifyToken error`, err);
      } else if (!verified) {
        return Library.modalErrorAlert({title: "Invalid Code", message: "Please try again."});
        
      } else {
        //this.updateAuthVerified(verified);
        console.log(`verifyToken: Authenticator> push('/')`);
        this.props.history.push("/");
      }
    });
    /*
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
          this.updateAuthVerified(verified);
          console.log(`verifyToken: Authenticator> push('/')`);
          this.props.history.push("/");
        }
      }
    );

    */
  }

  checkTokens(key) {
    //console.log("CHECK TOKENS");
    //let token: string;

    let authFields = {
      key: key
    };
    Methods.currentValidToken.call(authFields, (err, token) => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`currentValidToken error`, err);
      } else if (token && this.oldToken !== token) {
        //this.setKeyProps(res.key);
        //this.setKeyProps();
        //console.log(`Key successfully created`, res);

        //console.log(`UPDATE SCREEN!`);
        //console.log(`NEW TOKEN: ${token} | OLD TOKEN ${this.oldToken}`);
        if (this.oldToken !== token) {
          this.setState({ currentValidToken: token });
          this.oldToken = token;
          this.expiredTokens.push(this.oldToken);
        }
      }
    });

    /*
    Meteor.call("authenticator.currentValidToken", key, (error, response) => {
      if (error) {
        console.warn(error);
      }
      token = response;
      if (this.oldToken !== token) {
        //console.log(`UPDATE SCREEN!`);
        //console.log(`NEW TOKEN: ${token} | OLD TOKEN ${this.oldToken}`);
        this.setState({ currentValidToken: token });
        this.oldToken = token;
        this.expiredTokens.push(this.oldToken);
        console.log(`expired tokens`, this.expiredTokens);
      }
    });
    */
  }

  QRCodeReady() {
    let flag = false;
    //if (this.props.authData) {
    if (this.props.authData.QRCodeURL) {
      flag = true;
    }
    //}
    return flag;
  }

  getLayout() {
    let layout = (
      <div>{this.state.showQRcode ? this.QRLayout() : this.verifyLayout()}</div>
    );
    return layout;
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

  QRLayout() {
    let QRLayout = (
      <Transition>
        <div>
          <h2>Register For 2 Factor Authentication</h2>
          <p className="lead">
            In order to use the full range of our services you will need to use
            2 factor authentication.
          </p>
          <div>
            {this.props.authData.QRCodeURL
              ? this.getQRCodeLayout()
              : this.getLoadingPlaceHolder()}
          </div>

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
    return this.getLayout();
  }
}

export default withRouter(
  withTracker(() => {
    let authData: any;
    //authData = { private_key: null };
    Meteor.subscribe("userData");
    let authDataReady = Meteor.subscribe("enhancedAuth");
    
    if (Meteor.user()) {
      let id = Meteor.userId();

      if (authDataReady) {
        authData = Auth.findOne({ owner: id });
      }
    }

    return { authData: authData };
  })(Authenticator)
);
//boo
