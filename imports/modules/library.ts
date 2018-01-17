/*
interface IAuth {
    isAcceptable(s: string): boolean;
}

class Auth implements IAuth {
    constructor(props) {
        //super(props);
      }

    isAcceptable(s: string) {
        return s.length === 5 && numberRegexp.test(s);
    }
}

export { Auth };
*/


export function dashBoardTip(props) {
    console.log(`dashBoardTip SignedIn=[${props.SignedIn}]`);
    let verifiedFlag: boolean;
    let tip: string;
    if (!props.EnhancedAuth) {
        verifiedFlag = this.props.SignedIn && this.props.EmailVerified;
        let tip = verifiedFlag
          ? "Your account is verified."
          : "Your email address is not verified. ";
      } else {
        verifiedFlag =
          props.SignedIn &&
          props.AuthVerified &&
          props.EmailVerified;
        tip = verifiedFlag
          ? "Your session was verified."
          : "Unverified session: ";
  
        if (!props.SignedIn) {
          tip += "Not signed in.";
        } else {
          if (!props.EmailVerified) {
            tip += "Email address not verified";
          }
  
          if (!props.AuthVerified) {
            tip += ", session does not have 2 factor authentication.";
          }
        }
      }
      return {verified: verifiedFlag, tip: tip};
}

export const foo = 'foo';