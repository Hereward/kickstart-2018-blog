import { Meteor } from "meteor/meteor";
const defaultState = {on: false, message: ""};

export const miniAlert = (state = defaultState, action) => {
  switch (action.type) {
    case "MINI_ALERT_ON": {
        let newState = {on: true, message: action.message};
        return newState;
    }
    case "MINI_ALERT_OFF": {
        let newState = defaultState;
        return newState;
    }

    default:
      return state;
  }
};
