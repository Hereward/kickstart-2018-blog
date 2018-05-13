import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import Transition from "../../partials/Transition";
import * as Library from "../../../modules/library";

interface IProps {
  sessionReady: boolean;
  userSettings: any;
  userSession: any;
  history: any;
  userData: any;
}

class Locked extends React.Component<IProps> {
  constructor(props) {
    super(props);
  }

  componentDidUpdate() {
    this.checker();
  }

  checker() {
    let locked = Library.nested(["userSettings", "locked"], this.props);
    let verified = Library.nested(["userSession", "verified"], this.props);
    let authEnabled = Library.nested(["userSettings", "authEnabled"], this.props);
    if (locked === false) {
      if (authEnabled === 0 || (authEnabled && verified === true)) {
        this.props.history.push("/");
      }
    }
  }

  layout() {
    let layout = (
      <div className="container page-content">
        <h1>Account Locked</h1>
        <div>
          You exceeded the maximum allowed number of authentication attempts while logging in. Your account is now
          locked on all client sessions. Please contact Admin to reinstate access.
        </div>
      </div>
    );

    return layout;
  }

  render() {
    return <Transition>{this.layout()}</Transition>;
  }
}

export default withRouter(
  withTracker(() => {
    return {};
  })(Locked)
);
