import * as React from "react";
import { Meteor } from "meteor/meteor";
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import Transition from "../../partials/Transition";
import PostList from "./PostList";
import { can as userCan } from "../../../modules/user";

let styles: any;
styles = theme => ({
  mainHeading: {
    marginBottom: "1rem"
  },
  postListRoot: {
    marginTop: "1rem"
  },
  postListItem: {
    marginBottom: "1rem"
  },
  profilePostSection: {
    marginLeft: "1rem"
  }
});

interface IProps {
  classes: PropTypes.object.isRequired;
  profile: PropTypes.object.isRequired;
  dispatch: any;
  userId: string;
  profileUserId: string;
}

interface IState {
  cursorLimitDraft: number;
  cursorLimitPublished: number;
}

class ProfilePosts extends React.Component<IProps, IState> {
  basePaginationUnit: number;
  ownerView: boolean;

  constructor(props) {
    super(props);
    this.basePaginationUnit = Meteor.settings.public.admin.basePaginationUnit;
    this.ownerView = userCan({ threshold: "owner", owner: props.profile.owner });
    this.state = {
      cursorLimitDraft: this.basePaginationUnit,
      cursorLimitPublished: this.basePaginationUnit
    };
  }

  loadMorePosts = publishStatus => {
    const cursorType: any = publishStatus === "draft" ? "cursorLimitDraft" : "cursorLimitPublished";
    const currentTotal = this.state[cursorType];
    const newTotal = currentTotal + this.basePaginationUnit;
    this.setState({ [cursorType]: newTotal });
  };

  layout() {
    const { profile, classes, userId, profileUserId } = this.props;
    const { cursorLimitPublished, cursorLimitDraft } = this.state;
    return (
      <div>
        {!this.ownerView && <h1 className="feature-heading">Posts by {profile.screenName}</h1>}

        <div className={classes.postListRoot}>
          {this.ownerView && (
            <PostList
              loadMorePosts={this.loadMorePosts}
              cursorLimit={cursorLimitDraft}
              userId={userId}
              publishStatus="draft"
              ownerView={this.ownerView}
              profileUserId={profileUserId}
            />
          )}
          <PostList
            loadMorePosts={this.loadMorePosts}
            cursorLimit={cursorLimitPublished}
            userId={userId}
            publishStatus="published"
            ownerView={this.ownerView}
            profileUserId={profileUserId}
          />
        </div>
      </div>
    );
  }

  render() {
    return (
      <Transition>
        <div>{this.layout()}</div>
      </Transition>
    );
  }
}

export default connect()(
  withTracker(props => {
    return {};
  })(withStyles(styles, { withTheme: true })(ProfilePosts))
);
