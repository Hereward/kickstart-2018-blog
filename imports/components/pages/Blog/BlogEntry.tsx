///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import { connect } from "react-redux";
import * as dateFormat from "dateformat";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import { Posts } from "../../../api/posts/publish";
import Transition from "../../partials/Transition";
import PageContent from "../../partials/PageContent";
import CommentBlogSection from "../../comments/CommentBlogSection";
import { Comments } from "../../../api/comments/publish";

let styles: any;
styles = theme => ({});

interface IProps {
  post: any;
  totalComments: number;
  userId: string;
}

interface IState {}

class BlogEntry extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  /*
  layout = (
        <div>
          <h2>{post.title}</h2>
          <div>{dateFormat(post.published, "dd mmmm yyyy")} | 0 Comments</div>
          <div dangerouslySetInnerHTML={{ __html: post.body }} />
        </div>
      );
      */

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
        permissionThreshold="creator"
        updateMethod="posts.updateInline"
        post={this.props.post}
        totalComments={this.props.totalComments}
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
    return (
      <Transition>
        <div className="container page-content">
          {this.renderPost()}
          {this.comments()}
        </div>
      </Transition>
    );
  }
}

export default connect()(
  withTracker(props => {
    let PostsDataReady = Meteor.subscribe("posts");
    const commentsHandle = Meteor.subscribe("comments");
    let post: any;
    let totalComments = 0;

    //const path = props.location.pathname;
    //const pattern = /[a-z0-9]+(?:-[a-z0-9]+)*$/i;
    //let match = pattern.exec(path);
    const slug = props.match.params.entry;
    //log.info(`BlogEntry.Tracker() SLUG = `, slug);
    //const match2 = path.match(pattern);
    //log.info(`BlogEntry.Tracker()`, path, slug, props.location, match, match2);
    if (PostsDataReady) {
      post = Posts.findOne({ slug: slug });
      if (post) {
        totalComments = Comments.find({ postId: post._id }).count();
      }
    }
    return {
      post: post,
      totalComments: totalComments
    };
  })(withStyles(styles, { withTheme: true })(BlogEntry))
);
