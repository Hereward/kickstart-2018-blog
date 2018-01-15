/*global Bert */ 

import * as React from "react";
import { Meteor } from "meteor/meteor";
import * as PropTypes from "prop-types";
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

interface IProps {
  history: any;
  SignedIn: any;
  ShortTitle: any;
  Email: any;
  AuthVerified: boolean;
  EmailVerified: boolean;
  EnhancedAuth: number;
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
  background-color: ${props => (props['data-verified'] ? 'lime' : 'red')};
`;

declare var Bert: any;


class Navigation extends React.Component<IProps, IState> {
  constructor(props) {
    super(props);

    this.toggleNavbar = this.toggleNavbar.bind(this);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
      collapsed: true
    };
  }

  

  componentWillReceiveProps() {

  }

  componentWillUpdate(nextProps) {

    if (nextProps.SignedIn && nextProps.AuthVerified && !nextProps.EmailVerified) {
      Bert.defaults.hideDelay = 8000;
      Bert.alert({
        hideDelay: 10000,
        type: 'warning',
        icon: 'fa-magic',
        title: 'Check Your Email',
        message: 'A verification email has been sent to your nominated email account. Please check your email and click on the verification link.'
       });

    }

  }

  componentDidMount() {

  }

  updateAuthVerified(state) {
    Meteor.call(
      "authenticator.updateAuthVerified",
      state,
      (error, response) => {
        if (error) {
          console.warn(error);
        }
      }
    );
  }

  toggleNavbar() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  static propTypes = {
    AuthVerified: PropTypes.bool,
    EmailVerified: PropTypes.bool,
    SignedIn: PropTypes.bool,
    EnhancedAuth: PropTypes.number,
    Email: PropTypes.string,
    ShortTitle: PropTypes.string,
  };

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  LogOut(event) {
    event.preventDefault();
    this.updateAuthVerified(false);
    Meteor.logout(() => {
      console.log("Successfull log out!");
      this.props.history.push("/");
    });
  }

  getAuthLayout() {
    let SignedInLayout = (
      <DropdownMenu>
        <DropdownItem>
          <NavLink tag={Link} to="#" onClick={this.LogOut.bind(this)}>
            Sign Out
          </NavLink>
        </DropdownItem>
      </DropdownMenu>
    );

    let SignedOuLayout = (
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

    return this.props.SignedIn ? SignedInLayout : SignedOuLayout;
  }

  authVerified() {
    if (!this.props.EnhancedAuth) {
      return '';
    }

    let verifiedFlag = (this.props.SignedIn && this.props.AuthVerified && this.props.EmailVerified);
    let tip = verifiedFlag ? 'Your session was verified.' : 'Unverified session: ';

    if (!this.props.SignedIn) {
      tip += 'Not signed in.';
    } else {

      if (!this.props.EmailVerified) {
        tip += 'Email address not verified';
      }
     
      if (!this.props.AuthVerified) {
        tip += ', session does not have 2 factor authentication.';
      }
      
    }
   
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
    //let verified =  <span> [NOT VERIFIED] </span>;
    return verified;
  }

  render() {
    return (
      <Navbar color="dark" expand="md" className="main-nav" dark>
        <NavbarBrand>
          <span className="app-title">{this.props.ShortTitle}</span>
          {this.props.Email} {this.authVerified()}
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
}

export default withRouter(
  withTracker(({ params }) => {
    Meteor.subscribe("tasks");
    return {};
  })(Navigation)
);


