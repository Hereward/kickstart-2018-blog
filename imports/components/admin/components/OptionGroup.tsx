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
  main: {
    marginTop: "2rem",
    marginBottom: "1rem"
  },
  toggleButton: {
    boxShadow: "none",
    backgroundColor: "transparent",
    border: "1px solid lightgray"
  },
  optionsDetail: {
    marginTop: "0.5rem",
    padding: 0
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
      <div className={classes.main}>
        <div>
          <Button onClick={this.props.action} variant="contained" className={classes.toggleButton}>
            {this.props.label} {this.props.show ? <DropUpIcon /> : <DropDownIcon />}
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
    log.info(`OptionGroup`, this.props);
    return this.layout();
  }
}

export default withStyles(styles, { withTheme: true })(OptionGroup);
