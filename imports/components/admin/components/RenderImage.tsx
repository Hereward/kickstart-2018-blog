import * as React from "react";
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
  settingsObj: any;
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

  toggleImageEdit = e => {
    const newState = !this.state.editImage;
    log.info(`toggleImageEdit`, e, newState);
    this.setState({ editImage: newState });
  };

  renderToggleEditIcon() {
    const label = this.state.editImage ? `Upload Image ` : `Meta Image`;
    return (
      <label>
        {label}
        <ToggleEditIcon currentState={this.state.editImage} toggleImageEdit={this.toggleImageEdit} />
      </label>
    );
  }

  layout() {
    const { classes } = this.props;
    const { settingsObj } = this.props;
    let layout: any = "";
    let cursor: any;
    cursor = EditorialImages.find({ _id: settingsObj.metaImage });
    const myImages = cursor.fetch();
    let fileCursor: any;
    let link: any;
    if (myImages) {
      fileCursor = myImages[0];
      if (fileCursor) {
        link = EditorialImages.findOne({ _id: fileCursor._id }).link();
      }
    }

    /*
    <Image
          fileName={fileCursor.name}
          fileUrl={link}
          fileId={fileCursor._id}
          fileSize={fileCursor.size}
          Images={EditorialImages}
          allowEdit={false}
          dataObj={settingsObj}
          updateMethod="image.UpdatePageAdmin"
        />
        */

    if (this.state.editImage) {
      layout = (
        <div className={classes.imageContainer}>
          <UploadForm
            updateMethod="image.UpdatePageAdmin"
            Images={EditorialImages}
            fileLocator=""
            loading={false}
            myImages={myImages}
            dataObj={settingsObj}
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

export default withStyles(styles, { withTheme: true })(RenderImage);
