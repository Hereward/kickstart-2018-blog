///<reference path="../../../index.d.ts"/>
import * as React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
//import { Posts } from "../../api/posts/publish";
import { Tags } from "../../api/tags/publish";
import { clearSessionAuthMethod } from "../../api/sessions/methods";
import Spinner from "./Spinner";

let styles: any;
styles = theme => ({
  tagItem: {
    marginLeft: "1rem",
    fontWeight: "500"
  },
  tagBlock: {

  }
});

interface IProps {
  classes: PropTypes.object.isRequired;
  tags: PropTypes.object.isRequired;
  urlTag: string;
}

interface IState {}

class RightColumn extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
  }

  layout() {
    const { classes, tags } = this.props;
    return (
      <div>
        <h2 className="feature-heading">Tag Search</h2>
        { tags.length ? <div className={classes.tagBlock}>{this.renderTags()}</div> : <Spinner />}
      </div>
    );
  }

  renderTags() {
    const { classes, tags, urlTag } = this.props;
    const mapped = tags.map(tag => {
      const layout = (
        <div className={classes.tagItem} key={`tagList_${tag._id}`}>
          <Link to={`/blog/tag/${tag.title}`}>{urlTag === tag.title && "\u2713 "}{tag.title}</Link>
        </div>
      );
      return layout;
    });

    return mapped;
  }

  render() {
    return this.layout();
  }
}

export default connect()(
  withTracker(props => {
    log.info(`RightColumn.tracker()`, props);
    const tagsHandle = Meteor.subscribe("tags");
    const urlTag = props.match.params.tag;
    const options = {
      sort: { title: 1 }
    };
    let totalTags = 0;
    let tags: string[] = [];
    if (tagsHandle.ready()) {
      tags = Tags.find({}, options).fetch();
      totalTags = Tags.find().count();
    }
    //log.info(`RightColumn.tracker() totalTags =[${totalTags}] urlTag=[${urlTag}]`, tags);
    return { tags: tags, totalTags: totalTags, urlTag: urlTag };
  })(withStyles(styles, { withTheme: true })(RightColumn))
);
