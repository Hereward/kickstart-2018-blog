//import React from 'react';
import * as React from 'react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';

// The Header creates links that can be used to navigate
// between routes.
const Header = props => (
    <header>
        <Navigation {...props} />
    </header>
)

export default Header