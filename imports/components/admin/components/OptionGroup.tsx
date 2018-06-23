import * as React from "react";
import { withStyles } from "@material-ui/core/styles";
import DropUpIcon from "@material-ui/icons/ArrowDropUp";
import DropDownIcon from "@material-ui/icons/ArrowDropDown";
import Button from "@material-ui/core/Button";

let styles: any;

interface IProps {
  classes: any;
  theme: any;
  show: boolean;
  action: any;
  label: string;
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
    width: '12rem'
  },
  optionsDetail: {
    marginTop: "0.5rem",
    padding: 0
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
  buttonLabel: {
    justifyContent: "space-between"
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
    const { classes } = this.props;

    const layout = (
      <div className={classes.root}>
        <div>
          <Button classes={{ label: classes.buttonLabel }} onClick={this.props.action} variant="contained" size="small" className={classes.toggleButton}>
            {this.props.label} {this.props.show ? <DropUpIcon className={classes.rightIcon} /> : <DropDownIcon className={classes.rightIcon} />}
          </Button>
          {this.props.show ? this.detail() : ""}
        </div>
      </div>
    );

    return layout;
  }

  detail() {
    const { classes } = this.props;
    const layout = <div className={`card card-body ${classes.optionsDetail}`}>{this.props.children}</div>;
    return layout;
  }

  render() {
    return this.layout();
  }
}

export default withStyles(styles, { withTheme: true })(OptionGroup);
