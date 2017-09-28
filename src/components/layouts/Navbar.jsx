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
      <Menu
        theme="dark"
        mode="horizontal"
        defaultSelectedKeys={['2']}
        style={{ lineHeight: '64px' }}
      >
        <Menu.Item key="1">nav 1</Menu.Item>
        <Menu.Item key="2">nav 2</Menu.Item>
        <Menu.Item key="3">nav 3</Menu.Item>
      </Menu>
    </Header>
  );
};

export default Navbar;
