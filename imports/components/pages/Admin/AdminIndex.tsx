import * as React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { ListGroup, ListGroupItem } from "reactstrap";
import UsersIcon from "@material-ui/icons/Contacts";
import SettingsIcon from "@material-ui/icons/Settings";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Hidden from "@material-ui/core/Hidden";
import Divider from "@material-ui/core/Divider";
import MenuIcon from "@material-ui/icons/Menu";
import * as Icon from "../../../modules/icons";
//import { mailFolderListItems, otherMailFolderListItems } from './tileData';

const drawerWidth = 240;
let styles: any;

styles = theme => ({
  smallTitle: {
    fontSize: "small"
  },
  mobileDrawerContainer: {
    zIndex: "3000 !important"
  },
  adminDrawer: {
    margin: "1rem 1rem",
    fontWeight: "bold"
  },
  adminContainer: {
    width: "100%",
    maxWidth: "100%",
    top: "1.2rem",
    position: "absolute"
  },
  dashItem: {
    marginTop: "0.5rem"
  },
  drawerList: {
    listStyleType: "none"
  },
  root: {
    marginTop: "1.5rem",
    flexGrow: 1,
    height: "auto",
    zIndex: 1,
    overflow: "hidden",
    position: "relative",
    display: "flex",
    width: "100%"
  },
  appBar: {
    position: "absolute",
    marginLeft: drawerWidth,
    [theme.breakpoints.up("md")]: {
      width: `calc(100% - ${drawerWidth}px)`
    }
  },
  navIconHide: {
    [theme.breakpoints.up("md")]: {
      display: "none"
    }
  },
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth,
    [theme.breakpoints.up("md")]: {
      position: "relative"
    }
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3
  }
});

interface IProps {
  classes: any;
  theme: any;
}

interface IState {
  showUsers: boolean;
  mobileOpen: boolean;
  ShowSettings: boolean;
  panelText: string;
}

const labels = {
  users: "You are editing users",
  settings: "You are editing settings"
}

class Admin extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.handleSetState = this.handleSetState.bind(this);
    this.activatePanel = this.activatePanel.bind(this);

    this.state = {
      showUsers: false,
      ShowSettings: false,
      mobileOpen: false,
      panelText: labels.settings
    };
  }

  /*
  state = {
    mobileOpen: false
  };
  */

  handleDrawerToggle = () => {
    this.setState({ mobileOpen: !this.state.mobileOpen });
  };

  handleSetState(sVar, sVal) {
    this.setState({ [sVar]: sVal });
  }

  activatePanel(panel="") {
    this.setState({panelText: labels[panel]});
    return true;
  }

  usersLink() {
    return <Icon.UsersIcon onClick={this.handleSetState} stateName="ShowUsers" />;
  }

  settingsLink() {
    return <Icon.SettingsIcon onClick={this.handleSetState} stateName="ShowSettings" />;
  }

  render() {
    const { classes, theme } = this.props;

    const drawer = (
      <div>
        <Hidden smDown implementation="css">
          <div className={classes.adminDrawer}>Admin Dashboard</div>
        </Hidden>
        <Divider />
        <List component="nav">
          <ListItem  onClick={() => {
            this.activatePanel("settings");
          }} button>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
          <ListItem onClick={() => {
            this.activatePanel("users");
          }} button>
            <ListItemIcon>
              <UsersIcon />
            </ListItemIcon>
            <ListItemText primary="Users" />
          </ListItem>
        </List>
      </div>
    );

    return (
      <div className={classes.root}>
        <Hidden mdUp>
          <AppBar className={classes.appBar}>
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={this.handleDrawerToggle}
                className={classes.navIconHide}
              >
                <MenuIcon />
              </IconButton>
              <Typography className={classes.smallTitle} variant="title" color="inherit" noWrap>
                Admin Dashboard
              </Typography>
            </Toolbar>
          </AppBar>
        </Hidden>

        <Hidden mdUp>
          <Drawer
            className={classes.mobileDrawerContainer}
            variant="temporary"
            anchor={theme.direction === "rtl" ? "right" : "left"}
            open={this.state.mobileOpen}
            onClose={this.handleDrawerToggle}
            classes={{
              paper: classes.drawerPaper
            }}
            ModalProps={{
              keepMounted: true // Better open performance on mobile.
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            variant="permanent"
            open
            classes={{
              paper: classes.drawerPaper
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Typography noWrap>{this.state.panelText}</Typography>
        </main>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(Admin);

/*

import * as React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { withStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import List from "@material-ui/core/List";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
//import { mailFolderListItems, otherMailFolderListItems } from './tileData';

const mailFolderListItems = "boo";
const otherMailFolderListItems = "wee";

const drawerWidth = 240;

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  appFrame: {
    height: 430,
    zIndex: 1,
    overflow: "hidden",
    position: "relative",
    display: "flex",
    width: "100%"
  },
  appBar: {
    width: `calc(100% - ${drawerWidth}px)`
  },
  "appBar-left": {
    marginLeft: drawerWidth
  },
  "appBar-right": {
    marginRight: drawerWidth
  },
  drawerPaper: {
    position: "relative",
    width: drawerWidth
  },
  toolbar: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3
  }
});

interface IProps {
  classes: any;
  theme: any;
}

interface IState {
  anchor: string;
}

class Admin extends React.Component<IProps, IState> {
  state = {
    anchor: "left"
  };

  handleChange = event => {
    this.setState({
      anchor: event.target.value
    });
  };

  render() {
    const { classes } = this.props;
    const { anchor } = this.state;

    const drawer = (
      <Drawer
        variant="permanent"
        classes={{
          paper: classes.drawerPaper
        }}
        anchor={anchor}
      >
        <div className={classes.toolbar} />
        <Divider />
        <List>{mailFolderListItems}</List>
        <Divider />
        <List>{otherMailFolderListItems}</List>
      </Drawer>
    );

    let before = null;
    let after = null;

    if (anchor === "left") {
      before = drawer;
    } else {
      after = drawer;
    }

    return (
      <div className={classes.root}>
        <TextField
          id="permanent-anchor"
          select
          label="Anchor"
          value={anchor}
          onChange={this.handleChange}
          margin="normal"
        >
          <MenuItem value="left">left</MenuItem>
          <MenuItem value="right">right</MenuItem>
        </TextField>
        <div className={classes.appFrame}>
          <AppBar position="absolute" className={classNames(classes.appBar, classes[`appBar-${anchor}`])}>
            <Toolbar>
              <Typography variant="title" color="inherit" noWrap>
                Permanent drawer
              </Typography>
            </Toolbar>
          </AppBar>
          {before}
          <main className={classes.content}>
            <div className={classes.toolbar} />
            <Typography>{"You think water moves fast? You should see ice."}</Typography>
          </main>
          {after}
        </div>
      </div>
    );
  }
}



export default withStyles(styles)(Admin);

*/
