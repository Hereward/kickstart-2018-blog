///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
//import * as dateFormat from "dateformat";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import { Posts } from "../../../api/posts/publish";
import Transition from "../../partials/Transition";
import PageContent from "../../partials/PageContent";
import CommentBlogSection from "../../comments/CommentBlogSection";
import { Comments } from "../../../api/comments/publish";
import { Profiles } from "../../../api/profiles/publish";
import Spinner from "../../partials/Spinner";

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
        contentType="post"
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
      />
    );
  }

  allowEdit() {}

  comments() {
    let layout: any = "";
    if (this.props.post) {
      layout = <CommentBlogSection userId={this.props.userId} postId={this.props.post._id} />;
    }
    return layout;
  }

  render() {
    const { post } = this.props;
    return post ? (
      <Transition>
        <div className="page-content">
          {this.renderPost()}
          {this.comments()}
        </div>
      </Transition>
    ) : (
      ""
    );
  }
}

export default connect()(
  withTracker(props => {
    let postsDataHandle = Meteor.subscribe("posts");
    const commentsHandle = Meteor.subscribe("comments");
    let post: any;
    let totalComments = 0;
    let author: string = "";
    let profile: any;

    const slug = props.match.params.entry;
    if (postsDataHandle.ready()) {
      let raw = Posts.findOne({ slug: slug });
      //log.info(`BlogEntry()`, slug, raw, props.userId);
      if (raw && (raw.publish || raw.authorId === props.userId)) {
        post = raw;
      }
    }
    return {
      post: post
    };
  })(withStyles(styles, { withTheme: true })(BlogEntry))
);
