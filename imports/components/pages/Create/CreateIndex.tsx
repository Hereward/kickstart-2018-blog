///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import PageContent from "../../partials/PageContent";

let styles: any;
styles = theme => ({});

interface IProps {
  history: PropTypes.object.isRequired;
  classes: PropTypes.object.isRequired;
  systemSettings: PropTypes.object.isRequired;
  dispatch: any;
  userId: string;
}

interface IState {}

class Boojam extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  layout() {
    return (
      <PageContent
        contentType="post"
        systemSettings={this.props.systemSettings}
        history={this.props.history}
        permissionThreshold="creator"
        updateMethod="posts.updateInline"
        imageUpdateMethod="image.UpdatePostAdmin"
        postUpdateMethod="posts.update"
        postCreateMethod="post.create"
        subscription="posts"
        showFormInit={true}
        userId={this.props.userId}
      />
    );
  }

  render() {
    return <div className="page-content">{this.layout()}</div>;
  }
}

export default connect()(
  withTracker(props => {
    return {};
  })(withStyles(styles, { withTheme: true })(Boojam))
);
