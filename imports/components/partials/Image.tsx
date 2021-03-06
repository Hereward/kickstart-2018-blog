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

  removeFile(e) {
    e.preventDefault();
    const { dataObj, removeNewImageFromUploads } = this.props;

    Library.confirmDialog({ title: "Are you sure you want to delete the file?", message: "off" }).then(result => {
      if (result) {
        const recId = dataObj ? this.props.dataObj._id : "";

        Meteor.call("image.remove", { id: this.props.fileId, dataSource: "editorial" }, (err, res) => {
          if (err) {
            log.error(err);
            Library.modalErrorAlert(err.reason);
          } else {
            if (removeNewImageFromUploads) {
              removeNewImageFromUploads();
            }
            Meteor.call(this.props.updateMethod, { id: recId, image_id: "" });
          }
        });
      }
    });
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
          log.error(err);
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
          <img className="standard-image" src={this.props.fileUrl} alt={this.props.fileName} />{" "}
        </div>
        {this.renderEdit()}
      </div>
    );
  }
}
