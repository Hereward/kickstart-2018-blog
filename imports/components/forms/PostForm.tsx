/*
import * as React from "react";
import PropTypes from "prop-types";
import * as jquery from "jquery";
import * as BlockUi from "react-block-ui";
import "react-block-ui/style.css";
import Button from "@material-ui/core/Button";
import "react-quill/dist/quill.snow.css";
import Widget from "./Widget";

const ReactQuill = require("react-quill");

interface IProps {
  handleChange: PropTypes.object.isRequired;
  handleSubmit: PropTypes.object.isRequired;
  postObj: PropTypes.object.isRequired;
  handleSetState: PropTypes.object.isRequired;
  allowSubmit: boolean;
}

interface IState {
  body: any;
  disableSubmit: boolean;
}

export default class PostForm extends React.Component<IProps, IState> {
  formID: string = "PostForm";
  toolbarOptions = [
    [{ header: [1, 2, 3, 4, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["link", "image", "video"],
    ["clean"]
  ];

  modules = {
    toolbar: this.toolbarOptions
  };

  formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "video"
  ];

  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSetStateUpstream = this.handleSetStateUpstream.bind(this);

    this.state = {
      body: "",
      disableSubmit: false
    };
  }



  componentDidMount() {
    jquery(`#${this.formID}`).bind("keypress", function kp(e) {
      if (e.keyCode === 13) {
        return false;
      }
    });
  }


  handleSetStateUpstream(content) {
    this.props.handleSetState("body", content);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({
      disableSubmit: true
    });
    this.props.handleSubmit();
  }

  handleChange(e) {
    this.props.handleChange(e);
  }

  handleSetState(sVar, sVal) {
    this.setState({ [sVar]: sVal });
  }

  getWidget(props: any) {
    let widgetType = props.widgetType ? props.widgetType : "simple";
    return (
      <Widget
        uncontrolled={true}
        widgetType={widgetType}
        handleChange={this.handleChange}
        dataObj={this.props.postObj}
        wProps={props}
      />
    );
  }

  render() {
    return (
      <BlockUi tag="div" blocking={!this.props.allowSubmit}>
        <form id={this.formID} onSubmit={this.handleSubmit}>
          {this.getWidget({
            name: "title",
            label: "Title",
            required: false
          })}

          <div className="form-group">
            <label htmlFor="bodyText">Body Text:</label>
            <ReactQuill
              id="bodyText"
              onChange={this.handleSetStateUpstream}
              defaultValue={this.props.postObj.body}
              modules={this.modules}
              formats={this.formats}
              theme="snow"
            />
          </div>

          <div className="form-group">
            <Button variant="raised" type="submit" color="primary">
              Submit
            </Button>
          </div>
        </form>
      </BlockUi>
    );
  }
}

*/
