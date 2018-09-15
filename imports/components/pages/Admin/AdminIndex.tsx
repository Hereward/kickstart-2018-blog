import * as React from "react";
import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import { ListGroup, ListGroupItem } from "reactstrap";
import UsersIcon from "@material-ui/icons/Contacts";
import HomeIcon from "@material-ui/icons/Home";
import PagesIcon from "@material-ui/icons/Description";
import CommentsIcon from "@material-ui/icons/Comment";
import TagIcon from "@material-ui/icons/More";
import PowerOffIcon from "@material-ui/icons/PowerSettingsNew";
import PostsIcon from "@material-ui/icons/Pages";
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
import Posts from "../../admin/panels/Posts";
import Home from "../../admin/panels/Home";
import { Pages as PageData } from "../../../api/pages/publish";
import { Posts as PostData } from "../../../api/posts/publish";
import { Tags as TagData } from "../../../api/tags/publish";
import { Comments as CommentData } from "../../../api/comments/publish";
import MetaWrapper from "../../partials/MetaWrapper";

const drawerWidth = 240;
let styles: any;

interface IProps {
  history: PropTypes.object.isRequired;
  classes: PropTypes.object.isRequired;
  systemSettings: PropTypes.object.isRequired;
  theme: any;
  sessionReady: boolean;
  userData: any;
  userId: string;
  location: any;
}

interface IState {
  [x: number]: any;
  showUsers: boolean;
  mobileOpen: boolean;
  ShowSettings: boolean;
  currentPanel: string;
}

styles = theme => ({
  selected: {
    color: "red"
  },
  smallTitle: {
    fontSize: "small",
    textTransform: "capitalize"
  },
  mobileDrawerContainer: {
    zIndex: "3000 !important"
  },
  desktopDrawerContainer: {
    backgroundColor: "white",
    height: "100%"
  },
  adminDrawerHeading: {
    margin: "1rem 1rem 0.5rem 1.75rem",
    padding: 0,
    fontWeight: "bold",
    textTransform: "capitalize"
  },
  adminContainer: {
    width: "100%",
    maxWidth: "100%",
    top: "1.2rem",
    position: "absolute"
  },
  panelGroups: {
    maxWidth: "55rem"
  },
  dashItem: {
    marginTop: "0.5rem"
  },
  adminDrawerList: {
    //minHeight: "100vh"
  },
  root: {
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
  toolBar: {
    paddingLeft: "1rem !important",
    [theme.breakpoints.down("md")]: {
      minHeight: "50px"
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
  paperAnchorDockedLeft: {
    border: 0
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    minHeight: "100vh",
    borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
    [theme.breakpoints.down("sm")]: {
      marginTop: "3rem",
      paddingBottom: "8rem"
    }
  }
});

class AdminIndex extends React.Component<IProps, IState> {
  //currentPanel: string;
  constructor(props) {
    super(props);
    this.handleSetState = this.handleSetState.bind(this);
    this.activatePanel = this.activatePanel.bind(this);
    //this.currentPanel = "";

    const panel = this.initPanel();
    this.state = {
      showUsers: false,
      ShowSettings: false,
      mobileOpen: false,
      currentPanel: panel
    };
  }

  initPanel() {
    const { location } = this.props;
    const patternA = /\/admin$/i;
    const patternB = /\/admin\/([a-z]+)$/i;
    let matchA = patternA.exec(location.pathname);
    let matchB = patternB.exec(location.pathname);
    let panel: any;
    if (matchA) {
      panel = "home";
    } else {
      panel = matchB[1];
    }
    //log.info(`Admin.initPanel()`, `[${panel}]`, location);
    return panel;
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props;
    if (prevProps.location.pathname !== location.pathname) {
      const panel = this.initPanel();
      this.setState({ currentPanel: panel });
    }
  }

  handleDrawerToggle = () => {
    this.setState({ mobileOpen: !this.state.mobileOpen });
  };

  handleSetState(sVar, sVal) {
    this.setState({ [sVar]: sVal });
  }

  activatePanel(panel = "") {
    const dest = panel === "home" ? "/admin" : `/admin/${panel}`;
    this.setState({ mobileOpen: false });
    this.props.history.push(dest);
    return true;
  }

  usersLink() {
    return <Icon.UsersIcon onClick={this.handleSetState} stateName="ShowUsers" />;
  }

  settingsLink() {
    return <Icon.SettingsIcon onClick={this.handleSetState} stateName="ShowSettings" />;
  }

  /*
  panel() {
    return this.state.panel;
  }
  */

  homePanel() {
    return this.props.sessionReady ? <Home systemSettings={this.props.systemSettings} /> : "";
  }

  settingsPanel() {
    return this.props.sessionReady ? (
      <Settings imageUpdateMethod="image.UpdateSettingsAdmin" systemSettings={this.props.systemSettings} />
    ) : (
      ""
    );
  }

  usersPanel() {
    return this.props.sessionReady ? (
      <Users userId={this.props.userId} userData={this.props.userData} systemSettings={this.props.systemSettings} />
    ) : (
      ""
    );
  }

  pagesPanel() {
    return this.props.sessionReady ? (
      <Posts
        hasAuthor={true}
        hasMeta={true}
        hasTags={true}
        hasImage={true}
        contentType="pages"
        imageUpdateMethod="image.UpdatePageAdmin"
        postUpdateMethod="pages.update"
        postCreateMethod="page.create"
        postDeleteMethod="admin.deletePostList"
        postDeleteAllMethod="admin.deleteAllPosts"
        subscription="pages"
        PostsDataSrc={PageData}
        location={this.props.location}
        userId={this.props.userId}
        userData={this.props.userData}
      />
    ) : (
      ""
    );
  }

  postsPanel() {
    return this.props.sessionReady ? (
      <Posts
        hasAuthor={true}
        hasMeta={true}
        hasTags={true}
        hasImage={true}
        contentType="posts"
        imageUpdateMethod="image.UpdatePostAdmin"
        postUpdateMethod="posts.update"
        postCreateMethod="post.create"
        postDeleteMethod="admin.deletePostList"
        postDeleteAllMethod="admin.deleteAllPosts"
        subscription="posts"
        PostsDataSrc={PostData}
        location={this.props.location}
        userId={this.props.userId}
        userData={this.props.userData}
      />
    ) : (
      ""
    );
  }

  tagsPanel() {
    return this.props.sessionReady ? (
      <Posts
        hasImage={false}
        contentType="tags"
        postUpdateMethod="tag.update"
        postCreateMethod="tag.create"
        postDeleteMethod="admin.deletePostList"
        postDeleteAllMethod="admin.deleteAllPosts"
        subscription="tags"
        PostsDataSrc={TagData}
        location={this.props.location}
        userId={this.props.userId}
        userData={this.props.userData}
      />
    ) : (
      ""
    );
  }

  commentsPanel() {
    return this.props.sessionReady ? (
      <Posts
        hasAuthor={true}
        hasMeta={true}
        hasImage={false}
        contentType="comments"
        imageUpdateMethod="image.UpdatePostAdmin"
        postUpdateMethod="comment.updateAdmin"
        postDeleteMethod="admin.deletePostList"
        postDeleteAllMethod="admin.deleteAllPosts"
        subscription="comments"
        PostsDataSrc={CommentData}
        location={this.props.location}
        userId={this.props.userId}
        userData={this.props.userData}
      />
    ) : (
      ""
    );
  }

  renderPanel() {
    let layout: any;

    if (this.props.systemSettings) {
      //let name = this.state.panel;
      switch (this.state.currentPanel) {
        case "home":
          layout = this.homePanel();
          break;
        case "settings":
          layout = this.settingsPanel();
          break;
        case "users":
          layout = this.usersPanel();
          break;
        case "pages":
          layout = this.pagesPanel();
          break;
        case "posts":
          layout = this.postsPanel();
          break;
        case "comments":
          layout = this.commentsPanel();
          break;
        case "tags":
          layout = this.tagsPanel();
          break;
        default:
          layout = "";
      }
    }

    return layout;
  }

  getNavStyle(panel = "") {
    let selected: any;
    const { classes, theme } = this.props;
    if (panel === this.state.currentPanel) {
      selected = classes.selected;
    }

    //log.info(`Admin.getNavStyle()`, this.currentPanel, panel, selected);

    return selected;
  }

  drawerContents() {
    const { classes, theme } = this.props;
    const { currentPanel } = this.state;

    const layout = (
      <div>
        <Hidden smDown implementation="css">
          <div className={classes.adminDrawerHeading}>Admin: {currentPanel}</div>
        </Hidden>
        <Divider />
        <List className={classes.adminDrawerList} component="nav">
          <ListItem
            onClick={() => {
              this.activatePanel("home");
            }}
            button
          >
            <ListItemIcon classes={{ root: this.getNavStyle("home") }}>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText classes={{ primary: this.getNavStyle("home") }} primary="Home" />
          </ListItem>
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
            <ListItemText classes={{ primary: this.getNavStyle("users") }} primary="Users" />
          </ListItem>

          <ListItem
            onClick={() => {
              this.activatePanel("pages");
            }}
            button
          >
            <ListItemIcon classes={{ root: this.getNavStyle("pages") }}>
              <PagesIcon />
            </ListItemIcon>
            <ListItemText classes={{ primary: this.getNavStyle("pages") }} primary="Pages" />
          </ListItem>

          <ListItem
            onClick={() => {
              this.activatePanel("posts");
            }}
            button
          >
            <ListItemIcon classes={{ root: this.getNavStyle("posts") }}>
              <PostsIcon />
            </ListItemIcon>
            <ListItemText classes={{ primary: this.getNavStyle("posts") }} primary="Posts" />
          </ListItem>

          <ListItem
            onClick={() => {
              this.activatePanel("comments");
            }}
            button
          >
            <ListItemIcon classes={{ root: this.getNavStyle("comments") }}>
              <CommentsIcon />
            </ListItemIcon>
            <ListItemText classes={{ primary: this.getNavStyle("comments") }} primary="Comments" />
          </ListItem>

          <ListItem
            onClick={() => {
              this.activatePanel("tags");
            }}
            button
          >
            <ListItemIcon classes={{ root: this.getNavStyle("tags") }}>
              <TagIcon />
            </ListItemIcon>
            <ListItemText classes={{ primary: this.getNavStyle("tags") }} primary="Tags" />
          </ListItem>
          <ListItem
            onClick={() => {
              this.props.history.push("/");
            }}
            button
          >
            <ListItemIcon>
              <PowerOffIcon />
            </ListItemIcon>
            <ListItemText primary="Exit" />
          </ListItem>
        </List>
      </div>
    );

    return layout;
  }

  getMeta() {
    return <MetaWrapper settings={this.props.systemSettings} title="Admin Page" />;
  }

  render() {
    const { classes, theme } = this.props;
    const { currentPanel } = this.state;
    const panel = this.renderPanel();
    const drawerContents = this.drawerContents();

    return (
      <div className={classes.root}>
        {this.getMeta()}
        <Hidden mdUp>
          <AppBar className={classes.appBar}>
            <Toolbar className={classes.toolBar}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={this.handleDrawerToggle}
                className={classes.navIconHide}
              >
                <MenuIcon />
              </IconButton>
              <Typography className={classes.smallTitle} variant="title" color="inherit" noWrap>
                Admin: {currentPanel}
              </Typography>
            </Toolbar>
          </AppBar>
        </Hidden>

        <Hidden mdUp>
          <Drawer
            classes={{
              paper: classes.drawerPaper
            }}
            className={classes.mobileDrawerContainer}
            variant="temporary"
            anchor={theme.direction === "rtl" ? "right" : "left"}
            open={this.state.mobileOpen}
            onClose={this.handleDrawerToggle}
            ModalProps={{
              keepMounted: true // Better open performance on mobile.
            }}
          >
            {drawerContents}
          </Drawer>
        </Hidden>
        <Hidden smDown implementation="css">
          <Drawer
            classes={{
              paper: classes.drawerPaper,
              paperAnchorDockedLeft: classes.paperAnchorDockedLeft
            }}
            className={classes.desktopDrawerContainer}
            variant="permanent"
            open
          >
            {drawerContents}
          </Drawer>
        </Hidden>
        <div className={classes.content}>
          <div className={classes.panelGroups}>{panel}</div>
        </div>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(AdminIndex);
