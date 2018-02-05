/*global Bert */

import * as React from "react";
import { Meteor } from "meteor/meteor";
import * as PropTypes from "prop-types";

import ReactRouterPropTypes from "react-router-prop-types";

// import * as Bert from "meteor/themeteorchef:bert";

import { Link, withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import styled from "styled-components";

import {
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Tooltip,
  UncontrolledTooltip
} from "reactstrap";

import * as AuthMethods from "../../api/auth/methods";
import { Auth } from "../../api/auth/publish";
import * as Library from "../../modules/library";

interface IProps {
  history: any;
  signedIn: any;
  ShortTitle: any;
  Email: any;
  authVerified: boolean;
  EmailVerified: boolean;
  enhancedAuth: boolean;
  loading: boolean;
  profile: any;
  authData: {
    _id: string;
    verified: boolean;
    currentAttempts: number;
    private_key: string;
    owner: string;
    keyObj: any;
    QRCodeShown: boolean;
  };
}

interface IState {
  isOpen: boolean;
  collapsed: boolean;
}

//import { browserHistory } from 'react-router';

const VerifiedIndicator = styled.div`
  border-radius: 50%;
  height: 1rem;
  width: 1rem;
  display: inline-block;
  position: relative;
  top: 0.2rem;
  background-color: ${props => (props["data-verified"] ? "lime" : "red")};
`;

declare var Bert: any;

class Navigation extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.toggleNavbar = this.toggleNavbar.bind(this);

    this.toggle = this.toggle.bind(this);
    this.logOut = this.logOut.bind(this);
    this.state = {
      isOpen: false,
      collapsed: true
    };


    //console.log(`Navigation`,this.props, this.state);
    
  }

  componentWillReceiveProps() {}


  componentWillUpdate(nextProps) {}

  componentDidUpdate() {
    //console.log(`componentDidUpdate`);
    if (this.verifyEmailNotificationRequired()) {
      Library.userModelessAlert("verifyEmail", this.props);
    }
  }

  componentDidMount() {}

  verifyEmailNotificationRequired() {
    return (this.props.signedIn && this.props.profile && (!this.props.enhancedAuth || this.props.authData));
  }

  updateAuthVerified(state) {

    let authFields = {
      verified: true
    };

    AuthMethods.setVerified.call(authFields, (err, res) => {
      //console.log("setVerified.call", authFields);
      if (err) {
        Library.modalErrorAlert(err.reason);
        //console.log(`setVerified error`, err);
      } else {
        //console.log(`Private Key successfully created`);
      }
    });

    /*
    Meteor.call(
      "authenticator.updateAuthVerified",
      state,
      (error, response) => {
        if (error) {
          console.warn(error);
        }
      }
    );
    */
  }

  toggleNavbar() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  static propTypes = {
    authVerified: PropTypes.bool,
    EmailVerified: PropTypes.bool,
    signedIn: PropTypes.bool,
    enhancedAuth: PropTypes.bool,
    Email: PropTypes.string,
    ShortTitle: PropTypes.string,
    history: ReactRouterPropTypes.history,
    loading: PropTypes.bool,
    profile: PropTypes.any,
    authData: PropTypes.shape({
      _id: PropTypes.string,
      verified: PropTypes.bool,
      currentAttempts: PropTypes.number,
      private_key: PropTypes.string,
      owner: PropTypes.string,
      keyObj: PropTypes.any,
      QRCodeShown: PropTypes.bool,
    })
  };

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  logOut(event) {
    event.preventDefault();
    this.updateAuthVerified(false);
    Meteor.logout(() => {
      //console.log("Successfull log out!");
      this.props.history.push("/");
    });
  }

  getAuthLink() {
    if (this.props.enhancedAuth && !this.props.authVerified) {
      return (
        <DropdownItem>
          <NavLink tag={Link} to="/authenticate">
            Authenticator
          </NavLink>
        </DropdownItem>
      );
    }
  }

  getAuthLayout() {
    let SignedInLayout = (
      <DropdownMenu>
        <DropdownItem>
          <NavLink tag={Link} to="#" onClick={this.logOut}>
            Sign Out
          </NavLink>
        </DropdownItem>
        {this.getAuthLink()}
      </DropdownMenu>
    );

    let SignedOutLayout = (
      <DropdownMenu>
        <DropdownItem>
          <NavLink tag={Link} to="/register">
            Register
          </NavLink>
        </DropdownItem>
        <DropdownItem>
          <NavLink tag={Link} to="/signin">
            Sign In
          </NavLink>
        </DropdownItem>
        <DropdownItem>
          <NavLink tag={Link} to="/forgot-password">
            Forgot Password
          </NavLink>
        </DropdownItem>
      </DropdownMenu>
    );

    return this.props.signedIn ? SignedInLayout : SignedOutLayout;
  }

  authVerifiedLayout() {
    
    //let verifiedFlag = false;
    //if (!this.props.enhancedAuth || this.props.authData) {
    let tipObj = Library.dashBoardTip(this.props);
    let tip = tipObj.tip;
    let verifiedFlag = tipObj.verified;

    //}
    //const tipObj = Library.dashBoardTip(this.props);
    //const tip = tipObj.tip;
    //const verifiedFlag = tipObj.verified;

    let verified = (
      <span>
        <VerifiedIndicator
          data-verified={verifiedFlag}
          id="VerifiedIndicator"
        />

        <UncontrolledTooltip placement="right" target="VerifiedIndicator">
          {tip}
        </UncontrolledTooltip>
      </span>
    );
    return verified;
  }

  navBar() {
    return (
      <Navbar color="dark" expand="md" className="main-nav" dark>
        <NavbarBrand>
          <span className="app-title">{this.props.ShortTitle}</span>
          {this.props.Email} {this.authVerifiedLayout()}
        </NavbarBrand>
        <NavbarToggler onClick={this.toggleNavbar} />
        <Collapse isOpen={!this.state.collapsed} navbar>
          <Nav className="ml-auto" navbar>
            <NavItem>
              <NavLink tag={Link} to="/">
                Home
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink tag={Link} to="About">
                About
              </NavLink>
            </NavItem>

            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Members
              </DropdownToggle>
              {this.getAuthLayout()}
            </UncontrolledDropdown>
          </Nav>
        </Collapse>
      </Navbar>
    );
  }

  render() {
    return this.navBar();
  }
}

export default withRouter(
  withTracker(({ params }) => {
    let userDataHandle = Meteor.subscribe("userData");
    let authDataReady = Meteor.subscribe("enhancedAuth");
    let authData: any;
    //authData = {verified: false};
    if (Meteor.user()) {
      if (authDataReady) {
        //console.log(`Loading Auth Data`);
        authData = Auth.findOne({ owner: Meteor.userId() });
      }
    }
    let loading = !userDataHandle.ready();
    return { loading: loading, authData: authData };
  })(Navigation)
);
