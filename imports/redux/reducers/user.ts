
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


/*
export const authRequired = (state = false, action) => {
  switch (action.type) {
    case "USER_LOGIN_DONE":
      return true;

    case "AUTH_DONE":
      return false;

    default:
      return state;
  }
};
*/

/*
export const loggingOut = (
  state = {
    loggingOut: false
  },
  action
) => {
  switch (action.type) {
    case "LOGOUT":
      return {
        loggingOut: true
      };

    case "LOGOUT_DONE":
      return {
        loggingOut: false
      };

    default:
      return state;
  }
};
*/
