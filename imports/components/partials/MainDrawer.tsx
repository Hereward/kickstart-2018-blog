import * as React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Link, NavLink } from "react-router-dom";
import * as classNames from "classnames";
import Drawer from "@material-ui/core/Drawer";
import SwipeableDrawer from "@material-ui/core/SwipeableDrawer";
import TermsIcon from "mdi-material-ui/BookOpen";
import BlogIcon from "mdi-material-ui/Web";
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
import * as User from "../../modules/user";
//import { mailFolderListItems, otherMailFolderListItems } from './tileData';

interface IProps {
  classes: PropTypes.object.isRequired;
  userId: string;
  loggingOut: boolean;
  sessionReady: boolean;
  logOut: PropTypes.object.isRequired;
  history: PropTypes.object.isRequired;
}

interface IState {
  open: boolean;
}

const styles: any = {
  menuItemGroup: {
    "& a": { color: "rgba(0, 0, 0, 0.70)" },
    "& .active": { color: "red" },
    paddingTop: "0px",
    paddingBottom: "0px",
    borderBottom: "1px solid rgba(0, 0, 0, 0.05)"
  },
  listItemText: {
    color: "inherit"
  },
  listItemStaticText: {
    color: "rgba(0, 0, 0, 0.70)"
  },
  listItemIcon: {
    color: "inherit"
  },
  drawerRoot: {
    zIndex: "3000 !important"
  },
  listContainer: {
    marginTop: "0.5rem",
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
  },
  listItem: {
    paddingTop: "10px",
    paddingBottom: "10px"
  },
  divider: {
    height: "1px",
    backgroundColor: "rgba(0, 0, 0, 0.09)"
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

  abortLink(e) {
    e.preventDefault();
  }

  listItemLink(link: string, label: string, icon?: any) {
    const { classes, history } = this.props;
    return (
      <ListItem className={classes.listItem} onClick={e => history.push(link)} button>
        <NavLink className="d-flex" exact onClick={this.abortLink} to={link}>
          {icon && <ListItemIcon classes={{ root: classes.listItemIcon }}>{icon}</ListItemIcon>}
          <ListItemText classes={{ primary: classes.listItemText }} primary={label} />
        </NavLink>
      </ListItem>
    );
  }

  listItemText(label: string, icon?: any) {
    const { classes } = this.props;
    return (
      <ListItem className={classes.listItem} component="div">
        <ListItemText classes={{ primary: classes.listItemText }} primary="Signing Out..." />
      </ListItem>
    );
  }

  signedOutLinks() {
    const { classes } = this.props;
    return (
      <List component="div" className={classes.menuItemGroup}>
        {this.listItemLink("/members/signin", "Sign In")}
        {this.listItemLink("/members/register", "Register")}
        {this.listItemLink("/members/forgot-password", "Forgot Password")}
      </List>
    );
  }

  signedInLinks() {
    const { classes, userId } = this.props;
    const profileLink = `/members/profile/${userId}`;
    return (
      <List component="div" className={classes.menuItemGroup}>
        {this.listItemLink(profileLink, "Profile")}
        {this.listItemLink("/members/change-password", "Change Password")}
      </List>
    );
  }

  authLinks() {
    const { classes, sessionReady, loggingOut } = this.props;
    let layout: any = "";
    if (loggingOut) {
      layout = (
        <List component="div" className={classes.menuItemGroup}>
          {this.listItemText("Signing Out...")}
        </List>
      );
    } else {
      if (sessionReady) {
        layout = this.signedInLinks();
      } else {
        layout = this.signedOutLinks();
      }
    }
    return <React.Fragment>{layout}</React.Fragment>;
  }

  logOutLink() {
    const { classes, logOut, loggingOut, userId } = this.props;
    let layout: any = "";

    if (userId && !loggingOut) {
      layout = (
        <List component="div" className={classes.menuItemGroup}>
          <ListItem className={classes.listItem} button onClick={logOut}>
            <ListItemText classes={{ primary: classes.listItemStaticText }} primary="Sign Out" />
          </ListItem>
        </List>
      );
    }

    return layout;
  }

  adminLink() {
    const { classes, logOut, loggingOut, userId } = this.props;
    let layout: any = "";

    if (User.can({ threshold: "admin" })) {
      layout = (
        <List component="div" className={classes.menuItemGroup}>
          {this.listItemLink("/admin", "Admin")}
        </List>
      );
    }
    return layout;
  }

  creatorLinks() {
    const { classes, logOut, loggingOut, userId } = this.props;
    let layout: any = "";

    if (User.can({ threshold: "creator" })) {
      layout = (
        <List component="div" className={classes.menuItemGroup}>
          {this.listItemLink("/create", "Create")}
        </List>
      );
    }
    return layout;
  }

  baseLinks() {
    const { classes } = this.props;

    return (
      <React.Fragment>
        <List component="div" className={classes.menuItemGroup}>
          {this.listItemLink("/", "Home", <HomeIcon />)}
          {this.listItemLink("/about", "About", <InfoIcon />)}
          {this.listItemLink("/terms-of-service", "Terms of Service", <TermsIcon />)}
          {this.listItemLink("/blog", "Blog", <BlogIcon />)}
        </List>
      </React.Fragment>
    );
  }

  render() {
    const { classes, userId, loggingOut } = this.props;
    const { open } = this.state;

    const menuItems = (
      <div className={classes.listContainer}>
        {this.baseLinks()}
        {this.authLinks()}
        {this.creatorLinks()}
        {this.adminLink()}
        {this.logOutLink()}
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
