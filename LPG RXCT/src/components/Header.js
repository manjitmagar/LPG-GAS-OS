import React from 'react';

const Header = () => {
  const handleSearch = () => {
    // Handle search functionality here
    console.log("Performing search...");
  };

  return (
    <header className="header">

        <div className="brand">HAMRO GAS</div>
      <nav>
        <ul className="nav-list">
        <li>
            
          <a href="/about">SEARCH</a>
          </li>
          <li>
            <a href="/about">ABOUT</a>
          </li>
          <li>
            <a href="/login">LOGIN</a>
          </li>
          <li>
            <a href="/help">HELP</a>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
