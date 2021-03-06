import * as React from "react";
import * as PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { EditorialImages } from "../../../api/images/methods";
import UploadForm from "../../forms/UploadForm";
import Image from "../../partials/Image";
import OptionGroup from "../components/OptionGroup";

let styles: any;

interface IProps {
  classes: PropTypes.object;
  theme: any;
  dataObj: PropTypes.object;
  updateImageId?: PropTypes.object;
  imageArray: any[];
  toggleShowImage?: PropTypes.object;
  updateMethod: string;
  allowEdit: boolean;
  showImage?: boolean;
  imageId: string;
}

interface IState {
  editImage: boolean;
  newDataObject: any;
}

styles = theme => ({
  root: {},
  imageContainer: { margin: "1rem 1rem 0 1rem" }
});

class RenderImage extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      editImage: false,
      newDataObject: ""
    };
  }

  componentWillMount() {
    this.setState({ editImage: false });
  }

  updateImageId = props => {
    this.props.updateImageId(props);
  };

  setNewImageObject = (newDataObject = "") => {
    this.setState({ newDataObject: newDataObject });
  };

  toggleImageEdit = e => {
    const newState = !this.state.editImage;
    this.setState({ editImage: newState });
  };

  layout() {
    const { classes, toggleShowImage, dataObj, imageArray, allowEdit, showImage, imageId } = this.props;
    const { newDataObject } = this.state;
    const newDataArray = newDataObject ? [newDataObject] : [];
    let layout: any = "";
    let resolvedImageArray: any[] = [];

    if (this.state.editImage) {
      resolvedImageArray = imageArray.length ? imageArray : newDataArray;
      layout = (
        <div className={classes.imageContainer}>
          <UploadForm
            updateImageId={this.updateImageId}
            updateMethod={this.props.updateMethod}
            Images={EditorialImages}
            allowEdit={allowEdit}
            fileLocator=""
            loading={false}
            imageArray={resolvedImageArray}
            dataObj={dataObj}
            updateDirect={false}
            setNewImageObject={this.setNewImageObject}
          />
          {imageId &&
            toggleShowImage && (
              <FormControlLabel
                control={<Checkbox checked={showImage} onChange={toggleShowImage} value="showImage" />}
                label="Show Image on Page"
              />
            )}
        </div>
      );
    }

    return layout;
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <OptionGroup transparent={true} show={this.state.editImage} label="Hero Image" action={this.toggleImageEdit}>
          {this.layout()}
        </OptionGroup>
      </div>
    );
  }
}

export default connect()(
  withTracker(props => {
    const editorialImagesHandle = Meteor.subscribe("editorialImages");
    let imageCursor: any;
    let imageArray: any[] = [];
    let resolvedImageId: string = "";
    if (props.imageId) {
      resolvedImageId = props.imageId;
    } else if (props.dataObj) {
      resolvedImageId = props.dataObj.imageId;
    }
    if (resolvedImageId) {
      imageCursor = EditorialImages.find({ _id: resolvedImageId });
      imageArray = imageCursor.fetch();
    }

    return {
      imageArray: imageArray
    };
  })(withStyles(styles, { withTheme: true })(RenderImage))
);
