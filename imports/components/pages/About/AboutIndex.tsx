import * as React from "react";
import Transition from "../../partials/Transition";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Pages } from "../../../api/pages/publish";
import PageContent from "../../partials/PageContent";

interface IProps {
  page: any;
}

class About extends React.Component<IProps> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Transition>
        <PageContent page={this.props.page} />
      </Transition>
    );
  }
}

export default withRouter(
  withTracker(props => {
    let page: any;
    let PagesDataReady = Meteor.subscribe("pages");
    if (PagesDataReady) {
      page = Pages.findOne({ name: "about" });
    }
    return { page: page };
  })(About)
);
