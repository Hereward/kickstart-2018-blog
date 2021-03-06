import { Meteor } from "meteor/meteor";
import * as React from "react";
import * as PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import Transition from "../../partials/Transition";
import { Pages } from "../../../api/pages/publish";
import PageContent from "../../partials/PageContent";
import Spinner from "../../partials/Spinner";

interface IProps {
  page: any;
  history: PropTypes.object.isRequired;
  systemSettings: PropTypes.object.isRequired;
  userId: string;
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
      <div className="page-content">
        <h1>{Meteor.settings.public.defaultContent.about.heading}</h1>
        <div dangerouslySetInnerHTML={this.createMarkup(Meteor.settings.public.defaultContent.about.body)} />
      </div>
    );
    return layout;
  }

  render() {
    const { page, systemSettings, history } = this.props;
    return page ? (
      <Transition>
        <PageContent
          contentType="pages"
          systemSettings={systemSettings}
          history={history}
          permissionThreshold="creator"
          updateMethod="pages.updateInline"
          post={page}
          imageUpdateMethod="image.UpdatePageAdmin"
          postCreateMethod="page.create"
          postUpdateMethod="pages.update"
          subscription="pages"
          showFormInit={false}
          userId={this.props.userId}
        />
      </Transition>
    ) : (
      <div className="page-content">
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
  let page: any;
  let pagesHandle = Meteor.subscribe("pages");
  if (pagesHandle.ready()) {
    page = Pages.findOne({ publish: true, slug: slug });
  }
  return { page: page };
})(Page);
