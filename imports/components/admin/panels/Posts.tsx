import * as React from "react";
import { Meteor } from "meteor/meteor";
//import { Roles } from "meteor/alanning:roles";
import * as deepEqual from "deep-equal";
import PropTypes from "prop-types";
//import { Accounts } from "meteor/accounts-base";
import * as striptags from "striptags";
import * as truncate from "truncate-html";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from "@material-ui/core/TextField";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
//import Icon from "@material-ui/core/Icon";
import AddIcon from "@material-ui/icons/Add";
import BlockIcon from "@material-ui/icons/Block";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import DeleteIcon from "@material-ui/icons/Delete";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import * as BlockUi from "react-block-ui";
import * as Library from "../../../modules/library";
import * as UserModule from "../../../modules/user";
import OptionGroup from "../components/OptionGroup";
import PostForm from "../forms/PostForm";
import CommentForm from "../forms/CommentForm";
import TagForm from "../forms/TagForm";
//import RenderImage from "../components/RenderImage";
import Author from "../components/Author";
import MetaInfo from "../components/MetaInfo";
import { publishPostList } from "../../../api/admin/methods";

//const drawerWidth = 240;
let styles: any;

interface IProps {
  classes: any;
  theme: any;
  contentType: string;
  SystemOnline: boolean;
  systemSettings: PropTypes.object.isRequired;
  dispatch: PropTypes.object.isRequired;
  allPosts: any;
  userData: any;
  userId: string;
  location: any;
  imageUpdateMethod?: string;
  postUpdateMethod: string;
  postCreateMethod?: string;
  postDeleteMethod: string;
  postDeleteAllMethod: string;
  PostsDataSrc: any;
  subscription: string;
  totalPosts: number;
  cursorLimit: number;
  totalFilteredPosts: number;
  filterOn: boolean;
  hasImage: boolean;
  hasTags?: boolean;
  hasMeta?: boolean;
  hasAuthor?: boolean;
  combinedFilters: any;
  filters: PropTypes.object.isRequired;
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
  selectedPosts: any;
  showNewPost: boolean;
  allowCreate: boolean;
}

styles = theme => ({
  fontIcon: {
    verticalAlign: "bottom"
  },
  newPostDetail: {
    margin: "1rem"
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 250
  },
  heading: {
    color: "dimGray",
    marginBottom: "0.5rem"
  },
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
    maxWidth: "13rem",
    overflow: "hidden",
    display: "inline-block",
    textOverflow: "ellipsis",
    [theme.breakpoints.up("sm")]: {
      maxWidth: "17rem",
      verticalAlign: "top",
      marginLeft: "0.5rem"
    },
    [theme.breakpoints.up("md")]: {
      maxWidth: "22rem"
    },
    [theme.breakpoints.up("lg")]: {
      maxWidth: "42rem"
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
  postListItem: {
    display: "flex"
  },
  postListExpRoot: {
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
  },
  totals: {
    fontSize: "0.9rem",
    marginBottom: "1rem"
  }
});

class Posts extends React.Component<IProps, IState> {
  cursorBlock: number = 1;
  currentLimitVal: number = 1;
  selectedPosts = [];
  isGod: boolean = false;
  editingType = { edit: false, new: false };

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
      selectedPosts: {},
      showNewPost: false,
      allowCreate: !(props.contentType === "comments")
    };
  }

  initState = () => {
    const allowCreate = !(this.props.contentType === "comments");
    //log.info(`Posts.initState - allowCreate = `, allowCreate);

    this.setState({
      allowSubmit: true,
      updateDone: false,
      queryLimit: 1,
      expanded: "",
      block: false,
      showBulkOptions: false,
      showFilterOptions: false,
      selectedPosts: {},
      showNewPost: false,
      allowCreate: allowCreate
    });
    this.props.dispatch({ type: "LOAD_INIT" });
    this.props.dispatch({ type: "FILTER_INIT" });
  };

  componentDidUpdate(prevProps) {
    const { location, combinedFilters, filters } = this.props;
    if (prevProps.contentType !== this.props.contentType) {
      this.initState();
    } else if (!deepEqual(prevProps.filters, filters)) {
      log.info(`Posts.componentDidUpdate | filtersChanged`, prevProps.filters, filters);
      this.props.dispatch({ type: "LOAD_INIT" });
    }
  }

  // !deepEqual(prevProps.filters, filters)

  UNSAFE_componentWillMount() {
    this.props.dispatch({ type: "LOAD_INIT" });
    this.props.dispatch({ type: "FILTER_INIT" });
  }

  miniAlert = (message = "") => {
    this.props.dispatch({ type: "MINI_ALERT_ON", message: message });
  };

  handleExPanelChange = panel => (event, expanded) => {
    if (this.editingType.edit === true) {
      Library.confirmDialog({ title: "Discard changes?", message: "off" }).then(result => {
        if (result) {
          this.setState({
            expanded: expanded ? panel : false
          });
          this.editingType.edit = false;
        }
      });
    } else {
      this.setState({
        expanded: expanded ? panel : false
      });
    }
  };

  handleNewPostUpdated = () => {
    this.setState({
      showNewPost: false
    });
  };

  handleEditing = (state, edit) => {
    const type = edit ? "edit" : "new";
    this.editingType[type] = state;
  };


  loadMore() {
    this.props.dispatch({ type: "LOAD_MORE" });
  }

  togglePostSelect = id => event => {
    const currentState = Object.assign({}, this.state.selectedPosts);
    const selected = currentState[id] === true;
    currentState[id] = !selected;
    this.setState({ selectedPosts: currentState });

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

  confirmPublishSelected = () => {
    Library.confirmDialog().then(result => {
      if (result) {
        this.publishSelected(true);
      }
    });
  };

  confirmUnpublishSelected = () => {
    Library.confirmDialog().then(result => {
      if (result) {
        this.publishSelected(false);
      }
    });
  };

  publishSelected = publish => {
    const { contentType } = this.props;
    this.setState({ block: true });
    //publishPostList.call()
    publishPostList.call({ publish: publish, contentType: contentType, selected: this.state.selectedPosts }, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        log.error(`Method [publishPostList] failed`, err);
      } else {
        this.miniAlert("Publish status of selected posts changed!");
        this.setState({ block: false });
      }
    });
  };

  deleteSelected() {
    this.setState({ block: true });
    const { postDeleteMethod, contentType } = this.props;
    const deleteComments = contentType === "posts";

    Meteor.call(
      postDeleteMethod,
      { contentType: contentType, selected: this.state.selectedPosts, deleteComments: deleteComments },
      err => {
        if (err) {
          Library.modalErrorAlert(err.reason);
          log.error(`Method [${postDeleteMethod}] failed`, err);
        } else {
          this.miniAlert("Selected posts were deleted!");
          this.setState({ block: false });
        }
      }
    );
  }

  deleteAll() {
    const { postDeleteAllMethod, contentType } = this.props;
    this.setState({ block: true });
    Meteor.call(postDeleteAllMethod, { contentType: contentType }, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        log.error(`Method [${postDeleteAllMethod}] failed`, err);
      } else {
        this.miniAlert("All posts were deleted!");
        this.setState({ block: false });
      }
    });
  }

  toggleFilterOptions() {
    const vis = !this.state.showFilterOptions;
    this.setState({ showFilterOptions: vis });
    this.props.dispatch({ type: "FILTER_INIT" });
    this.props.dispatch({ type: "LOAD_INIT" });
  }

  bulkOptionsDetail() {
    const { classes } = this.props;
    const layout = (
      <div className={classes.deleteAllRoot}>
        <List component="nav">
          <ListItem onClick={this.confirmDeleteAll} button>
            <ListItemIcon>
              <DeleteIcon className="svg-text-icon" />
            </ListItemIcon>
            <ListItemText primary="Delete ALL posts" />
          </ListItem>

          <ListItem onClick={this.confirmDeleteSelected} button>
            <ListItemIcon>
              <DeleteIcon className="svg-text-icon" />
            </ListItemIcon>
            <ListItemText primary="Delete SELECTED" />
          </ListItem>

          <ListItem onClick={this.confirmPublishSelected} button>
            <ListItemIcon>
              <AddIcon className="svg-text-icon" />
            </ListItemIcon>
            <ListItemText primary="Publish SELECTED" />
          </ListItem>

          <ListItem onClick={this.confirmUnpublishSelected} button>
            <ListItemIcon>
              <BlockIcon className="svg-text-icon" />
            </ListItemIcon>
            <ListItemText primary="Unpublish SELECTED" />
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
    const newState = !this.state.showNewPost;
    if (!newState && this.editingType.new === true) {
      Library.confirmDialog({ title: "Discard changes?", message: "off" }).then(result => {
        if (result) {
          this.setState({
            showNewPost: newState
          });
          this.editingType.new = false;
        }
      });
    } else {
      this.setState({ showNewPost: newState });
    }
  };

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
    const { classes, contentType } = this.props;
    const layout = (
      <div className={classes.optionsRoot}>
        {contentType === "comments" ? (
          <TextField
            id="body"
            InputLabelProps={{
              shrink: true
            }}
            placeholder="Comment Text"
            fullWidth
            margin="normal"
            onChange={this.changeFilter("body")}
          />
        ) : (
          <TextField
            id="title"
            InputLabelProps={{
              shrink: true
            }}
            placeholder="Title"
            fullWidth
            margin="normal"
            onChange={this.changeFilter("title")}
          />
        )}

        <TextField
          id="userId"
          InputLabelProps={{
            shrink: true
          }}
          placeholder="User ID"
          fullWidth
          margin="normal"
          onChange={this.changeFilter("userId")}
        />
        <TextField
          id="email"
          InputLabelProps={{
            shrink: true
          }}
          placeholder="Email"
          fullWidth
          margin="normal"
          onChange={this.changeFilter("email")}
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

  getNewPostContent() {
    const { classes, hasImage, hasTags } = this.props;
    return <div className={classes.newPostDetail}>{this.renderForm()}</div>;
  }

  getPostContent(dataObj) {
    const { classes, contentType, hasImage, hasTags, hasMeta, hasAuthor } = this.props;
    const checkedC = this.checkCheckBox(dataObj);
    const checkBox = this.checkBox("default", dataObj, checkedC);
    //log.info(`getPostContent`, dataObj);
    return (
      <div>
        <div className={classes.checkBoxSmallContainer}>
          <FormControlLabel control={checkBox} label="selected" />
        </div>

        {hasAuthor ? <Author userId={dataObj.authorId} /> : ""}
        {hasMeta && <MetaInfo data={dataObj} />}

        {this.renderForm(dataObj)}
      </div>
    );
  }

  renderForm(dataObj: any = "") {
    const { contentType } = this.props;
    let layout: any = "";
    switch (contentType) {
      case "comments":
        layout = this.commentForm(dataObj);
        break;
      case "posts":
        layout = this.postForm(dataObj);
        break;
      case "pages":
        layout = this.postForm(dataObj);
        break;
      case "tags":
        layout = this.tagForm(dataObj);
        break;

      default:
        layout = "";
    }
    return layout;
  }

  truncateHTML(html) {
    const trunc = truncate(html, 15, { byWords: true });
    const stripped = striptags(trunc);
    return stripped;
  }

  commentForm(dataObj) {
    return <CommentForm postUpdateMethod={this.props.postUpdateMethod} settingsObj={dataObj} />;
  }

  tagForm(dataObj) {
    return (
      <TagForm
        postCreateMethod={this.props.postCreateMethod}
        postUpdateMethod={this.props.postUpdateMethod}
        settingsObj={dataObj}
        editingExistingData={dataObj ? true : false}
        handleNewPostCreated={this.handleNewPostUpdated}
        handlePostUpdated={this.handleNewPostUpdated}
        handleEditing={this.handleEditing}
        editMode="admin"
      />
    );
  }

  postForm(dataObj = null) {
    const { hasTags, postCreateMethod, postUpdateMethod, imageUpdateMethod, hasImage, contentType } = this.props;
    return (
      <PostForm
        imageUpdateMethod={imageUpdateMethod}
        hasImage={hasImage}
        postCreateMethod={postCreateMethod}
        postUpdateMethod={postUpdateMethod}
        settingsObj={dataObj}
        hasTags={hasTags}
        editingExistingData={dataObj ? true : false}
        handleNewPostCreated={this.handleNewPostUpdated}
        handlePostUpdated={this.handleNewPostUpdated}
        handleEditing={this.handleEditing}
        editMode="admin"
        contentType={contentType}
      />
    );
  }

  renderPost(dataObj: any) {
    const { classes, contentType } = this.props;
    const { expanded } = this.state;
    //log.info(`Posts.renderPost`, dataObj);
    const unpub =
      dataObj.publish === false ? (
        <span>
          <BlockIcon className="svg-text-icon" />{" "}
        </span>
      ) : (
        ""
      );

    return (
      <ExpansionPanel
        classes={{
          expanded: classes.expandedExpansionPanel
        }}
        className={classes.postListExpRoot}
        expanded={expanded === dataObj._id}
        onChange={this.handleExPanelChange(dataObj._id)}
      >
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <div className={classes.summaryData}>
            <span className={classes.summaryDataTitle}>
              {unpub}
              {contentType === "comments" ? this.truncateHTML(dataObj.body) : dataObj.title}
            </span>
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.postDetails}>
          {expanded === dataObj._id ? this.getPostContent(dataObj) : ""}
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

  checkCheckBox(post) {
    const checked = this.state.selectedPosts[post._id] === true;
    return checked;
  }

  mapPosts(posts) {
    const { classes } = this.props;
    const mapped = posts.map(post => {
      const checkedC = this.checkCheckBox(post);
      const layout = (
        <div className={classes.postListItem} key={post._id}>
          {this.checkBox("large", post, checkedC)}
          {this.renderPost(post)}
        </div>
      );
      return layout;
    });

    return mapped;
  }

  loadMoreButton() {
    const { classes } = this.props;
    return (
      <div className={classes.loadMore}>
        <Button variant="outlined" onClick={this.loadMore} size="small">
          Load More
        </Button>
      </div>
    );
  }

  layout() {
    const { classes, allPosts, totalPosts, cursorLimit, totalFilteredPosts, filterOn } = this.props;
    //log.info(`Posts.layout()`, allPosts, totalPosts, cursorLimit);

    const total = filterOn ? totalFilteredPosts : totalPosts;
    const viewing = total ? cursorLimit : 0;
    return (
      <BlockUi tag="div" blocking={this.state.block}>
        {this.bulkOptions()}
        {this.filterOptions()}
        {this.state.allowCreate ? this.newPost() : ""}

        <div>
          <h2 className={classes.heading}>Entries</h2>
          <div className={classes.totals}>
            (total: {total} viewing: {viewing})
          </div>
          {allPosts ? <div>{this.mapPosts(allPosts)}</div> : ""}
          {total > cursorLimit ? this.loadMoreButton() : ""}
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
    const postsHandle = Meteor.subscribe(props.subscription);
    const usersHandle = Meteor.subscribe("allUsers");
    const options = {
      sort: { created: -1 },
      limit: props.cursorLimit
    };
    let totalPosts = 0;
    let totalFilteredPosts = 0;
    let filters = props.filters;
    const titleString = props.filters.title;
    const bodyString = props.filters.body;
    const idString = props.filters.userId;
    const emailString = props.filters.email;
    let filter: boolean = false;
    let titleFilter: any;
    let bodyFilter: any;
    let idFilter: any;
    let emailFilter: any;
    let combinedFilters: any = [];
    let filterCount: number = 0;
    let user: any;
    let posts: any = [];

    totalPosts = props.PostsDataSrc.find().count();

    if (titleString) {
      filterCount += 1;
      let regex = new RegExp(`^${titleString}.*`, "i");
      titleFilter = { title: regex };
      combinedFilters.push(titleFilter);
    }

    if (bodyString) {
      filterCount += 1;
      let regex = new RegExp(`${bodyString}.*`, "i");
      bodyFilter = { body: regex };
      combinedFilters.push(bodyFilter);
    }

    if (idString) {
      filterCount += 1;
      let regex = new RegExp(`^${idString}.*`);
      idFilter = { authorId: regex };
      combinedFilters.push(idFilter);
    }

    if (emailString) {
      let regex = new RegExp(`^${emailString}.*`, "i");
      user = Meteor.users.findOne({ "emails.0.address": regex });

      if (user) {
        //log.info(`Posts.tracker() USER`, user);
        filterCount += 1;
        emailFilter = { authorId: user._id };
        combinedFilters.push(emailFilter);
      }
    }

    if (filterCount > 0 || emailString) {
      filter = true;
    }

    if (filter) {
      //log.info(`Posts.tracker() FILTER ON`, emailString, combinedFilters);
      if (combinedFilters.length) {
        posts = props.PostsDataSrc.find({ $or: combinedFilters }, options).fetch();
        totalFilteredPosts = props.PostsDataSrc.find({ $or: combinedFilters }).count();
        //log.info(`Posts.tracker() totalFilteredPosts`, totalFilteredPosts, posts);
      }
    } else {
      //log.info(`Posts.tracker() NON FILTER SEARCH`);
      posts = props.PostsDataSrc.find({}, options).fetch();
    }

    return {
      allPosts: posts,
      PostsDataSrc: props.PostsDataSrc,
      totalPosts: totalPosts,
      totalFilteredPosts: totalFilteredPosts,
      filterOn: filter,
      combinedFilters: combinedFilters
    };
  })(withStyles(styles, { withTheme: true })(Posts))
);
