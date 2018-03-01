import * as React from "react";
import IconButton from "material-ui/IconButton";
import EditorModeEdit from "material-ui/svg-icons/editor/mode-edit";

export function edit(props: {onClick: any; stateName: any}) {
    console.log(`edit icon`, props.onClick);
    return (
        <IconButton
          type="button"
          tooltip="Edit"
          onClick={() => {
              props.onClick(props.stateName, true);
          }}
        >
          <EditorModeEdit />
        </IconButton>
      );

}

/*
edit(type = "editProfile") {
    return (
      <IconButton
        type="button"
        tooltip="Edit"
        onClick={() => {
          this.setState({ [type]: true });
        }}
      >
        <EditorModeEdit />
      </IconButton>
    );
  }
  */