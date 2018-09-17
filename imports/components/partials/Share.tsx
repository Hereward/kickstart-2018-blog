//<reference path="../../../../index.d.ts"/>

import * as React from "react";
import { Meteor } from "meteor/meteor";
import * as PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import {
  FacebookShareButton,
  FacebookIcon,
  FacebookShareCount,
  TwitterShareButton,
  TwitterIcon,
  TelegramShareButton,
  TelegramIcon,
  EmailShareButton,
  EmailIcon,
  LinkedinShareButton,
  LinkedinIcon
} from "react-share";

let styles: any;
styles = theme => ({
  shareContainer: {
    margin: "1rem 0"
  },
  shareItemContainer: {
    verticalAlign: "top",
    display: "inline-block",
    marginRight: "1rem",
    textAlign: "center"
  },
  shareCount: {
    marginTop: "3px",
    fontSize: "0.9rem"
  },
  shareButton: {
    cursor: "pointer"
  }
});

interface IProps {
  classes: PropTypes.object.isRequired;
  title: string;
  quote: string;
  url?: string;
}

interface IState {}

class Share extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
  }

  layout() {
    const { classes, quote, title } = this.props;
    const url = this.props.url || window.location.href;
    return (
      <div className={classes.shareContainer}>
        <div className={classes.shareItemContainer}>
          <FacebookShareButton url={url} quote={quote} className={classes.shareButton}>
            <FacebookIcon size={32} round />
          </FacebookShareButton>
        </div>
        <div className={classes.shareItemContainer}>
          <TwitterShareButton url={url} title={title} className={classes.shareButton}>
            <TwitterIcon size={32} round />
          </TwitterShareButton>
        </div>
        <div className={classes.shareItemContainer}>
          <TelegramShareButton url={url} title={title} className={classes.shareButton}>
            <TelegramIcon size={32} round />
          </TelegramShareButton>
        </div>
        <div className={classes.shareItemContainer}>
          <EmailShareButton url={url} subject={title} body={`${url}\n\n ${quote}`} className={classes.shareButton}>
            <EmailIcon size={32} round />
          </EmailShareButton>
        </div>
        <div className={classes.shareItemContainer}>
          <LinkedinShareButton
            url={url}
            title={title}
            windowWidth={750}
            windowHeight={600}
            className={classes.shareButton}
          >
            <LinkedinIcon size={32} round />
          </LinkedinShareButton>
        </div>
      </div>
    );
  }

  render() {
    return this.layout();
  }
}

export default withStyles(styles, { withTheme: true })(Share);
