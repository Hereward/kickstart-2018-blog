///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import { Posts } from "../../../api/posts/publish";
import Transition from "../../partials/Transition";
import PageContent from "../../partials/PageContent";
import { Comments } from "../../../api/comments/publish";
import { Profiles } from "../../../api/profiles/publish";

let styles: any;
styles = theme => ({});

interface IProps {
  history: PropTypes.object.isRequired;
  systemSettings: PropTypes.object.isRequired;
  post: any;
  totalComments: number;
  userId: string;
  author: string;
}

interface IState {}

class BlogEntry extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  renderPost() {
    const { post } = this.props;
    let layout: any = "";
    if (post) {
      layout = this.template();
    }

    return layout;
  }

  template() {
    return (
      <PageContent
        contentType="posts"
        systemSettings={this.props.systemSettings}
        history={this.props.history}
        permissionThreshold="creator"
        updateMethod="posts.updateInline"
        post={this.props.post}
        imageUpdateMethod="image.UpdatePostAdmin"
        postUpdateMethod="posts.update"
        postCreateMethod="post.create"
        subscription="posts"
        showFormInit={false}
        hasComments={true}
        userId={this.props.userId}
      />
    );
  }

  allowEdit() {}

  render() {
    const { post } = this.props;
    return post ? (
      <Transition>
        <div className="page-content">{this.renderPost()}</div>
      </Transition>
    ) : (
      ""
    );
  }
}

export default connect()(
  withTracker(props => {
    const commentsHandle = Meteor.subscribe("comments");
    const slug = props.match.params.entry;
    const post = Posts.findOne({ slug: slug });

    return {
      post: post
    };
  })(withStyles(styles, { withTheme: true })(BlogEntry))
);
