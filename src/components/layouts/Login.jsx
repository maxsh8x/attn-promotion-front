import React from 'react';
import PropTypes from 'prop-types';
import { Layout, LocaleProvider } from 'antd';
import ruRU from 'antd/lib/locale-provider/ru_RU';


const LoginLayout = props => (
  <LocaleProvider locale={ruRU}>
    <Layout>
      <Layout.Content>
        {props.children}
      </Layout.Content>
    </Layout>
  </LocaleProvider>
);

LoginLayout.propTypes = {
  children: PropTypes.element.isRequired,
};

export default LoginLayout;
