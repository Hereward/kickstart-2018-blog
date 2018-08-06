import * as React from "react";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
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
import PostForm from "../../admin/forms/PostForm";
import CommentForm from "../../admin/forms/CommentForm";
import RenderImage from "../components/RenderImage";
import Author from "../components/Author";

const drawerWidth = 240;
let styles: any;

interface IProps {
  classes: any;
  theme: any;
  contentType: string;
  SystemOnline: boolean;
  systemSettings: any;
  dispatch: any;
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
  imageIDedit: string;
  imageIDnew: string;
  allowCreate: boolean;
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
      imageIDedit: "",
      imageIDnew: "",
      allowCreate: !(props.contentType === "comments")
    };
  }

  initState = () => {
    const allowCreate = !(this.props.contentType === "comments");
    log.info(`Posts.initState - allowCreate = `, allowCreate);

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
      imageIDedit: "",
      imageIDnew: "",
      allowCreate: allowCreate
    });
    this.props.dispatch({ type: "LOAD_INIT" });
    this.props.dispatch({ type: "FILTER_INIT" });
  };

  componentDidUpdate(prevProps) {
    const { location } = this.props;
    if (prevProps.contentType !== this.props.contentType) {
      //log.info(`Posts.componentDidUpdate`, prevProps, this.props);
      this.initState();
    }
  }

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
            expanded: expanded ? panel : false,
            imageIDedit: ""
          });
          this.editingType.edit = false;
        }
      });
    } else {
      this.setState({
        expanded: expanded ? panel : false,
        imageIDedit: ""
      });
    }
  };

  handleNewPostCreated = () => {
    this.setState({
      showNewPost: false
    });
  };

  handleEditing = (state, edit) => {
    const type = edit ? "edit" : "new";
    this.editingType[type] = state;
  };

  updateImageId = (props: { image_id: string; dataObj?: any }) => {
    
    let targetName: any;
    targetName = props.dataObj ? "imageIDedit" : "imageIDnew";
    this.setState({ [targetName]: props.image_id });
    log.info(`updateImageId`, props, this.state);
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

  deleteSelected() {
    this.setState({ block: true });
    const { postDeleteMethod, contentType } = this.props;

    Meteor.call(postDeleteMethod, { contentType: contentType, selected: this.state.selectedPosts }, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        log.error(`Method [${postDeleteMethod}] failed`, err);
      } else {
        this.miniAlert("Selected posts were deleted!");
        this.setState({ block: false });
      }
    });
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
    if (!vis && this.editingType.new === true) {
      Library.confirmDialog({ title: "Discard changes?", message: "off" }).then(result => {
        if (result) {
          this.setState({
            showNewPost: vis
          });
          this.editingType.new = false;
        }
      });
    } else {
      this.setState({ showNewPost: vis });
    }
  };

  getNewPostContent() {
    const { classes } = this.props;
    return (
      <div className={classes.newPostDetail}>
        {this.renderImage()}
        {this.postForm()}
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
    const { classes, contentType } = this.props;
    const checkedC = this.checkCheckBox(dataObj);
    const checkBox = this.checkBox("default", dataObj, checkedC);
    log.info(`getPostContent`, dataObj);
    return (
      <div>
        <div className={classes.checkBoxSmallContainer}>
          <FormControlLabel control={checkBox} label="selected" />
        </div>

        {dataObj.authorId ? <Author userId={dataObj.authorId} /> : ""}

        {contentType === "comments" ? "" : this.renderImage(dataObj)}
        {contentType === "comments" ? this.commentForm(dataObj) : this.postForm(dataObj)}
      </div>
    );
  }

  renderImage(dataObj = null) {
    return (
      <RenderImage
        allowEdit={true}
        updateMethod={this.props.imageUpdateMethod}
        updateImageId={this.updateImageId}
        dataObj={dataObj}
      />
    );
  }

  truncateHTML(html) {
    const trunc = truncate(html, 15, { byWords: true });
    const stripped = striptags(trunc);
    return stripped;
  }

  commentForm(dataObj) {
    return <CommentForm postUpdateMethod={this.props.postUpdateMethod} settingsObj={dataObj} />;
  }

  postForm(dataObj = null) {
    return (
      <PostForm
        postCreateMethod={this.props.postCreateMethod}
        postUpdateMethod={this.props.postUpdateMethod}
        settingsObj={dataObj}
        imageIDedit={this.state.imageIDedit}
        imageIDnew={this.state.imageIDnew}
        edit={dataObj ? true : false}
        handleNewPostCreated={this.handleNewPostCreated}
        handleEditing={this.handleEditing}
      />
    );
  }

  renderPost(dataObj: any) {
    const { classes, contentType } = this.props;
    const { expanded } = this.state;

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

  layout() {
    const { classes } = this.props;
    const { allPosts } = this.props;
    return (
      <BlockUi tag="div" blocking={this.state.block}>
        {this.bulkOptions()}
        {this.filterOptions()}
        {this.state.allowCreate ? this.newPost() : ""}

        <div>
          <h2 className={classes.heading}>Entries</h2>
          {allPosts ? <div>{this.mapPosts(allPosts)}</div> : ""}
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
    const postsHandle = Meteor.subscribe(props.subscription);
    const options = {
      sort: { published: -1 },
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
        posts = props.PostsDataSrc.find(combinedFilters, options).fetch();
        break;

      default:
        break;
    }

    if (defaultSearch) {
      posts = props.PostsDataSrc.find({}, options).fetch();
    }
    //log.info(`Posts.tracker()`, posts);

    return {
      allPosts: posts,
      PostsDataSrc: props.PostsDataSrc
    };
  })(withStyles(styles, { withTheme: true })(Posts))
);
