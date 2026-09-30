import React from 'react';
import MainNavbar from './MainNavbar';

/**
 * Navbar adapter wrapping MainNavbar for backwards compatibility
 */
const Navbar = () => {
  return <MainNavbar />;
};

export default Navbar;
