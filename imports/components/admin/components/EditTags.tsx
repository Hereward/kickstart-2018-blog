import * as React from "react";
import { connect } from "react-redux";
import { withTracker } from "meteor/react-meteor-data";
import { withStyles } from "@material-ui/core/styles";
import * as Autosuggest from "react-autosuggest";
import PropTypes from "prop-types";
import * as TagsInput from "react-tagsinput";
import OptionGroup from "./OptionGroup";
import { Tags } from "../../../api/tags/publish";
import "../../../scss/partials/_react-tagsinput.css";

let styles: any;
styles = theme => ({
  root: {},
  tagContainer: { margin: "1rem" }
});

interface IProps {
  classes: PropTypes.object.isRequired;
  importedTags: PropTypes.object.isRequired;
  dataObj?: PropTypes.object.isRequired;
  updateTagList: PropTypes.object.isRequired;
  dispatch: any;
  preSelected: string;
}

interface IState {
  editTags: boolean;
  tags: any[];
}

class EditTags extends React.Component<IProps, IState> {
  importedTagsFormatted: any[];
  tagsReady: boolean;
  constructor(props) {
    super(props);
    this.importedTagsFormatted = [];
    this.tagsReady = false;
    const preselectedTagArray = this.initTags();
    this.state = {
      editTags: false,
      tags: preselectedTagArray
    };
  }

  initTags() {
    const { preSelected } = this.props;
    let preselectedTagArray: string[] = [];
    if (preSelected) {
      preselectedTagArray = preSelected.split(" ");
    }

    return preselectedTagArray;
  }

  componentDidUpdate() {
    const { importedTags } = this.props;
    let i: number;
    if (!this.tagsReady && importedTags.length) {
      for (i = 0; i < importedTags.length; i++) {
        this.importedTagsFormatted.push({ id: i, name: importedTags[i].title });
      }
      this.tagsReady = true;
    }
  }

  toggleEditTags = e => {
    const newState = !this.state.editTags;
    this.setState({ editTags: newState });
  };

  handleChange = tags => {
    const { updateTagList } = this.props;
    this.setState({ tags });
    const tagsString = tags.join(" ");
    updateTagList(tagsString);
  };

  handleChangeInput = tag => {};

  autocompleteRenderInput = ({ addTag, ...props }) => {
    const { importedTags } = this.props;
    const handleOnChange = (e, { newValue, method }) => {
      if (method === "enter") {
        e.preventDefault();
      } else {
        props.onChange(e);
      }
    };

    const inputValue = (props.value && props.value.trim().toLowerCase()) || "";
    const inputLength = inputValue.length;

    let suggestions = importedTags.filter(tag => {
      const suggestionSlice = tag.title.slice(0, inputLength) === inputValue;
      return suggestionSlice;
    });

    return (
      <Autosuggest
        ref={props.ref}
        suggestions={suggestions}
        shouldRenderSuggestions={value => value && value.trim().length > 1}
        getSuggestionValue={suggestion => suggestion.title}
        renderSuggestion={suggestion => <span>{suggestion.title}</span>}
        inputProps={{ ...props, onChange: handleOnChange }}
        onSuggestionSelected={(e, { suggestion }) => {
          addTag(suggestion.title);
        }}
        onSuggestionsClearRequested={() => {}}
        onSuggestionsFetchRequested={() => {}}
        onChangeInput={this.handleChangeInput}
      />
    );
  };

  renderTags() {
    return (
      <TagsInput
        maxTags="5"
        addKeys={[]}
        renderInput={this.autocompleteRenderInput}
        value={this.state.tags}
        onChange={this.handleChange}
      />
    );
  }

  layout() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <OptionGroup transparent={true} show={this.state.editTags} label="Edit Tags" action={this.toggleEditTags}>
          <div className={classes.tagContainer}>{this.renderTags()}</div>
        </OptionGroup>
      </div>
    );
  }

  render() {
    const { importedTags } = this.props;
    if (importedTags.length) {
      return this.layout();
    } else {
      return "";
    }
  }
}

export default connect()(
  withTracker(props => {
    const tagsHandle = Meteor.subscribe("tags");
    let tags: any = [];
    tags = Tags.find().fetch();
    return { importedTags: tags };
  })(withStyles(styles, { withTheme: true })(EditTags))
);
