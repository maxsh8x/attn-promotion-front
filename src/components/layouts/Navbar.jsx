import React from 'react';
import jwtDecode from 'jwt-decode';
import { Avatar, Button, Layout, Menu } from 'antd';
import style from './Navbar.css';

const { Header } = Layout;

const Navbar = () => {
  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const token = localStorage.getItem('token');
  const { username } = jwtDecode(token);

  return (
    <Header>
      <div className={style.navbuttons} >
        {/* <span>{username}</span> */}
        {/* <Avatar src="/img/placeholder-avatar.png" /> */}
        <Button onClick={logout}>Выход</Button>
      </div>
    </Header>
  );
};

export default Navbar;
