import { Meteor } from "meteor/meteor";
const basePaginationUnit = Meteor.settings.public.admin.basePaginationUnit;

export const cursorLimit = (state = basePaginationUnit, action) => {
  switch (action.type) {
    case "LOAD_MORE": {
      const nextBlock = action.cursorBlock ? action.cursorBlock : basePaginationUnit;
      return state + nextBlock;
    }
    case "LOAD_INIT": {
      return basePaginationUnit;
    }

    default:
      return state;
  }
};

export const filters = (state = {}, action) => {
  switch (action.type) {
    case "FILTER_USERS": {
      let newState: any;
      newState = Object.assign({}, state, action.filters);
      return newState;
    }

    case "FILTER_INIT": {
      return {};
    }

    default:
      return state;
  }
};
