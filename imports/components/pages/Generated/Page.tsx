import { Meteor } from "meteor/meteor";
import * as React from "react";
import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
//import Transition from "../../partials/Transition";
import { Pages } from "../../../api/pages/publish";
import PageContent from "../../partials/PageContent";
//import * as User from "../../../modules/user";
import Spinner from "../../partials/Spinner";

interface IProps {
  page: any;
  history: PropTypes.object.isRequired;
  systemSettings: PropTypes.object.isRequired;
}

class Page extends React.Component<IProps> {
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
    const { page } = this.props;
    return page ? (
      <PageContent
        contentType="page"
        systemSettings={this.props.systemSettings}
        history={this.props.history}
        permissionThreshold="creator"
        updateMethod="pages.updateInline"
        post={this.props.page}
        imageUpdateMethod="image.UpdatePageAdmin"
        postCreateMethod="page.create"
        postUpdateMethod="pages.update"
        subscription="pages"
        showFormInit={false}
      />
    ) : (
      <div className="container page-content">
        <Spinner />
      </div>
    );
  }
}

export default withTracker(props => {
  const path = props.location.pathname;
  const pattern = /[a-z0-9]+(?:-[a-z0-9]+)*$/i;
  let match = pattern.exec(path);
  const slug = match[0];
  //log.info(`Page.Tracker()`, path, slug, match);

  //const slug = path.replace(/microsoft/i, "W3Schools");
  let page: any;
  let PagesDataReady = Meteor.subscribe("pages");
  if (PagesDataReady) {
    page = Pages.findOne({ publish: true, slug: slug });
  }
  return { page: page };
})(Page);
