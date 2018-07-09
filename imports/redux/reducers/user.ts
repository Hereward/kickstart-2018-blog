
export const loggingOut = (state = false, action) => {
  switch (action.type) {
    case "NAV_LOGOUT":
      return true;

    case "LOGOUT_DONE":
      return false;

    default:
      return state;
  }
};
