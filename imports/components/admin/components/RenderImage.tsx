import * as React from "react";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { EditorialImages } from "../../../api/images/methods";
import UploadForm from "../../forms/UploadForm";
import Image from "../../partials/Image";
import { ToggleEditIcon } from "../../../modules/icons";
import OptionGroup from "../components/OptionGroup";

let styles: any;

interface IProps {
  classes: any;
  theme: any;
  dataObj: any;
  updateImageId?: any;
  imageArray?: any;
}

interface IState {
  editImage: boolean;
}

styles = theme => ({
  root: {},
  imageContainer: { margin: "1rem" }
});

class RenderImage extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.state = {
      editImage: false
    };
    //log.info(`RenderImage constructor`, this.props);
  }

  updateImageId = id => {
    this.props.updateImageId(id);
  };

  toggleImageEdit = e => {
    const newState = !this.state.editImage;
    //log.info(`toggleImageEdit`, e, newState);
    this.setState({ editImage: newState });
  };

  layout() {
    const { classes } = this.props;
    const { dataObj } = this.props;
    const { imageArray } = this.props;
    let layout: any = "";
    // let cursor: any;
    // let myImages: any;

    // if (dataObj) {
    //  cursor = EditorialImages.find({ _id: dataObj.image_id });
    // myImages = cursor.fetch();

    //log.info(`RenderImage layout()`, myImages);
    /*
      let fileCursor: any;
      let link: any;
      if (myImages) {
        fileCursor = myImages[0];
        if (fileCursor) {
          link = EditorialImages.findOne({ _id: fileCursor._id }).link();
        }
      }
      */
    // }
    //log.info(`RenderImage`, dataObj.image_id, imageArray); // , this.state, this.props

    if (this.state.editImage) {
      layout = (
        <div className={classes.imageContainer}>
          <UploadForm
            updateImageId={this.updateImageId}
            updateMethod="image.UpdatePageAdmin"
            Images={EditorialImages}
            fileLocator=""
            loading={false}
            imageArray={imageArray}
            dataObj={dataObj}
          />
        </div>
      );
    }

    return layout;
  }

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <OptionGroup show={this.state.editImage} label="Image" action={this.toggleImageEdit}>
          {this.layout()}
        </OptionGroup>
      </div>
    );
  }
}

//export default withStyles(styles, { withTheme: true })(RenderImage);

export default connect()(
  withTracker(props => {
    let imageCursor: any;
    let imageArray: any;
    if (props.dataObj) {
      imageCursor = EditorialImages.find({ _id: props.dataObj.image_id });
      imageArray = imageCursor.fetch();
    }
    log.info(`RenderImage.tracker()`, imageArray);

    return {
      imageArray: imageArray
    };
  })(withStyles(styles, { withTheme: true })(RenderImage))
);
