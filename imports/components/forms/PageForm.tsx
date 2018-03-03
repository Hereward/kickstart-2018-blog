import * as React from "react";
import { withTracker } from "meteor/react-meteor-data";
import * as PropTypes from "prop-types";
import * as jquery from "jquery";

//import "jquery-validation";
import "tooltipster";
import "tooltipster/dist/css/tooltipster.bundle.min.css";
import "tooltipster/dist/css/plugins/tooltipster/sideTip/themes/tooltipster-sideTip-light.min.css";
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
      body: ""
    };

    //console.log(`ProfileForm`, this.props, this.state);
  }

  static propTypes = {
    handleSubmit: PropTypes.func,
    handleChange: PropTypes.func,
    handleSetState: PropTypes.func,
    pageObj: PropTypes.object
  };

  componentDidMount() {
    jquery(window).keydown(function(event) {
      if (event.keyCode == 13) {
        event.preventDefault();
        return false;
      }
    });
  }

  handleSetStateUpstream(content) {
    //console.log(`handleSetStateUpstream`, content, 'body');

    this.props.handleSetState("body", content);
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.handleSubmit();
  }

  handleChange(e) {
    this.props.handleChange(e);
  }

  handleSetState(sVar, sVal) {
    //console.log(`handleSetState (About)`, sVar, sVal);
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

          <button type="submit" className="btn btn-default">
            Submit
          </button>
        </form>
      </div>
    );
  }
}

// {this.getWidget({ name: "region", label: "Region/State" })}
//  {this.getWidget({ name: "country", label: "Country" })}

/*
 {
        _id: string;
        fname: string;
        initial: string;
        lname: string;
        street1: string;
        street2: string;
        city: string;
        region: string;
        postcode: string;
        country: string;
        verificationEmailSent: number,
        new: boolean,
        createdAt: string;
        owner: string;
      };
      */
