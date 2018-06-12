import * as React from "react";
//import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
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
import Settings from "../../admin/panels/Settings";
import Users from "../../admin/panels/Users";

const drawerWidth = 240;
let styles: any;

interface IProps {
  history: any;
  classes: any;
  theme: any;
  systemSettings: any;
}

interface IState {
  showUsers: boolean;
  mobileOpen: boolean;
  ShowSettings: boolean;
  panel: any;
}

styles = theme => ({
  selected: {
    color: "red"
  },
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
  panelGroups: {
    maxWidth: "40rem"
  },
  fuckyou: {
    color: "red"
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
    // height: '4rem',
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
    padding: theme.spacing.unit * 3,
    [theme.breakpoints.down("sm")]: {
      marginTop: "4rem",
      paddingBottom: "8rem"
    }
  }
});

class Admin extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);
    this.handleSetState = this.handleSetState.bind(this);
    this.activatePanel = this.activatePanel.bind(this);
    //this.toggleOnline = this.toggleOnline.bind(this);

    this.state = {
      showUsers: false,
      ShowSettings: false,
      mobileOpen: false,
      panel: "settings"
    };
    //log.info(`Admin CONSTRUCTOR`, this.props.history);
  }

  /*
  state = {
    mobileOpen: false
  };
  */
  /*
  toggleOnline() {
    toggleSystemOnline.call({}, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`toggleSystemOnline failed`, err);
      }
    });
  }
  */

  handleDrawerToggle = () => {
    this.setState({ mobileOpen: !this.state.mobileOpen });
  };

  handleSetState(sVar, sVal) {
    this.setState({ [sVar]: sVal });
  }

  activatePanel(panel = "") {
    this.setState({ panel: panel, mobileOpen: false });

    return true;
  }

  usersLink() {
    return <Icon.UsersIcon onClick={this.handleSetState} stateName="ShowUsers" />;
  }

  settingsLink() {
    return <Icon.SettingsIcon onClick={this.handleSetState} stateName="ShowSettings" />;
  }

  panel() {
    return this.state.panel;
  }

  settingsPanel() {
    return this.props.systemSettings ? <Settings systemSettings={this.props.systemSettings} /> : "";
  }

  usersPanel() {
    return this.props.systemSettings ? <Users systemSettings={this.props.systemSettings} /> : "";
  }

  renderPanel() {
    let layout: any;

    if (this.props.systemSettings) {
      let name = this.state.panel;
      switch (name) {
        case "settings":
          layout = this.settingsPanel();
          break;
        case "users":
          layout = this.usersPanel();
          break;
        default:
          layout = "";
      }
    }

    return layout;
  }

  getNavStyle(panel = "") {
    let out: any;
    const { classes, theme } = this.props;
    if (panel === this.state.panel) {
      out = classes.selected;
    }

    return out;
  }

  render() {
    //log.info(`ADMIN INDEX - settings`, this.props.systemSettings);
    const { classes, theme } = this.props;

    const drawer = (
      <div>
        <Hidden smDown implementation="css">
          <div className={classes.adminDrawer}>Admin Dashboard</div>
        </Hidden>
        <Divider />
        <List component="nav">
          <ListItem
            onClick={() => {
              this.activatePanel("settings");
            }}
            button
          >
            <ListItemIcon classes={{ root: this.getNavStyle("settings") }}>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText classes={{ primary: this.getNavStyle("settings") }} primary="Settings" />
          </ListItem>

          <ListItem
            onClick={() => {
              this.activatePanel("users");
            }}
            button
          >
            <ListItemIcon classes={{ root: this.getNavStyle("users") }}>
              <UsersIcon />
            </ListItemIcon>
            <ListItemText classes={{ primary: this.getNavStyle("users") }} primary="Manage Users" />
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
          <div className={classes.panelGroups}>{this.renderPanel()}</div>
        </main>
      </div>
    );
  }
}

/*
const bundle = withStyles(styles, { withTheme: true })(Admin);

export default withTracker(props => {
 
  return {
    
  };
})(bundle);
*/

export default withStyles(styles, { withTheme: true })(Admin);
//systemSettings: systemSettings
