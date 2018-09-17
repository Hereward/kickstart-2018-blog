///<reference path="../../../../index.d.ts"/>

import * as React from "react";
import * as PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import { Comments } from "../../../api/comments/publish";

interface IProps {
  dispatch: any;
  count: number;
  postId: string;
}

interface IState {}

class CommentCount extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const { count } = this.props;
    return <span>{count}</span>;
  }
}

export default withTracker(props => {
  const count = Comments.find({ postId: props.postId }).count();
  return { count: count };
})(CommentCount);
