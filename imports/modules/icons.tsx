import * as React from "react";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import Delete from "@material-ui/icons/Delete";
import Cancel from "@material-ui/icons/Cancel";
import Contacts from "@material-ui/icons/Contacts";
import Settings from "@material-ui/icons/Settings";
import Edit from "@material-ui/icons/Edit";
import EditorCancel from "material-ui/svg-icons/content/clear";

export const EditIcon = function EditIcon(props: { onClick: any; stateName: any; style?: any; className?: any }) {
  return (
    <IconButton
      aria-label="edit"
      className={props.className}
      onClick={() => {
        props.onClick(props.stateName, true);
      }}
    >
      <Edit />
    </IconButton>
  );
};

export const CancelEditIcon = function CancelEditIcon(props: {
  onClick: any;
  stateName: any;
  style?: any;
  className?: any;
}) {
  return (
    <IconButton
      aria-label="cancel"
      className={props.className}
      onClick={() => {
        props.onClick(props.stateName, false);
      }}
    >
      <Cancel />
    </IconButton>
  );
};

export const UsersIcon = function UsersIcon(props: { onClick: any; stateName: any; style?: any; className?: any }) {
  return (
    <Button
      aria-label="users"
      className={props.className}
      onClick={() => {
        props.onClick(props.stateName, true);
      }}
    >
      <Contacts />&nbsp;&nbsp;Users
    </Button>
  );
};

export const SettingsIcon = function SettingsIcon(props: {
  onClick: any;
  stateName: any;
  style?: any;
  className?: any;
}) {
  return (
    <Button
      aria-label="users"
      className={props.className}
      onClick={() => {
        props.onClick(props.stateName, true);
      }}
    >
      <Settings />&nbsp;&nbsp;Settings
    </Button>
  );
};
