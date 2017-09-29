import React from 'react';
import PropTypes from 'prop-types';
import { Layout, LocaleProvider, Menu, Icon, Breadcrumb } from 'antd';
import ruRU from 'antd/lib/locale-provider/ru_RU';
import Navbar from './Navbar';

const { SubMenu } = Menu;
const { Content, Sider } = Layout;

const PrivateAreaLayout = props => (
  <LocaleProvider locale={ruRU}>
    <Layout>
      <Navbar />
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            defaultSelectedKeys={['1']}
            defaultOpenKeys={['sub1']}
            style={{ height: '100%', borderRight: 0 }}
          >
            <SubMenu key="sub1" title={<span><Icon type="area-chart" />Метрики</span>}>
              <Menu.Item key="1">Продвижение</Menu.Item>
            </SubMenu>
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Breadcrumb style={{ margin: '12px 0' }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>List</Breadcrumb.Item>
            <Breadcrumb.Item>App</Breadcrumb.Item>
          </Breadcrumb>
          <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
            {props.children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  </LocaleProvider>
);

PrivateAreaLayout.propTypes = {
  children: PropTypes.element.isRequired,
};

export default PrivateAreaLayout;
