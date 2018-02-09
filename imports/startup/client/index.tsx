import * as React from "react";
import * as ReactDOM from "react-dom";
import { Meteor } from "meteor/meteor";
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import App from "../../components/layouts/App/App";

//let React = require('react');
//let ReactDOM = require('react-dom');

class Launch extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <MuiThemeProvider><App /></MuiThemeProvider>;
  }
}

Meteor.startup(() => {
  ReactDOM.render(<Launch />, document.getElementById("react-root"));
});
