import * as React from "react";
import { Meteor } from "meteor/meteor";
import { _ } from "meteor/underscore";
import Image from "../partials/Image";
//import * as ProfileMethods from "../../api/profiles/methods";

interface IProps {
  Images: any;
  fileLocator: any;
  loading: boolean;
  myImages: any;
  profile: any;
}

interface IState {
  uploading: any;
  progress: any;
  inProgress: boolean;
}

export default class UploadForm extends React.Component<IProps, IState> {
  getImageFromServerURLObj: any;

  constructor(props) {
    super(props);

    this.getImageFromServer = this.getImageFromServer.bind(this);
    this.uploadIt = this.uploadIt.bind(this);

    this.state = {
      uploading: [],
      progress: 0,
      inProgress: false
    };
    console.log(`UploadForm constructor`, this.props);
  }



  getImageFromServer() {
    console.log("getImageFromServer", this.getImageFromServerURLObj.value);
    let url = this.getImageFromServerURLObj.value.trim();
    Meteor.call("getImage", this.props.profile._id, url);
  }

  getFromServer(e) {}

  uploadIt(e) {
    //"use strict";
    e.preventDefault();

    let self = this;

    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case
      // there was multiple files selected
      let file = e.currentTarget.files[0];

      if (file) {
        let uploadInstance = this.props.Images.insert(
          {
            file: file,
            meta: {
              locator: self.props.fileLocator,
              userId: Meteor.userId() // Optional, used to check on server for file tampering
            },
            streams: "dynamic",
            chunkSize: "dynamic",
            allowWebWorkers: true // If you see issues with uploads, change this to false
          },
          false
        );

        self.setState({
          uploading: uploadInstance, // Keep track of this instance to use below
          inProgress: true // Show the progress bar now
        });

        // These are the event functions, don't need most of them, it shows where we are in the process
        uploadInstance.on("start", function uploadOnStart() {
          console.log("Starting");
        });

        uploadInstance.on("end", function uploadEnd(error, fileObj) {
          console.log("On end File Object: ", fileObj);
        });

        uploadInstance.on("uploaded", function uploadOnUploaded(
          error,
          fileObj
        ) {
          //console.log("uploaded: ", fileObj);
          console.log(`uploaded image: [${self.props.profile._id}]`, self.props.profile, fileObj._id);
          Meteor.call("profileImage.update", {id: self.props.profile._id, image_id: fileObj._id});

          //self.props.updateImage(fileObj._id);
          //self.updateResolution(fileObj);

          // Remove the filename from the upload box
          //self.refs["fileinput"].value = "";

          // Reset our state for the next file
          self.setState({
            uploading: [],
            progress: 0,
            inProgress: false
          });
        });

        uploadInstance.on("error", function uploadError(error, fileObj) {
          console.log("Error during upload: " + error);
        });

        uploadInstance.on("progress", function uploadProgress(
          progress,
          fileObj
        ) {
          console.log("Upload Percentage: " + progress);
          // Update our progress bar
          self.setState({
            progress: progress
          });
        });

        uploadInstance.start(); // Must manually start the upload
      }
    }
  }

  // This is our progress bar, bootstrap styled
  // Remove this function if not needed
  showUploads() {
    console.log("**********************************", this.state.uploading);

    if (!_.isEmpty(this.state.uploading)) {
      return (
        <div>
          {this.state.uploading.file.name}

          <div className="progress progress-bar-default">
            <div
              style={{ width: this.state.progress + "%" }}
              aria-valuemax="100"
              aria-valuemin="0"
              aria-valuenow={this.state.progress || 0}
              role="progressbar"
              className="progress-bar"
            >
              <span className="sr-only">
                {this.state.progress}% Complete (success){" "}
              </span>
              <span>{this.state.progress}%</span>
            </div>
          </div>
        </div>
      );
    }
  }

  render() {
    if (!this.props.loading) {
      //"use strict";
      let showit = "";

      //let fileCursors = this.data.docs;
      let fileCursors = this.props.myImages;

      // Run through each file that the user has stored
      // (make sure the subscription only sends files owned by this user)

      if (fileCursors) {
        showit = fileCursors.map((aFile, key) => {
          // console.log('A file: ', aFile.link(), aFile.get('name'));

          let link = this.props.Images.findOne({ _id: aFile._id }).link(); //The "view/download" link

          // Send out components that show details of each file
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
                profile={this.props.profile}
              />
            </div>
          );
        });
      }

      return (
        <div className='upload-controls'>
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

          <div className="form-group row">
            <div className="col-auto">
              <input
                className="form-control"
                type="text"
                id="getImageFromServerURL"
                ref={(input) => { this.getImageFromServerURLObj = input;}}
                placeholder="Enter image URL"
              />
            </div>
            <div className="col-auto">
              <button
                type="button"
                className="btn btn-secondary"
                id="getImageFromServer"
                ref="getImageFromServer"
                onClick={this.getImageFromServer}
              >
                Get web image
              </button>
             
            </div>
          </div>

          <div>{this.showUploads()}</div>

          {showit}
        </div>
      );
    } else
      return (
        <div>
          <span>Loading...</span>
        </div>
      );
  }
}
