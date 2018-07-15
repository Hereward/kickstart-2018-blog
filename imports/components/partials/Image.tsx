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
}

interface IState {}

export default class Image extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.removeFile = this.removeFile.bind(this);
    this.state = {};
  }

  removeFile() {
    let conf = confirm("Are you sure you want to delete the file?") || false;
    if (conf === true) {
      Meteor.call("RemoveFile", this.props.fileId, this.props.Images, function removeImage(err, res) {
        if (err) {
          console.log(err);
          Library.modalErrorAlert(err.reason);
        } else if (this.props.dataObj) {
          Meteor.call(this.props.updateMethod, { id: this.props.dataObj._id, image_id: "" });
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
