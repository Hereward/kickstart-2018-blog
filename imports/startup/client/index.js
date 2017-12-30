import React from 'react';
import { render } from 'react-dom';
import { Meteor } from 'meteor/meteor';
import App from '../../components/layouts/App/App';
import { BrowserRouter } from 'react-router-dom'
import './accounts-config.js';
//import { BrowserRouter } from 'react-router-dom'

console.log('starting...');

Meteor.startup(() => {
  render((
    <App />
  ), document.getElementById('react-root'));
});