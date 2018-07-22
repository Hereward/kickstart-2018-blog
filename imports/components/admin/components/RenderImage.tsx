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
  updateMethod: string;
  allowEdit: boolean;
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
  }

  componentWillMount() {
    //log.info(`RenderImage.componentWillMount()`);
    this.setState({ editImage: false });
  }

  updateImageId = props => {
    this.props.updateImageId(props);
  };

  toggleImageEdit = e => {
    const newState = !this.state.editImage;
    this.setState({ editImage: newState });
  };

  layout() {
    const { classes } = this.props;
    const { dataObj } = this.props;
    const { imageArray } = this.props;
    const { allowEdit } = this.props;
    let layout: any = "";

    if (this.state.editImage) {
      layout = (
        <div className={classes.imageContainer}>
          <UploadForm
            updateImageId={this.updateImageId}
            updateMethod={this.props.updateMethod}
            Images={EditorialImages}
            allowEdit={allowEdit}
            fileLocator=""
            loading={false}
            imageArray={imageArray}
            dataObj={dataObj}
            updateDirect={false}
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

export default connect()(
  withTracker(props => {
    let imageCursor: any;
    let imageArray: any;
    if (props.dataObj) {
      const imageId = props.dataObj.image_id;
      imageCursor = EditorialImages.find({ _id: imageId });
      imageArray = imageCursor.fetch();
    }

    return {
      imageArray: imageArray
    };
  })(withStyles(styles, { withTheme: true })(RenderImage))
);
