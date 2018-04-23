import * as React from "react";
import { Meteor } from "meteor/meteor";
import { Alert } from "reactstrap";
import * as Library from "../../modules/library";
//import * as Methods from "../../api/auth/methods";
import { currentValidToken } from "../../api/auth/methods";

interface IProps {}

interface IState {
  currentValidToken: string;
}

export default class AuthCodeDisplay extends React.Component<IProps, IState> {
  timerID: any;
  expiredTokens: string[];
  timerWasSet: boolean;
  oldToken: string;

  emailVerifyPrompted: boolean;
  constructor(props) {
    super(props);
    this.expiredTokens = [];
    this.oldToken = "";
    this.timerID = 0;
    this.timerWasSet = false;
    this.checkTokens = this.checkTokens.bind(this);
    this.renderExpiredTokens = this.renderExpiredTokens.bind(this);
    this.state = {
      currentValidToken: ""
    };
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  componentDidMount() {
    this.setTimer();
  }

  componentWillReceiveProps(nextProps) {
    this.setTimer();
  }

  componentWillUpdate(nextProps) {}

  componentDidUpdate() {}

  setTimer() {
    if (!this.timerWasSet) {
      this.timerID = Meteor.setInterval(() => this.checkTokens(), 2000);
      this.timerWasSet = true;
    }
  }

  renderExpiredTokens() {
    let items = this.expiredTokens.map(d => <li key={d}>{d}</li>);

    return <div>{items}</div>;
  }

  checkTokens() {
    //console.log(`checkTokens`);
    currentValidToken.call({}, (err, token) => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`currentValidToken error`, err);
      } else if (token && this.oldToken !== token) {
        //console.log(`checkTokens [${token}]`);
        this.setState({ currentValidToken: token });
        this.oldToken = token;
        this.expiredTokens.push(this.oldToken);
      }
    });
  }

  render() {
    let layout = (
      <div>
        <Alert color="primary">{this.state.currentValidToken}</Alert>
      </div>
    );

    return this.state.currentValidToken ? layout : "";
  }
}
