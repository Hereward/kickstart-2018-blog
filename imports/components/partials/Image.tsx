import * as React from "react";
import { Meteor } from "meteor/meteor";
import * as Library from "../../modules/library";

declare var _: any;

interface IProps {
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  Images: any;
  allowEdit: boolean;
  dataObj: any;
  updateMethod: string;
  removeNewImageFromUploads?: any;
}

interface IState {}

export default class Image extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.removeFile = this.removeFile.bind(this);
    this.state = {};
  }

  removeFile() {
    const { removeNewImageFromUploads } = this.props;
    const { dataObj } = this.props;

    let conf = confirm("Are you sure you want to delete the file?") || false;
    if (conf === true) {
      const recId = this.props.dataObj ? this.props.dataObj._id : "";
      log.info(`Image.removeImage()`, recId);

      Meteor.call("image.remove", { id: this.props.fileId, dataSource: "editorial" }, (err, res) => {
        if (err) {
          console.log(err);
          Library.modalErrorAlert(err.reason);
        } else {
          if (removeNewImageFromUploads) {
            removeNewImageFromUploads();
          }
          Meteor.call(this.props.updateMethod, { id: recId, image_id: "" });
        }
      });
    }
  }

  renameFile() {
    let validName = /[^a-zA-Z0-9 \.:\+()\-_%!&]/gi;
    let prompt = window.prompt("New file name?", this.props.fileName);

    if (prompt) {
      prompt = prompt.replace(validName, "-");
      prompt.trim();
    }

    if (!_.isEmpty(prompt)) {
      Meteor.call("RenameFile", this.props.fileId, prompt, function rename(err, res) {
        if (err) {
          console.log(err);
        }
      });
    }
  }

  renderEdit() {
    if (this.props.allowEdit) {
      return (
        <div>
          <div>Size: {this.props.fileSize}</div>
          <div>
            <button onClick={this.removeFile} className="btn btn-outline btn-danger btn-sm">
              Delete
            </button>
          </div>
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        <div>
          <img className="profile-image" src={this.props.fileUrl} alt={this.props.fileName} />{" "}
        </div>
        {this.renderEdit()}
      </div>
    );
  }
}
