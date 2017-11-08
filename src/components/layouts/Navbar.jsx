import React from 'react';
import jwtDecode from 'jwt-decode';
import { Avatar, Button, Layout, BackTop, Icon } from 'antd';
import style from '../../style.css';

const { Header } = Layout;

const Navbar = () => {
  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  const token = localStorage.getItem('token');
  const { username } = jwtDecode(token);

  return (
    <Header style={{ padding: 0 }}>
      <div className={style.navButtons} >
        {/* <span>{username}</span> */}
        {/* <Avatar src="/img/placeholder-avatar.png" /> */}
        <Button onClick={logout}><Icon type="logout" />Выход</Button>
        <BackTop />
      </div>
    </Header>
  );
};

export default Navbar;
