import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'mobx-react';
import { useStrict } from 'mobx';
import DevTools from 'mobx-react-devtools';
import AppRouter from './AppRouter';
import stores from './stores';

useStrict(true);

if (module.hot) module.hot.accept();
render(
  <div>
    <Provider {...stores}>
      <AppRouter />
    </Provider>
    {process.env.NODE_ENV !== 'production' && <DevTools />}
  </div>,
  document.getElementById('root'),
);
