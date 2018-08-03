///<reference path="../../../index.d.ts"/>

import * as React from "react";
import PropTypes from "prop-types";
import { Card, CardImg, CardText, CardBody, CardTitle, CardSubtitle } from "reactstrap";
import Button from "@material-ui/core/Button";
import { connect } from "react-redux";
import Paper from "@material-ui/core/Paper";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import { Comments } from "../../api/comments/publish";

let styles: any;
styles = theme => ({
  comment: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
    marginTop: "1rem",
    backgroundColor: "#fdf9f4"
  },
  card: {
    marginTop: "1rem",
    backgroundColor: "#fdf9f4"
  },
  heading: {
    color: "rgba(0, 0, 0, 0.6)",
    marginTop: "1rem"
  },
  loadMore: {
    marginTop: "1rem",
    textAlign: "center"
  }
});

interface IProps {
  classes: PropTypes.object.isRequired;
  postId: string;
  comments: any;
  dispatch: any;
}

interface IState {}

class CommentList extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  UNSAFE_componentWillMount() {
    this.props.dispatch({ type: "LOAD_INIT" });
  }

  loadMore = () => {
    this.props.dispatch({ type: "LOAD_MORE" });
  };

  renderComment(comment) {
    //layout: any = "";
    return <div dangerouslySetInnerHTML={this.createMarkup(comment.body)} />;
  }

  createMarkup(html) {
    return { __html: html };
  }

  /*
      <Paper key={comment._id} className={classes.comment} elevation={1}>
          {this.renderComment(comment)}
        </Paper>
        */

  mapComments() {
    const { classes, comments } = this.props;
    const mapped = comments.map(comment => {
      //const checkedC = this.checkCheckBox(post);
      const layout = (
        <Card className={classes.card} key={comment._id}>
          <CardBody>
            <CardTitle>Card title</CardTitle>
            <CardSubtitle>Card subtitle</CardSubtitle>
            <CardText> {this.renderComment(comment)}</CardText>
            <Button>Button</Button>
          </CardBody>
        </Card>
      );
      return layout;
    });

    return mapped;
  }

  //<h3 className={classes.heading}>Responses</h3>

  render() {
    const { classes } = this.props;
    return (
      <div>
        {this.mapComments()}
        <div className={classes.loadMore}>
          <Button variant="outlined" onClick={this.loadMore} size="small">
            Load More
          </Button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    cursorLimit: state.cursorLimit
  };
};

export default connect(mapStateToProps)(
  withTracker(props => {
    const commentsHandle = Meteor.subscribe("comments");
    const options = {
      sort: { published: -1 },
      limit: props.cursorLimit
    };
    const commentsList = Comments.find({}, options).fetch();
    return {
      comments: commentsList
    };
  })(withStyles(styles, { withTheme: true })(CommentList))
);
