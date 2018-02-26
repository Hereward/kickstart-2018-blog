import * as React from "react";
import { Meteor } from "meteor/meteor";
//import * as ProfileMethods from "../../api/profiles/methods";
import * as Library from "../../modules/library";

declare var _: any;

interface IProps {
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  Images: any;
  allowEdit: boolean;
  profile: any;
}

interface IState {}

export default class Image extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.removeFile = this.removeFile.bind(this);
    this.state = {};
    console.log(`Image Constructor`, this.props);
  }

  /*
  propTypes: {
    fileName: React.PropTypes.string.isRequired,
    fileSize: React.PropTypes.number.isRequired,
    fileUrl: React.PropTypes.string,
    fileId: React.PropTypes.string.isRequired
  }
*/

/*
updateProfileImage() {
    let profileFields = { id: this.props.profile._id, image_id: '' };

    console.log(`IMAGE updateProfileImage`, this.props.profile._id);

    ProfileMethods.updateProfileImage.call(profileFields, err => {
      if (err) {
        Library.modalErrorAlert(err.reason);
        console.log(`ProfileMethods.updateProfileImage failed`, err);
      } else {
        //this.setEditor(false);
      }
    });
  };
  */

  removeFile() {
    //"use strict";
    let conf = confirm("Are you sure you want to delete the file?") || false;
    if (conf === true) {
      //this.props.Images.remove({_id: this.props.fileId});

      Meteor.call("RemoveFile", this.props.fileId, function removeImage(err, res) {
        if (err) {
          console.log(err);
          Library.modalErrorAlert(err.reason);
        } else {
          Meteor.call("profileImage.update", {id: this.props.profile._id, image_id: ''});
          //this.updateProfileImage();
        }
      });
    }
  }

  renameFile() {
    //"use strict";

    let validName = /[^a-zA-Z0-9 \.:\+()\-_%!&]/gi;
    let prompt = window.prompt("New file name?", this.props.fileName);

    // Replace any non valid characters, also do this on the server
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
            <button
              onClick={this.removeFile}
              className="btn btn-outline btn-danger btn-sm"
            >
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
          <img
            className="profile-image"
            src={this.props.fileUrl}
            alt={this.props.fileName}
          />{" "}
        </div>
        {this.renderEdit()}
      </div>
    );
  }
}

/*
 <div className="col-md-3">
          <button onClick={this.renameFile.bind(this)} className="btn btn-outline btn-primary btn-sm">
            Rename
          </button>
        </div>
*/
