import * as React from "react";
import { Link } from "react-router-dom";
import Navigation from "./Navigation";

const Header = props => (
  <header className="container-fluid header">
    <Navigation {...props} />
  </header>
);

export default Header;
