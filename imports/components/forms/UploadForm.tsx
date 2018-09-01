import * as React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { _ } from "meteor/underscore";
import Image from "../partials/Image";
import * as User from "../../modules/user";
import { findOne } from "../../api/images/methods";
import * as Library from "../../modules/library";

interface IProps {
  Images: any;
  fileLocator: any;
  loading: boolean;
  imageArray: any[];
  dataObj: PropTypes.object;
  updateMethod: string;
  updateImageId?: PropTypes.object;
  setNewImageObject?: PropTypes.object;
  updateDirect?: boolean;
  allowEdit: boolean;
}

interface IState {
  uploading: any;
  progress: any;
  inProgress: boolean;
  newImage: boolean;
}

export default class UploadForm extends React.Component<IProps, IState> {
  fileObj: any = null;
  compiledLayout: any = "";

  constructor(props) {
    super(props);

    this.uploadIt = this.uploadIt.bind(this);

    this.state = {
      uploading: [],
      progress: 0,
      inProgress: false,
      newImage: false
    };
  }

  componentWillUnmount() {}

  getFromServer(e) {}

  removeNewImage = () => {
    const { updateImageId, setNewImageObject } = this.props;
    //log.info(`UploadForm.removeNewImage()`);
    this.setState({ newImage: false });
    setNewImageObject();
    updateImageId({ imageId: "" });
  };

  uploadIt(e) {
    e.preventDefault();

    const { Images, updateMethod, dataObj, updateDirect, updateImageId, setNewImageObject } = this.props;

    //let self = this;

    if (e.currentTarget.files && e.currentTarget.files[0]) {
      const file = e.currentTarget.files[0];
      e.target.value = null;
      let uploadInstance = this.props.Images.insert(
        {
          file: file,
          meta: {
            locator: this.props.fileLocator,
            userId: User.id() // Optional, used to check on server for file tampering
          },
          streams: "dynamic",
          chunkSize: "dynamic",
          allowWebWorkers: true // If you see issues with uploads, change this to false
        },
        false
      );

      this.setState({
        uploading: uploadInstance, // Keep track of this instance to use below
        inProgress: true // Show the progress bar now
      });

      // These are the event functions, don't need most of them, it shows where we are in the process
      uploadInstance.on("start", () => {
        //log.info(`upload starting`);
      });

      uploadInstance.on("end", (error, newDataObject) => {
        //log.info(`upload end File Object`, newDataObject);
      });

      uploadInstance.on("uploaded", (error, newDataObject) => {
        //log.info(`upload DONE`);

        if (dataObj && updateDirect) {
          Meteor.call(updateMethod, { id: this.props.dataObj._id, avatarId: newDataObject._id });
        } else {
          updateImageId({ imageId: newDataObject._id, newDataObject: newDataObject });
          setNewImageObject(newDataObject);

          this.fileObj = newDataObject;

          this.setState({ newImage: true });
        }

        this.setState({
          uploading: [],
          progress: 0,
          inProgress: false
        });
      });

      uploadInstance.on("error", function uploadError(error, fileObj) {
        log.error("Error during upload: " + error);
      });

      uploadInstance.on("progress", (progress, fileObj) => {
        // Update our progress bar
        this.setState({
          progress: progress
        });
      });

      uploadInstance.start(); // Must manually start the upload
    } else {
      //log.info(`Tried to upload but NO FILE`);
    }
  }

  showUploadsInProgress() {
    if (!_.isEmpty(this.state.uploading)) {
      return (
        <div>
          {this.state.uploading.file.name}

          <div className="progress progress-bar-default">
            <div
              style={{ width: this.state.progress + "%" }}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={this.state.progress || 0}
              role="progressbar"
              className="progress-bar"
            >
              <span className="sr-only">{this.state.progress}% Complete (success) </span>
              <span>{this.state.progress}%</span>
            </div>
          </div>
        </div>
      );
    }
  }

  getImage(imageObject, key, link?: any) {
    const { Images } = this.props;
    const { allowEdit } = this.props;
    if (!link) {
      link = Images.link(imageObject);
    }

    let elKey = `file_${key}`;
    return (
      <div key={elKey}>
        <Image
          fileName={imageObject.name}
          fileUrl={link}
          fileId={imageObject._id}
          fileSize={imageObject.size}
          Images={this.props.Images}
          allowEdit={allowEdit}
          dataObj={this.props.dataObj}
          updateMethod={this.props.updateMethod}
          removeNewImageFromUploads={this.removeNewImage}
        />
      </div>
    );
  }

  render() {
    //let image: any;
    //const { Images } = this.props;
    const { imageArray } = this.props;
    //const { newImage } = this.state;
    let renderedImages: any = "";

    if (imageArray.length) {
      //log.info(`UploadForm.render()`, imageArray );
      renderedImages = imageArray.map((imageObject, key) => {
        return this.getImage(imageObject, key);
      });

      return this.getLayout(renderedImages);
    } else {
      return this.getLayout();
    }
  }


  getLayout(image: any = "") {
    let layout = (
      <div className="upload-controls">
        <div className="form-group">
          <div className="custom-file">
            <input
              id="fileinput"
              type="file"
              onChange={this.uploadIt}
              disabled={this.state.inProgress}
              ref="fileinput"
              className="custom-file-input"
            />
            <label className="custom-file-label" htmlFor="fileinput">
              Choose file
            </label>
          </div>
        </div>

        <div>{this.showUploadsInProgress()}</div>

        {image}
      </div>
    );

    return layout;
  }
}
