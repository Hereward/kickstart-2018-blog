///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import { Pages } from "../../../api/pages/publish";
import { Posts } from "../../../api/posts/publish";

let styles = theme => ({
  heading: { color: "dimGray" },
  table: { maxWidth: "10rem" }
});

interface IProps {
  classes: any;
  userCount: number;
  postCount: number;
  pageCount: number;
}

interface IState {}

class Home extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  layout() {
    const { classes, userCount, pageCount, postCount } = this.props;
    const layout = (
      <div>
        <h2 className={classes.heading}>System Stats</h2>
        <table className={`table ${classes.table}`}>
          <tbody>
            <tr>
              <th scope="row">Users:</th>
              <td>{userCount}</td>
            </tr>
            <tr>
              <th scope="row">Pages:</th>
              <td>{pageCount}</td>
            </tr>
            <tr>
              <th scope="row">Posts:</th>
              <td>{postCount}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );

    return layout;
  }

  render() {
    return this.layout();
  }
}

export default connect()(
  withTracker(props => {
    const usersHandle = Meteor.subscribe("allUsers");
    const pagesHandle = Meteor.subscribe("pages");
    const postsHandle = Meteor.subscribe("posts");

    let userCount = Meteor.users.find().count();
    let postCount = Posts.find().count();
    let pageCount = Pages.find().count();

    return {
      userCount: userCount,
      postCount: postCount,
      pageCount: pageCount
    };
  })(withStyles(styles, { withTheme: true })(Home))
);
