import { combineReducers } from "redux";
import { loggingOut } from "./user";
import { cursorLimit, filters } from "./admin";

export default combineReducers({
  loggingOut,
  cursorLimit,
  filters
});
