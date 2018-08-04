///<reference path="../../../index.d.ts"/>

import * as React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import * as dateFormat from "dateformat";
import { Card, CardImg, CardText, CardBody, CardTitle, CardSubtitle } from "reactstrap";
import Button from "@material-ui/core/Button";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import OptionGroup from "../admin/components/OptionGroup";
import { Profiles } from "../../api/profiles/publish";

let styles: any;
styles = theme => ({
  card: {
    marginTop: "1rem",
    backgroundColor: "#fdf9f4"
  }
});

interface IProps {
  comment: PropTypes.object.isRequired;
  classes: PropTypes.object.isRequired;
  commenterProfile: PropTypes.object.isRequired;
  profilePublic: PropTypes.object.isRequired;
  dispatch: any;
}

interface IState {}

class CommentList extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  renderComment(comment) {
    //layout: any = "";
    return <div dangerouslySetInnerHTML={this.createMarkup(comment.body)} />;
  }

  createMarkup(html) {
    return { __html: html };
  }

  // <CardTitle>Card title</CardTitle>
  // <Button>Button</Button>

  layout() {
    const { classes, comment, commenterProfile } = this.props;
    const layout = (
      <Card className={classes.card}>
        <CardBody>
          <CardSubtitle>
            {commenterProfile.screenName} | {dateFormat(comment.published, "dd mmmm yyyy, h:MM:ss")}
          </CardSubtitle>
          <div className="card-text">{this.renderComment(comment)}</div>
        </CardBody>
      </Card>
    );
    return layout;
  }

  render() {
    return this.props.commenterProfile ? this.layout() : "";
  }
}

export default connect()(
  withTracker(props => {
    //const profilesHandle = Meteor.subscribe("profiles-public");
    const profile = Profiles.findOne({ owner: props.comment.authorId });
    log.info(`Comment Tracker`, props.comment.authorId, profile);
    return {
      commenterProfile: profile
    };
  })(withStyles(styles, { withTheme: true })(CommentList))
);
