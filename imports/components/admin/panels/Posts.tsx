import * as React from "react";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from "@material-ui/core/TextField";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import DeleteIcon from "@material-ui/icons/Delete";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import * as BlockUi from "react-block-ui";
import { toggleLocked, deleteAllPages, deleteUserList } from "../../../api/admin/methods";
import * as Library from "../../../modules/library";
import * as UserModule from "../../../modules/user";
import OptionGroup from "../components/OptionGroup";
import PostForm from "../../admin/forms/PostForm";
import { Pages as PagesObj } from "../../../api/pages/publish";
import RenderImage from "../components/RenderImage";
import { EditorialImages } from "../../../api/images/methods";

const drawerWidth = 240;
let styles: any;

interface IProps {
  classes: any;
  theme: any;
  SystemOnline: boolean;
  systemSettings: any;
  dispatch: any;
  cursorLimit: number;
  allPosts: any;
  userData: any;
  userId: string;
}

interface IState {
  [x: number]: any;
  allowSubmit: boolean;
  updateDone: boolean;
  queryLimit: number;
  expanded: string;
  block: boolean;
  showBulkOptions: boolean;
  showFilterOptions: boolean;
  selectedUsers: any;
  showNewPost: boolean;
  image_id: string;
  image_id_edit: string;
}

styles = theme => ({
  newPostDetail: {
    margin: "1rem"
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 250
  },
  heading: { color: "dimGray" },
  loadMore: {
    marginTop: "1rem",
    textAlign: "center"
  },
  postDetails: {
    backgroundColor: "#fdf9f4",
    borderTop: "1px solid LightGray",
    paddingTop: "1rem",
    display: "block"
  },
  summaryData: {
    color: "dimGray"
  },
  summaryDataTitle: {
    maxWidth: "10rem",
    overflow: "hidden",
    display: "inline-block",
    textOverflow: "ellipsis",
    [theme.breakpoints.up("sm")]: {
      maxWidth: "15rem",
      verticalAlign: "top",
      marginLeft: "0.5rem"
    },
    [theme.breakpoints.up("md")]: {
      maxWidth: "20rem"
    }
  },
  summaryDataID: {
    display: "none",
    fontWeight: "bold",
    [theme.breakpoints.up("sm")]: {
      display: "inline"
    }
  },
  deleteAllRoot: {
    width: "100%"
  },
  optionsRoot: {
    margin: "1rem"
  },
  userListItem: {
    display: "flex"
  },
  userListExpRoot: {
    width: "100%"
  },
  expandedExpansionPanel: {
    margin: 0
  },
  messageField: {
    marginBottom: "1rem"
  },
  checkBoxLarge: {
    display: "none",
    [theme.breakpoints.up("md")]: {
      display: "inline-flex"
    }
  },
  checkBoxSmall: {
    display: "inline-flex",
    [theme.breakpoints.down("md")]: {
      display: "none"
    }
  },
  checkBoxSmallContainer: {
    display: "block",
    [theme.breakpoints.up("md")]: {
      display: "none"
    }
  }
});

class Posts extends React.Component<IProps, IState> {
  cursorBlock: number = 1;
  currentLimitVal: number = 1;
  selectedPosts = [];
  isGod: boolean = false;

  constructor(props) {
    super(props);
    this.handleExPanelChange = this.handleExPanelChange.bind(this);
    this.deleteAll = this.deleteAll.bind(this);
    this.confirmDeleteAll = this.confirmDeleteAll.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.toggleBulkOptions = this.toggleBulkOptions.bind(this);
    this.toggleFilterOptions = this.toggleFilterOptions.bind(this);
    this.changeFilter = this.changeFilter.bind(this);
    this.isGod = UserModule.can({ threshold: "god" });

    this.state = {
      allowSubmit: true,
      updateDone: false,
      queryLimit: 1,
      expanded: "",
      block: false,
      showBulkOptions: false,
      showFilterOptions: false,
      selectedUsers: {},
      showNewPost: false,
      image_id: "",
      image_id_edit: ""
    };
  }

  UNSAFE_componentWillMount() {
    this.props.dispatch({ type: "LOAD_INIT" });
    this.props.dispatch({ type: "FILTER_INIT" });
  }

  miniAlert = (message = "") => {
    this.props.dispatch({ type: "MINI_ALERT_ON", message: message });
  };

  toggleLocked = userId => event => {
    toggleLocked.call({ id: userId }, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        log.error(`toggleLocked failed`, err);
      }
    });
  };

  handleExPanelChange = panel => (event, expanded) => {
    this.setState({
      expanded: expanded ? panel : false
    });
  };

  updateImageId = (props: { image_id: string; dataObj?: any }) => {
    this.setState({ image_id_edit: props.image_id });
  };

  loadMore() {
    this.props.dispatch({ type: "LOAD_MORE" });
  }

  togglePostSelect = id => event => {
    const currentState = Object.assign({}, this.state.selectedUsers);
    const selected = currentState[id] === true;
    currentState[id] = !selected;
    this.setState({ selectedUsers: currentState });

    this.selectedPosts = Object.keys(currentState).reduce((filtered, option) => {
      if (currentState[option]) {
        filtered.push(option);
      }
      return filtered;
    }, []);

    return "";
  };

  confirmDeleteAll() {
    Library.confirmDialog().then(result => {
      if (result) {
        this.deleteAll();
      }
    });
  }

  confirmDeleteSelected = () => {
    Library.confirmDialog().then(result => {
      if (result) {
        this.deleteSelected();
      }
    });
  };

  deleteSelected() {
    this.setState({ block: true });
    deleteUserList.call({ selected: this.state.selectedUsers }, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        log.error(`deleteUserList failed`, err);
      } else {
        this.miniAlert("Selected users were deleted!");
        this.setState({ block: false });
      }
    });
  }

  deleteAll() {
    this.setState({ block: true });
    deleteAllPages.call({}, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        log.error(`deleteAllPages failed`, err);
      } else {
        this.miniAlert("All pages were deleted!");
        this.setState({ block: false });
      }
    });
  }

  toggleFilterOptions() {
    const vis = !this.state.showFilterOptions;
    this.setState({ showFilterOptions: vis });
  }

  bulkOptionsDetail() {
    const { classes } = this.props;
    const layout = (
      <div className={classes.deleteAllRoot}>
        <List component="nav">
          <ListItem onClick={this.confirmDeleteAll} button>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText primary="Delete ALL posts" />
          </ListItem>

          <ListItem onClick={this.confirmDeleteSelected} button>
            <ListItemIcon>
              <DeleteIcon />
            </ListItemIcon>
            <ListItemText primary="Delete SELECTED" />
          </ListItem>
        </List>
      </div>
    );

    return layout;
  }

  toggleBulkOptions() {
    const vis = !this.state.showBulkOptions;
    this.setState({ showBulkOptions: vis });
  }

  bulkOptions() {
    const layout = (
      <OptionGroup show={this.state.showBulkOptions} label="Bulk Operations" action={this.toggleBulkOptions}>
        {this.bulkOptionsDetail()}
      </OptionGroup>
    );

    return layout;
  }

  toggleNewPost = () => {
    const vis = !this.state.showNewPost;
    this.setState({ showNewPost: vis });
  };

  getNewPostContent() {
    const { classes } = this.props;
    return (
      <div className={classes.newPostDetail}>
        <RenderImage updateImageId={this.updateImageId} dataObj={null} />
        <PostForm image_id_edit={this.state.image_id_edit} settingsObj={null} edit={false} />
      </div>
    );
  }

  newPost() {
    const { classes } = this.props;
    const { showNewPost } = this.state;
    const layout = (
      <OptionGroup show={showNewPost} label="Create" action={this.toggleNewPost}>
        {showNewPost ? this.getNewPostContent() : ""}
      </OptionGroup>
    );

    return layout;
  }

  changeFilter = name => event => {
    let filters: any = {};
    filters[name] = event.target.value;
    this.props.dispatch({ type: "FILTER_POSTS", filters: filters });
  };

  filterOptionsDetail() {
    const { classes } = this.props;
    const layout = (
      <div className={classes.optionsRoot}>
        <TextField
          id="title"
          InputLabelProps={{
            shrink: true
          }}
          placeholder="title"
          fullWidth
          margin="normal"
          onChange={this.changeFilter("title")}
        />
      </div>
    );

    return layout;
  }

  filterOptions() {
    const layout = (
      <OptionGroup show={this.state.showFilterOptions} label="Filters" action={this.toggleFilterOptions}>
        {this.filterOptionsDetail()}
      </OptionGroup>
    );

    return layout;
  }

  getPostContent(dataObj) {
    const { classes } = this.props;
    const checkedC = this.checkCheckBox(dataObj);
    const checkBox = this.checkBox("default", dataObj, checkedC);
    return (
      <div>
        <div className={classes.checkBoxSmallContainer}>
          <FormControlLabel control={checkBox} label="selected" />
        </div>

        <RenderImage updateImageId={this.updateImageId} dataObj={dataObj} />
        <PostForm image_id_edit={this.state.image_id_edit} settingsObj={dataObj} edit={true} />
      </div>
    );
  }

  renderPost(dataObj: any) {
    const { classes } = this.props;
    const { expanded } = this.state;

    return (
      <ExpansionPanel
        classes={{
          expanded: classes.expandedExpansionPanel
        }}
        className={classes.userListExpRoot}
        expanded={expanded === dataObj._id}
        onChange={this.handleExPanelChange(dataObj._id)}
      >
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <div className={classes.summaryData}>
            <span className={classes.summaryDataTitle}>{dataObj.title}</span>
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.postDetails}>
          {expanded ? this.getPostContent(dataObj) : ""}
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }

  checkBox(type, postObj, checked) {
    const { classes } = this.props;
    let cssClass: string;

    switch (type) {
      case "small":
        cssClass = classes.checkBoxSmall;
        break;
      case "large":
        cssClass = classes.checkBoxLarge;
        break;
      case "default":
        cssClass = "";
        break;
      default:
        cssClass = "";
    }

    return <Checkbox className={cssClass} onChange={this.togglePostSelect(postObj._id)} checked={checked} />;
  }

  checkCheckBox(user) {
    const checked = this.state.selectedUsers[user._id] === true;
    return checked;
  }

  mapPosts(postsArray) {
    const { classes } = this.props;

    const mapped = postsArray.map(post => {
      const checkedC = this.checkCheckBox(post);
      const layout = (
        <div className={classes.userListItem} key={post._id}>
          {this.checkBox("large", post, checkedC)}
          {this.renderPost(post)}
        </div>
      );
      return layout;
    });

    return mapped;
  }

  layout() {
    const { classes } = this.props;
    return (
      <BlockUi tag="div" blocking={this.state.block}>
        {this.bulkOptions()}
        {this.filterOptions()}
        {this.newPost()}

        <div>
          <h2 className={classes.heading}>Entries</h2>
          {this.props.allPosts ? <div>{this.mapPosts(this.props.allPosts)}</div> : ""}

          <div className={classes.loadMore}>
            <Button variant="outlined" onClick={this.loadMore} size="small">
              Load More
            </Button>
          </div>
        </div>
      </BlockUi>
    );
  }

  render() {
    return this.layout();
  }
}

const mapStateToProps = state => {
  return {
    cursorLimit: state.cursorLimit,
    filters: state.filters
  };
};

export default connect(mapStateToProps)(
  withTracker(props => {
    let myImages: any;
    const imagesHandle = Meteor.subscribe("editorialImages");
    const pagesHandle = Meteor.subscribe("pages");
    const options = {
      sort: { createdAt: -1 },
      limit: props.cursorLimit
    };
    let filters = props.filters;
    const titleString = props.filters.title;
    let titleFilter: any;
    let combinedFilters: any;
    let filterCount: number = 0;
    let defaultSearch: boolean = true;

    if (titleString) {
      filterCount += 1;
      let regex = new RegExp(`^${titleString}.*`);
      titleFilter = { title: regex };
      combinedFilters = titleFilter;
    }

    let posts: any;
    switch (filterCount) {
      case 1:
        defaultSearch = false;
        posts = PagesObj.find(combinedFilters, options).fetch();
        break;

      default:
        break;
    }

    if (defaultSearch) {
      posts = PagesObj.find({}, options).fetch();
    }

    return {
      allPosts: posts
    };
  })(withStyles(styles, { withTheme: true })(Posts))
);
