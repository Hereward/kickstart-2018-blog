import * as React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Link, NavLink } from "react-router-dom";
import * as classNames from "classnames";
import Drawer from "@material-ui/core/Drawer";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import TermsIcon from 'mdi-material-ui/BookOpen';
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import HomeIcon from "@material-ui/icons/Home";
import InfoIcon from "@material-ui/icons/Info";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
//import { mailFolderListItems, otherMailFolderListItems } from './tileData';

interface IProps {
  classes: PropTypes.object.isRequired;
}

interface IState {
  open: boolean;
}

const styles: any = {
  menuItems: {
    "& a": {color: "rgba(0, 0, 0, 0.70)"},
    "& .active": {color: "red"}
  },
  menuItem: {
    color: "inherit"
  },
  drawerRoot: {
    zIndex: "3000 !important"
  },
  list: {
    width: 250
  },
  fullList: {
    width: "auto"
  },
  menuButton: {
    marginLeft: 0,
    marginRight: "0.5rem"
  },
  hide: {
    display: "none"
  }
};

class MainDrawer extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      open: false
    };
  }

  toggleDrawer = state => () => {
    this.setState({
      open: state
    });
  };

  listItem(link: string , label: string, icon: any) {
    const { classes } = this.props;
    return (
      <ListItem button>
        <NavLink className="d-flex" exact to={link}>
          <ListItemIcon classes={{ root: classes.menuItem }}>
            {icon}
          </ListItemIcon>
          <ListItemText classes={{ primary: classes.menuItem }} primary={label} />
        </NavLink>
      </ListItem>
    );
  }

  render() {
    const { classes } = this.props;
    const { open } = this.state;

    const menuItems = (
      <div className={classes.list}>
        <List className={classes.menuItems}>
          {this.listItem("/", "Home", <HomeIcon />)}
          {this.listItem("/about", "About", <InfoIcon />)}
          {this.listItem("/terms-of-service", "Terms of Service", <TermsIcon />)}
        </List>
        <Divider />
        <List>
          <ListItem button>
            <ListItemText primary="Oink" />
          </ListItem>
          <ListItem button component="a" href="#simple-list">
            <ListItemText primary="Boink" />
          </ListItem>
        </List>
      </div>
    );

    return (
      <div>
        <IconButton
          color="inherit"
          aria-label="Open drawer"
          onClick={this.toggleDrawer(true)}
          className={classNames(classes.menuButton)}
        >
          <MenuIcon />
        </IconButton>

        <Drawer className={classes.drawerRoot} open={open} onClose={this.toggleDrawer(false)}>
          <div tabIndex={0} role="button" onClick={this.toggleDrawer(false)} onKeyDown={this.toggleDrawer(false)}>
            {menuItems}
          </div>
        </Drawer>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(MainDrawer);
