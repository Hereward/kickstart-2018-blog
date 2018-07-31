import * as React from "react";
import { withStyles } from "@material-ui/core/styles";
import DropUpIcon from "@material-ui/icons/ArrowDropUp";
import ArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import ArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import DropDownIcon from "@material-ui/icons/ArrowDropDown";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";

let styles: any;

interface IProps {
  classes: any;
  theme: any;
  show: boolean;
  action: any;
  label: string;
  transparent?: boolean;
  tiny?: boolean;
  minimal?: boolean;
}

interface IState {}

styles = theme => ({
  root: {
    marginTop: "1rem",
    marginBottom: "1rem"
  },
  toggleButton: {
    boxShadow: "none",
    backgroundColor: "transparent",
    border: "1px solid lightgray",
    width: "12rem"
  },
  optionsDetail: {
    marginTop: "0.5rem",
    padding: 0
  },
  rightIcon: {
    marginLeft: theme.spacing.unit
  },
  buttonLabel: {
    justifyContent: "space-between",
    width: "100%"
  },
  transparent: {
    backgroundColor: "transparent",
    border: "none"
  },
  minimalButt: {
    borderColor: "rgba(0, 0, 0, 0.08)",
    width: "auto",
    paddingTop: "0.25rem",
    paddingBottom: "0.25rem",
    paddingRight: 0,
    color: "rgba(0, 0, 0, 0.8)",
    textTransform: "none"
  },
  minimalRoot: {
    marginTop: "0.3rem",
    marginBottom: "0.3rem"
  },
  minimalCard: {
    border: 0
  }
});

class OptionGroup extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);

    this.state = {};
  }

  handleClick() {}

  layout() {
    const { classes, minimal } = this.props;

    const layout = (
      <div className={minimal ? classes.minimalRoot : classes.root}>
        <div>
          {this.button()}
          {this.props.show ? this.detail() : ""}
        </div>
      </div>
    );

    return layout;
  }

  button() {
    const { classes, minimal } = this.props;
    const customStyle = minimal ? ` ${classes.minimalButt}` : "";
    return (
      <Button
        classes={{ label: classes.buttonLabel }}
        onClick={this.props.action}
        variant="contained"
        size="small"
        className={`${classes.toggleButton}${customStyle}`}
      >
        {this.props.label}{" "}
        {this.props.show ? (
          <ArrowDownIcon className={classes.rightIcon} />
        ) : (
          <ArrowRightIcon className={classes.rightIcon} />
        )}
      </Button>
    );
  }

  detail() {
    const { classes, minimal } = this.props;
    const transparent = this.props.transparent ? ` ${classes.transparent}` : "";
    const borderStyle = minimal ? ` ${classes.minimalCard}` : "";
    const layout = (
      <div className={`card card-body ${classes.optionsDetail}${transparent}${borderStyle}`}>{this.props.children}</div>
    );
    return layout;
  }

  render() {
    return this.layout();
  }
}

export default withStyles(styles, { withTheme: true })(OptionGroup);
