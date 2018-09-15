///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
//import PageContent from "../../partials/PageContent";
import PostForm from "../../admin/forms/PostForm";

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

class CreateIndex extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleEditing = (state, editingExistingData: boolean) => {
    return true;
  };

  handleNewPostCreated = pageFields => {
    const { history } = this.props;
    history.push(`/blog/${pageFields.slug}`);
    //this.setState({ showForm: false });
  };

  handlePostUpdated = () => {
    return true;
  };

  layout() {
    return (
      <React.Fragment>
        <h2>New Post</h2>
        <PostForm
          imageUpdateMethod="image.UpdatePostAdmin"
          hasImage={true}
          handleEditing={this.handleEditing}
          postUpdateMethod="posts.update"
          postCreateMethod="post.create"
          hasTags={true}
          editingExistingData={false}
          handleNewPostCreated={this.handleNewPostCreated}
          handlePostUpdated={this.handlePostUpdated}
          editMode="creator"
          contentType="posts"
        />
      </React.Fragment>
    );
  }

  render() {
    return <div className="page-content">{this.layout()}</div>;
  }
}

export default connect()(
  withTracker(props => {
    return {};
  })(withStyles(styles, { withTheme: true })(CreateIndex))
);
