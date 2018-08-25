///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import * as ReactTags from "react-tag-autocomplete";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import OptionGroup from "./OptionGroup";
import { Tags } from "../../../api/tags/publish";

let styles: any;
styles = theme => ({
  tagContainer: { margin: "1rem" }
});

interface IProps {
  classes: PropTypes.object.isRequired;
  importedTags: PropTypes.object.isRequired;
  dataObj?: PropTypes.object.isRequired;
  dispatch: any;
}

interface IState {
  editTags: boolean;
}

class EditTags extends React.Component<IProps, IState> {
  importedTagsFormatted: any[];
  tagsReady: boolean;

  constructor(props) {
    super(props);
    this.importedTagsFormatted = [];
    this.tagsReady = false;
    this.state = {
      editTags: false
    };
  }

  componentDidUpdate() {
    const { importedTags } = this.props;
    let i: number;
    if (!this.tagsReady && importedTags.length) {
      for (i = 0; i < importedTags.length; i++) {
        this.importedTagsFormatted.push({ id: i, name: importedTags[i].title });
      }
      this.tagsReady = true;
    }
  }

  handleDeleteTag = () => {};

  handleAddTag = () => {};

  toggleEditTags = e => {
    const newState = !this.state.editTags;
    this.setState({ editTags: newState });
  };

  getTags() {
    const { classes } = this.props;
    return (
      <div className={classes.tagContainer}>
        <div className="react-tags">
          <ReactTags
            suggestions={this.importedTagsFormatted}
            handleDelete={this.handleDeleteTag}
            handleAddition={this.handleAddTag}
          />
        </div>
      </div>
    );
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <OptionGroup show={this.state.editTags} label="Edit Tags" action={this.toggleEditTags}>
          {this.getTags()}
        </OptionGroup>
      </div>
    );
  }
}

export default connect()(
  withTracker(props => {
    const tagsHandle = Meteor.subscribe("tags");
    let tags: any = [];
    tags = Tags.find().fetch();
    log.info(`PostForm Tracker`, tags);
    return { importedTags: tags };
  })(withStyles(styles, { withTheme: true })(EditTags))
);
