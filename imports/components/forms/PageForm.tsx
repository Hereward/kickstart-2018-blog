import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import * as PropTypes from "prop-types";
import * as jquery from "jquery";
import RaisedButton from "material-ui/RaisedButton";
import Widget from "./Widget";
const ReactQuill = require("react-quill");
import "react-quill/dist/quill.snow.css";
import * as Icon from "../../modules/icons";

interface IProps {
  handleChange: any;
  handleSubmit: any;
  pageObj: any;
  handleSetState: any;
}

interface IState {
  body: any;
  disableSubmit: boolean;
}

export default class PageForm extends React.Component<IProps, IState> {
  formID: string = "ProfileForm";
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

  static propTypes = {
    handleSubmit: PropTypes.func,
    handleChange: PropTypes.func,
    handleSetState: PropTypes.func,
    pageObj: PropTypes.object
  };

  preventDefault(e) {
    e.preventDefault();
  }

  componentDidMount() {
    jquery(`#${this.formID}`).bind("keypress", function(e) {
      if (e.keyCode == 13) {
        return false;
      }
    });
  }

  disableReturnKey(state) {
    jquery(window).keydown(function(event) {
      if (event.keyCode == 13) {
        event.preventDefault();
        return !state;
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
      <Widget widgetType={widgetType} handleChange={this.handleChange} dataObj={this.props.pageObj} wProps={props} />
    );
  }

  render() {
    return (
      <div>
        <form id={this.formID} onSubmit={this.handleSubmit}>
          {this.getWidget({
            name: "heading",
            label: "Heading",
            required: false
          })}

          <div className="form-group">
            <label htmlFor="bodyText">Body Text:</label>
            <ReactQuill
              id="bodyText"
              defaultValue={this.props.pageObj.body}
              onChange={this.handleSetStateUpstream}
              modules={this.modules}
              formats={this.formats}
              theme={"snow"}
            />
          </div>

          <div className="form-group">
            <RaisedButton disabled={this.state.disableSubmit} type="submit" primary={true} label="Submit" />
          </div>
        </form>
      </div>
    );
  }
}
