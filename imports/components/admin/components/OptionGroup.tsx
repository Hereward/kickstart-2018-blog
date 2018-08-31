import * as React from "react";
import { Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import ArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import ArrowDownIcon from "@material-ui/icons/KeyboardArrowDown";
import Button from "@material-ui/core/Button";

let styles: any;

interface IProps {
  classes: any;
  theme: any;
  show: boolean;
  action: any;
  label: string;
  transparent?: boolean;
  minimal?: boolean;
  buttonType?: string;
  buttonSize: string;
}

interface IState {}

styles = theme => ({
  root: {
    marginTop: "1rem",
    marginBottom: "1rem"
  },
  link: {
    color: "black",
    fontSize: "0.9rem",
    fontweight: "bold",
    "&:hover": {
      textDecoration: "none",
      color: "red"
    }
  },
  linkLabel: {
    display: "inline-block",
    verticalAlign: "top",
    marginTop: "-2px",
    marginLeft: "1px"
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
  smallIcon: {
    height: "1rem",
    marginLeft: theme.spacing.unit
  },
  rightIcon: {
    marginLeft: theme.spacing.unit
  },
  buttonLabel: {
    justifyContent: "space-between",
    width: "100%",
    marginLeft: "10px"
  },
  transparent: {
    backgroundColor: "transparent",
    border: "none"
  },
  minimalButt: {
    borderColor: "rgba(0, 0, 0, 0.08)",
    width: "auto",
    paddingTop: "0.2rem",
    paddingBottom: "0.2rem",
    color: "rgba(0, 0, 0, 0.8)",
    textTransform: "none",
    height: "30px !important",
    minHeight: "30px !important",
    maxHeight: "30px !important"
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
    const { classes, minimal, buttonType } = this.props;

    const layout = (
      <div className={minimal ? classes.minimalRoot : classes.root}>
        <div>
          {buttonType === "link" ? this.link() : this.button()}
          {this.props.show ? this.detail() : ""}
        </div>
      </div>
    );

    return layout;
  }

  icon(style = "") {
    const { classes } = this.props;
    return this.props.show ? <ArrowDownIcon className={style} /> : <ArrowRightIcon className={style} />;
  }

  link() {
    const { classes } = this.props;
    const label = `${this.props.label} `;
    return (
      <Link className={classes.link} to="#" onClick={this.props.action}>
        <span className={classes.linkLabel}>{label}</span>
        {this.icon(classes.smallIcon)}
      </Link>
    );
  }

  button() {
    const { classes, minimal, buttonSize } = this.props;
    let customButtonStyle: any = "";
    let iconStyle: any = classes.rightIcon;
    if (minimal) {
      iconStyle = classes.smallIcon;
      customButtonStyle = ` ${classes.minimalButt}`;
    }
    const buttSize: any = this.props.buttonSize || "small";
    return (
      <Button
        classes={{ label: classes.buttonLabel }}
        onClick={this.props.action}
        variant="contained"
        size={buttSize}
        className={`${classes.toggleButton}${customButtonStyle}`}
      >
        {this.props.label} {this.icon(iconStyle)}
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
