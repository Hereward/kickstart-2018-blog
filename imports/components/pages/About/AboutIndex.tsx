/*
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import Transition from "../../partials/Transition";
import { Pages } from "../../../api/pages/publish";
import PageContent from "../../partials/PageContent";
import * as User from "../../../modules/user";

interface IProps {
  page: any;
  history: PropTypes.object.isRequired;
}

class About extends React.Component<IProps> {
  constructor(props) {
    super(props);
  }

  createMarkup(html) {
    return { __html: html };
  }

  defaultLayout() {
    let layout = (
      <div className="container page-content">
        <h1>{Meteor.settings.public.defaultContent.about.heading}</h1>
        <div dangerouslySetInnerHTML={this.createMarkup(Meteor.settings.public.defaultContent.about.body)} />
      </div>
    );
    return layout;
  }

  render() {
    return <Transition>{User.id() ? <PageContent history={this.props.history} permissionThreshold="editor" contentType="post" updateMethod="pages.updateInline" post={this.props.page} /> : this.defaultLayout()}</Transition>;
  }
}

export default withTracker(props => {
  let page: any;
  let PagesDataReady = Meteor.subscribe("pages");
  if (PagesDataReady) {
    page = Pages.findOne({ publish: true, slug: "about" });
  }
  return { page: page };
})(About);

*/
