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
import { toggleLocked, deleteAllUsers, deleteUserList, sendInvitation } from "../../../api/admin/methods";
import * as Library from "../../../modules/library";
import * as UserModule from "../../../modules/user";
import User from "./User";
import OptionGroup from "../components/OptionGroup";
import PageForm from "../../admin/forms/PageForm";
import { Pages as PagesObj } from "../../../api/pages/publish";
import Image from "../../partials/Image";
import { ToggleEditIcon } from "../../../modules/icons";
import UploadForm from "../../forms/UploadForm";
import { EditorialImages } from "../../../api/images/methods";
import RenderImage from "../components/RenderImage";
import * as PageMethods from "../../../api/pages/methods";

const drawerWidth = 240;
let styles: any;

interface IProps {
  classes: any;
  theme: any;
  SystemOnline: boolean;
  systemSettings: any;
  dispatch: any;
  cursorLimit: number;
  allPages: any;
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
  metaDescription: string;
  metaImage: string;
  name: string;
  slug: string;
  title: string;
  body: string;
  showNewPage: boolean;
  editImage: boolean;
}

styles = theme => ({
  newPageDetail: {
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
  pageDetails: {
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

class Pages extends React.Component<IProps, IState> {
  cursorBlock: number = 1;
  currentLimitVal: number = 1;
  selectedPages = [];
  isGod: boolean = false;
  //fieldsArray = ["body", "title", "metaDescription", "name", "slug"];

  constructor(props) {
    super(props);
    this.handleExPanelChange = this.handleExPanelChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.deleteAll = this.deleteAll.bind(this);
    this.confirmDeleteAll = this.confirmDeleteAll.bind(this);
    this.loadMore = this.loadMore.bind(this);
    this.toggleBulkOptions = this.toggleBulkOptions.bind(this);
    this.toggleFilterOptions = this.toggleFilterOptions.bind(this);
    this.toggleNewPage = this.toggleNewPage.bind(this);
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
      metaDescription: "",
      metaImage: "",
      name: "",
      slug: "",
      title: "",
      body: "",
      showNewPage: false,
      editImage: false
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

  toggleImageEdit = e => {
    const newState = !this.state.editImage;
    log.info(`toggleImageEdit`, e, newState);
    this.setState({ editImage: newState });
  };

  handleChange = e => {
    let target = e.target;
    let value = target.type === "checkbox" ? target.checked : target.value;
    let id = target.id;
    this.setState({ [id]: value, updateDone: false });
    log.info(`Pages handleChange`, id, value, this.state);
  };

  handleSubmit() {
    let pageFields = {
      body: this.state.body,
      title: this.state.title,
      metaDescription: this.state.metaDescription,
      name: this.state.name,
      slug: this.state.slug
    };

    this.setState({ allowSubmit: false });
    PageMethods.updatePage.call(pageFields, err => {
      this.setState({ allowSubmit: true });
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`PageMethods.updatePage failed`, err);
      }
    });
  }

  loadMore() {
    this.props.dispatch({ type: "LOAD_MORE" }); // cursorBlock: this.cursorBlock
  }

  togglePageSelect = id => event => {
    const currentState = Object.assign({}, this.state.selectedUsers);
    const selected = currentState[id] === true;
    currentState[id] = !selected;
    this.setState({ selectedUsers: currentState });

    this.selectedPages = Object.keys(currentState).reduce((filtered, option) => {
      if (currentState[option]) {
        filtered.push(option);
      }
      return filtered;
    }, []);

    return "";
  };

  // {this.renderImage(pageObj)}
  pageDetail(pageObj) {
    const id = pageObj._id;
    //const allowed = this.allowUser(id);
    //const email = userObj.emails[0].address;
    return (
      <div>
        <RenderImage pageObj={pageObj} editImage={this.state.editImage} />

        <PageForm
          settingsObj={pageObj}
          edit={true}
        />
      </div>
    );
  }

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
    log.info(`deleteAll`);
    this.setState({ block: true });
    deleteAllUsers.call({}, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        log.error(`deleteAllUsers failed`, err);
      } else {
        this.miniAlert("All users were deleted!");
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
            <ListItemText primary="Delete ALL pages" />
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

  toggleNewPage() {
    const vis = !this.state.showNewPage;
    this.setState({ showNewPage: vis });
  }

  newPage() {
    const layout = (
      <OptionGroup show={this.state.showNewPage} label="New Page" action={this.toggleNewPage}>
        {this.newPageDetail()}
      </OptionGroup>
    );

    return layout;
  }

  newPageDetail() {
    const { classes } = this.props;
    return (
      <div className={classes.newPageDetail}>
        <PageForm settingsObj={null} edit={false} />
      </div>
    );
  }

  /*
  renderEditIcon() {
    return (
      <label>
        Meta Image <EditIcon onClick={this.handleSetStateImage} stateName="editImage" />
      </label>
    );
  }

  renderCancelEditIcon() {
    return (
      <label>
        Upload Image{" "}
        <CancelEditIcon className="cancel-edit-icon" onClick={this.handleSetStateImage} stateName="editImage" />
      </label>
    );
  }
  */

  renderToggleEditIcon() {
    const label = this.state.editImage ? `Upload Image ` : `Meta Image`;
    return (
      <label>
        {label}
        <ToggleEditIcon currentState={this.state.editImage} toggleImageEdit={this.toggleImageEdit} />
      </label>
    );
  }

  // {this.renderCancelEditIcon()}
  //  {this.renderEditIcon()}

  /*
  renderImage(pageObj) {
    let layout: any = "";
    let cursor: any;
    cursor = EditorialImages.find({ _id: pageObj.metaImage });
    const myImages = cursor.fetch();
    let fileCursor: any;
    let link: any;
    if (myImages) {
      fileCursor = myImages[0];
      if (fileCursor) {
        link = EditorialImages.findOne({ _id: fileCursor._id }).link();
      }
    }

    //log.info(`renderImage`, myImages, this.state);
    if (this.state.editImage) {
      layout = (
        <div className="form-group">
          <UploadForm
            updateMethod="image.UpdatePageAdmin"
            Images={EditorialImages}
            fileLocator=""
            loading={false}
            myImages={myImages}
            dataObj={pageObj}
          />
        </div>
      );
    } else if (fileCursor) {
      // this.props.myImages && this.props.myImages[0]
      layout = (
        <div className="form-group">
          {myImages ? (
            <Image
              fileName={fileCursor.name}
              fileUrl={link}
              fileId={fileCursor._id}
              fileSize={fileCursor.size}
              Images={EditorialImages}
              allowEdit={false}
              dataObj={pageObj}
              updateMethod="image.UpdatePageAdmin"
            />
          ) : (
            ""
          )}
        </div>
      );
    }

    return layout;
  }
  */

  changeFilter = name => event => {
    let filters: any = {};
    filters[name] = event.target.value;
    this.props.dispatch({ type: "FILTER_PAGES", filters: filters });
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

  renderPage(pageObj: any) {
    //log.info(`renderPage`, pageObj);
    const { classes } = this.props;
    const { expanded } = this.state;
    const checkedC = this.checkCheckBox(pageObj);
    const checkBox = this.checkBox("default", pageObj, checkedC);

    return (
      <ExpansionPanel
        classes={{
          expanded: classes.expandedExpansionPanel
        }}
        className={classes.userListExpRoot}
        expanded={expanded === pageObj._id}
        onChange={this.handleExPanelChange(pageObj._id)}
      >
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <div className={classes.summaryData}>
            <span className={classes.summaryDataTitle}>{pageObj.title}</span>
          </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails className={classes.pageDetails}>
          <div>
            <div className={classes.checkBoxSmallContainer}>
              <FormControlLabel control={checkBox} label="selected" />
            </div>

            {this.pageDetail(pageObj)}
          </div>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    );
  }

  checkBox(type, page, checked) {
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

    return <Checkbox className={cssClass} onChange={this.togglePageSelect(page._id)} checked={checked} />;
  }

  checkCheckBox(user) {
    const checked = this.state.selectedUsers[user._id] === true;
    return checked;
  }

  mapPages(pagesArray) {
    const { classes } = this.props;
    //const isGod = UserModule.can({ threshold: "god" });

    const mapped = pagesArray.map(page => {
      //const disabledC = this.disableCheckBox(page);
      const checkedC = this.checkCheckBox(page);
      const layout = (
        <div className={classes.userListItem} key={page._id}>
          {this.checkBox("large", page, checkedC)}
          {this.renderPage(page)}
        </div>
      );
      return layout;
    });

    return mapped;
  }

  showPages(pagesArray: any) {
    const pagesList = this.mapPages(pagesArray);
    return <div>{pagesList}</div>;
  }

  layout() {
    const { classes } = this.props;
    return (
      <BlockUi tag="div" blocking={this.state.block}>
        {this.bulkOptions()}
        {this.filterOptions()}
        {this.newPage()}

        <div>
          <h2 className={classes.heading}>Pages</h2>
          {this.props.allPages ? this.showPages(this.props.allPages) : ""}
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

    /*
    if (imagesHandle) {
      let cursor: any = EditorialImages.find({});
      myImages = cursor.fetch();
    }
    */

    let pages: any;
    switch (filterCount) {
      case 1:
        defaultSearch = false;
        pages = PagesObj.find(combinedFilters, options).fetch();
        break;

      default:
        break;
    }

    if (defaultSearch) {
      pages = PagesObj.find({}, options).fetch();
    }

    return {
      allPages: pages
    };
  })(withStyles(styles, { withTheme: true })(Pages))
);
