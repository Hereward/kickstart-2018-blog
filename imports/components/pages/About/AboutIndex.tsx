import { Meteor } from "meteor/meteor";
import { connect } from "react-redux";
import { Roles } from "meteor/alanning:roles";
import PropTypes from "prop-types";
import * as React from "react";
import { withStyles } from "@material-ui/core/styles";
import { withTracker } from "meteor/react-meteor-data";
import Transition from "../../partials/Transition";
import { Pages } from "../../../api/pages/publish";
import PageContent from "../../partials/PageContent";
import * as User from "../../../modules/user";
import { Profiles } from "../../../api/profiles/publish";
import Author from "../Blog/Author";
import Spinner from "../../partials/Spinner";

let styles: any;
styles = theme => ({
  contributors: {
    marginTop: "2rem"
  },
  contributorList: {
    padding: 0
  },
  contributor: {
    fontWeight: "bold",
    fontSize: "1.2rem",
    listStyleType: "none",
    marginBottom: "1rem"
  }
});

interface IProps {
  page: any;
  classes: PropTypes.object.isRequired;
  history: PropTypes.object.isRequired;
  systemSettings: PropTypes.object.isRequired;
  creators: PropTypes.object.isRequired;
}

class About extends React.Component<IProps> {
  constructor(props) {
    super(props);
  }

  customContent() {
    const { classes } = this.props;
    const userList = this.mapUsers();
    return (
      <div className={classes.contributors}>
        <h2>Our Contributors</h2>
        <ul className={classes.contributorList}>{userList}</ul>
      </div>
    );
  }

  mapUsers() {
    const { classes, creators } = this.props;
    const mapped = creators.map(user => {
      const verified = user.emails[0].verified;
      const layout = verified ? (
        <li className={classes.contributor} key={`contributor_${user._id}`}>
          <Author authorId={user._id} />
        </li>
      ) : (
        ""
      );
      return layout;
    });

    return mapped;
  }

  render() {
    const { page, history, creators } = this.props;
    return page ? (
      <Transition>
        <PageContent
          contentType="page"
          systemSettings={this.props.systemSettings}
          history={history}
          permissionThreshold="creator"
          updateMethod="pages.updateInline"
          post={page}
          imageUpdateMethod="image.UpdatePageAdmin"
          postCreateMethod="page.create"
          postUpdateMethod="pages.update"
          subscription="pages"
          showFormInit={false}
        />
        {creators && this.customContent()}
      </Transition>
    ) : (
      <Spinner />
    );
  }
}

export default connect()(
  withTracker(props => {
    const allUsersPublicHandle = Meteor.subscribe("allUsersPublic", "creator");
    const path = props.location.pathname;
    let creators: any = "";
    const pattern = /[a-z0-9]+(?:-[a-z0-9]+)*$/i;
    let match = pattern.exec(path);
    const slug = match[0];
    const userSortOptions: any = {
      sort: { createdAt: 1 }
    };

    let page: any;
    let pagesHandle = Meteor.subscribe("pages");
    let usersHandle = Meteor.subscribe("allUsers");

    if (pagesHandle.ready()) {
      page = Pages.findOne({ publish: true, slug: slug });
    }
    if (allUsersPublicHandle.ready()) {
      const cursor = Roles.getUsersInRole("creator", userSortOptions);
      creators = cursor.fetch();
      //log.info(`About.Tracker()`, creators);
    }

    return { page: page, creators: creators };
  })(withStyles(styles, { withTheme: true })(About))
);
