///<reference path="../../../index.d.ts"/>

import * as React from "react";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import CommentForm from "../forms/CommentForm";
import OptionGroup from "../admin/components/OptionGroup";

let styles: any;
styles = theme => ({
  heading: {
    color: "rgba(0, 0, 0, 0.5)",
    marginBottom: "1rem",
    marginTop: "-0.5rem"
  }
});

interface IProps {
  classes: any;
}

interface IState {
  showCommentForm: boolean;
}

class CommentBlogSection extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      showCommentForm: false
    };
  }

  toggleCommentForm = () => {
    const vis = !this.state.showCommentForm;
    this.setState({ showCommentForm: vis });
  };

  render() {
    const { classes } = this.props;
    return (
      <div className="container">
        <hr />
        <h3 className={classes.heading}>Join the discussion</h3>
        <OptionGroup
          minimal={true}
          show={this.state.showCommentForm}
          label="Add a Comment"
          action={this.toggleCommentForm}
        >
          <CommentForm />
        </OptionGroup>
      </div>
    );
  }
}

export default connect()(
  withTracker(props => {
    return {};
  })(withStyles(styles, { withTheme: true })(CommentBlogSection))
);
