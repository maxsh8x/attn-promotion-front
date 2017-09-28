import React from 'react';
import jwtDecode from 'jwt-decode';
// import { observer, inject } from 'mobx-react';
import RootMain from './root/Main';

const PrivateArea = () => {
  const token = localStorage.getItem('token');
  const { role } = jwtDecode(token);
  switch (role) {
    case 'root':
      return <RootMain />;
    default:
      return null;
  }
};

export default PrivateArea;
