import jwtDecode from 'jwt-decode';

const permissions = (roles) => {
  const token = localStorage.getItem('token');
  const { role } = jwtDecode(token);
  return (roles.indexOf(role) !== -1);
};

export default permissions;

