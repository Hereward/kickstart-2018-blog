import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import Transition from "../../partials/Transition";

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

  layout() {
    let layout = (
      <div className="page-content">
        <h1>Account Locked</h1>
        <div>
          Your account has been locked. This can happen for a variety of reasons. Please contact Admin to reinstate
          access.
        </div>
      </div>
    );

    return layout;
  }

  render() {
    return <Transition>{this.layout()}</Transition>;
  }
}

export default withTracker(() => {
  return {};
})(Locked);
