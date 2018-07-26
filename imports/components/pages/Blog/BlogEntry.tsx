///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import { connect } from "react-redux";
import * as dateFormat from "dateformat";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import { Posts } from "../../../api/posts/publish";
import Transition from "../../partials/Transition";

let styles: any;
styles = theme => ({});

interface IProps {
  post: any;
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
      layout = (
        <div>
          <h2>{post.title}</h2>
          <div>{dateFormat(post.published, "dd mmmm yyyy")} | 0 Comments</div>
          <div dangerouslySetInnerHTML={{ __html: post.body }} />
        </div>
      );
    }

    return layout;
  }

  render() {
    const { post } = this.props;
    return (
      <Transition>
        <div className="container page-content">{this.renderPost()}</div>
      </Transition>
    );
  }
}

export default connect()(
  withTracker(props => {
    let PostsDataReady = Meteor.subscribe("posts");
    let post: any;
    log.info(`BlogEntry.Tracker()`, props);
    //const path = props.location.pathname;
    //const pattern = /[a-z0-9]+(?:-[a-z0-9]+)*$/i;
    //let match = pattern.exec(path);
    const slug = props.match.params.entry;
    log.info(`BlogEntry.Tracker() SLUG = `, slug);
    //const match2 = path.match(pattern);
    //log.info(`BlogEntry.Tracker()`, path, slug, props.location, match, match2);
    if (PostsDataReady) {
      post = Posts.findOne({ slug: slug });
    }
    return {
      post: post
    };
  })(withStyles(styles, { withTheme: true })(BlogEntry))
);
