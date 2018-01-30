import { Meteor } from "meteor/meteor";
import * as speakeasy from "speakeasy";
import ReactRouterPropTypes from "react-router-prop-types";
import * as PropTypes from 'prop-types';
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
import Transition from "../../partials/Transition";

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
  fresh: boolean;
  signedIn: boolean;
  history: any;
  boojam: string;
}

interface IState {
  hideQRcode: boolean;
  authCode: string;
  currentValidToken: string;
  QRcodeURL: string;
  keyBase32: string;
}

class Authenticator extends React.Component<IProps, IState> {
  oldToken: string;
  counter: number;
  timerID: any;
  expiredTokens: string[];

  constructor(props) {
    super(props);

    this.handleQRClick = this.handleQRClick.bind(this);
    this.handleVerifyClick = this.handleVerifyClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.checkTokens = this.checkTokens.bind(this);
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

    let objData = JSON.stringify(this.props);

    console.log(`fuck a duck`);

  }

  static propTypes = {
    fresh: PropTypes.bool,
    signedIn: PropTypes.bool,
    history: ReactRouterPropTypes.history
  };

  componentWillMount() {
    this.getKey();
  }

  componentDidMount() {}

  componentWillUnmount() {
    clearInterval(this.timerID);
    //console.log(`Authenticator: componentWillUnmount`);
  }

  getLayout() {
    return this.state.hideQRcode ? this.verifyLayout() : this.QRLayout();
  }

  getQRcode() {
    let QRcode = (
      <div className="QRcode">
        <img alt="QR Code" src={this.state.QRcodeURL} />
      </div>
    );
    return QRcode;
  }

  getKey() {
    if (this.props.signedIn && Meteor.user().enhancedAuth.private_key) {
      this.setKeyProps(Meteor.user().enhancedAuth.private_key);
    } else {
      Meteor.call("authenticator.generateKey", (error, data) => {
        //console.log("generating new key");
        if (error) {
          console.warn(error);
        }
        this.setKeyProps(data.key.base32);
        this.updatePrivateKey();
        this.setState({ QRcodeURL: data.url });
      });
    }
  }

  setKeyProps(key) {
    //console.log(`setKeyProps: ${key}`);
    this.setState({ keyBase32: key });
    this.timerID = setInterval(() => this.checkTokens(key), 2000);
  }

  handleVerifyClick() {
    this.verifyToken();
  }

  handleQRClick() {
    this.setState({ hideQRcode: true });
  }

  updatePrivateKey() {
    let userId = Meteor.userId();
    let privateKey = this.state.keyBase32;

    if (userId) {
      Meteor.users.update(userId, {
        $set: {
          "enhancedAuth.private_key": privateKey
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

  updateAuthVerified(state) {
    Meteor.call(
      "authenticator.updateAuthVerified",
      state,
      (error, response) => {
        if (error) {
          console.warn(error);
        }
      }
    );
  }

  verifyToken() {
    //console.log(`QR CLICK - verifyToken`);
    //console.log(`KEY - ${this.state.keyBase32}`);
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
          this.updateAuthVerified(verified);
          console.log(`verifyToken: Authenticator> push('/')`);
          this.props.history.push("/");
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
        //console.log(`NEW TOKEN: ${token} | OLD TOKEN ${this.oldToken}`);
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
            {this.state.keyBase32
              ? this.getQRcode()
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
    return this.getlayout();
  }
}

export default withRouter(
  withTracker(() => {
    Meteor.subscribe("userData");
    let fresh: boolean;
    if (typeof Meteor.user().enhancedAuth !== "undefined") {
      fresh = (Meteor.user().enhancedAuth.private_key === null);
    }
    console.log(`Authenticator: fresh= [${fresh}]`);
   
    return { fresh: fresh };
  })(Authenticator)
);


