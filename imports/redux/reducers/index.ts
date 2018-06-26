import { combineReducers } from "redux";
import { loggingOut } from "./user";
import { cursorLimit, filters } from "./admin";
import { miniAlert } from "./notification";

export default combineReducers({
  loggingOut,
  cursorLimit,
  filters,
  miniAlert
});
