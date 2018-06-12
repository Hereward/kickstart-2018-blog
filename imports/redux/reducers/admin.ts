export const cursorLimit = (state = 1, action) => {
  switch (action.type) {
    case "LOAD_MORE": {
      //return action.currentVal + action.cursorBlock;
      //log.info(`REDUX - cursorLimit`, state, action);
      return state + action.cursorBlock;
    }

    default:
      return state;
  }
};
