import * as React from "react";
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
  imageArray: any;
  dataObj: any;
  updateMethod: string;
  updateImageId?: any;
}

interface IState {
  uploading: any;
  progress: any;
  inProgress: boolean;
  newImage: boolean;
}

export default class UploadForm extends React.Component<IProps, IState> {
  //getImageFromServerURLObj: any;
  fileObj: any = null;
  compiledLayout: any = "";

  constructor(props) {
    super(props);

    //this.getImageFromServer = this.getImageFromServer.bind(this);
    this.uploadIt = this.uploadIt.bind(this);

    this.state = {
      uploading: [],
      progress: 0,
      inProgress: false,
      newImage: false
    };
  }

  /*
  getImageFromServer() {
    let url = this.getImageFromServerURLObj.value.trim();
    Meteor.call("getImage", this.props.dataObj._id, url, this.props.Images);
  }
  */

  componentWillUnmount() {}

  getFromServer(e) {}

  uploadIt(e) {
    e.preventDefault();

    const { Images } = this.props;

    //let self = this;

    if (e.currentTarget.files && e.currentTarget.files[0]) {
      let file = e.currentTarget.files[0];

      if (file) {
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
          //console.log("Starting");
        });

        uploadInstance.on("end", (error, fileObj) => {
          //console.log("On end File Object: ", fileObj);
        });

        uploadInstance.on("uploaded", (error, fileObj) => {
          //console.log(`uploaded image: [${self.props.profile._id}]`, self.props.profile, fileObj._id);
          if (this.props.dataObj) {
            Meteor.call(this.props.updateMethod, { id: this.props.dataObj._id, image_id: fileObj._id });
          } else {
            this.props.updateImageId(fileObj._id);
            this.fileObj = fileObj;

            this.setState({ newImage: true });

            /*
            findOne.call({ id: fileObj._id }, (err, fileCursor) => {
              //let image: any;
              if (err) {
                Library.modalErrorAlert(err.reason);
                console.log(`uploadInstance - findOne.call failed`, err);
              } else {
                log.info(`uploadInstance.uploaded`, fileObj);
                let link = fileCursor.link();
                
                let image = [fileObj].map((aFile, key) => {
                  const myStuff = this.getStuff(aFile, key, link);
                 
                  return myStuff;
                });

                this.compiledLayout = this.boojam(image);
                this.setState({ newImage: true });
              }
            });
            */
          }

          //this.fileObj = fileObj;

          this.setState({
            uploading: [],
            progress: 0,
            inProgress: false
          });

          log.info(`uploadInstance`, this.state);
        });

        uploadInstance.on("error", function uploadError(error, fileObj) {
          log.error("Error during upload: " + error);
        });

        uploadInstance.on("progress", (progress, fileObj) => {
          //console.log("Upload Percentage: " + progress);
          // Update our progress bar
          this.setState({
            progress: progress
          });
        });

        uploadInstance.start(); // Must manually start the upload
      }
    }
  }

  showUploadsInProgress() {
    //console.log("**********************************", this.state.uploading);

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

  getStuff(aFile, key, link?: any) {
    const { Images } = this.props;
    if (!link) {
      link = Images.link(aFile);
      log.info(`getStuff - images`, link, aFile);
      //const fileCursor = this.props.Images.findOne({ _id: aFile._id });
      // link = fileCursor.link();
    }

    let elKey = `file_${key}`;
    return (
      <div key={elKey}>
        <Image
          fileName={aFile.name}
          fileUrl={link}
          fileId={aFile._id}
          fileSize={aFile.size}
          Images={this.props.Images}
          allowEdit={true}
          dataObj={this.props.dataObj}
          updateMethod={this.props.updateMethod}
        />
      </div>
    );
  }

  render() {
    //let image: any;
    const { Images } = this.props;
    const { imageArray } = this.props;

    //const fileCursor = this.props.myImages;
    let image: any = "";
    log.info(`UploadForm.render()`, this.props);

    if (imageArray) {
      image = imageArray.map((aFile, key) => {
        const myStuff = this.getStuff(aFile, key);
        return myStuff;
      });

      return this.boojam(image);
    } else if (this.state.newImage) {
      let link = Images.link(this.fileObj);
      let image = [this.fileObj].map((aFile, key) => {
        const myStuff = this.getStuff(aFile, key, link);
        return myStuff;
      });

      //  log.info(`UploadForm.render() newImage`, this.compiledLayout);

      return this.boojam(image);
    } else {
      return this.boojam();
      /*
      return (
        <div>
          <span>Loading...</span>
        </div>
      );
      */
    }
  }

  boojam(image: any = "") {
    log.info(`UploadForm.boojam()`, image);
    let compiledLayout = (
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

    return compiledLayout;
  }
}
