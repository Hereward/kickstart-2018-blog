import { combineReducers } from "redux";
import { loggingOut } from "./user";
import { cursorLimit } from "./admin";

export default combineReducers({
  loggingOut,
  cursorLimit
});
