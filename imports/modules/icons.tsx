import * as React from "react";
import IconButton from "material-ui/IconButton";
import EditorModeEdit from "material-ui/svg-icons/editor/mode-edit";
import EditorCancel from "material-ui/svg-icons/content/clear";

export const EditIcon = function EditIcon(props: {onClick: any; stateName: any; style?: any; className?: any}) {
  return (
    <IconButton
      style={props.style}
      className={props.className}
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

export const CancelEditIcon = function CancelEditIcon(props: {onClick: any; stateName: any; style?: any; className?: any}) {
  return (
    <IconButton
      style={props.style}
      className={props.className}
      type="button"
      tooltip="Cancel"
      onClick={() => {
          props.onClick(props.stateName, false);
      }}
    >
      <EditorCancel />
    </IconButton>
  );
}

