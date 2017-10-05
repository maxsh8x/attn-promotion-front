import React from 'react';
import { Route, Switch, HashRouter } from 'react-router-dom';
import Login from './components/containers/Login';
import PrivateArea from './components/containers/PrivateArea';
import PrivateRoute from './PrivateRoute';
import LoginLayout from './components/layouts/Login';
import PrivateAreaLayout from './components/layouts/PrivateArea';


const WrappedLoginLayout = () => (
  <LoginLayout>
    <Login />
  </LoginLayout>
);

const WrappedPrivateAreaLayout = ({ history }) => (
  <PrivateAreaLayout history={history}>
    <PrivateArea />
  </PrivateAreaLayout>
);

const AppRouter = () => (
  <HashRouter>
    <Switch>
      <Route path="/login" component={WrappedLoginLayout} />
      <PrivateRoute component={WrappedPrivateAreaLayout} />
    </Switch>
  </HashRouter>
);

export default AppRouter;
