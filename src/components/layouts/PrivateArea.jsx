import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Layout, LocaleProvider, Menu, Icon, Breadcrumb } from 'antd';
import ruRU from 'antd/lib/locale-provider/ru_RU';
import Navbar from './Navbar';
import permissions from '../../utils/permissions';

const { SubMenu } = Menu;
const { Content, Sider } = Layout;

const PrivateAreaLayout = ({ children, history }) => (
  <LocaleProvider locale={ruRU}>
    <Layout>
      <Navbar />
      <Layout>
        <Sider width={200} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            style={{ height: '100%', borderRight: 0 }}
            defaultSelectedKeys={[history.location.pathname.split('/')[1]]}
            defaultOpenKeys={['control', 'metrics']}
          >
            <Menu.Item key="main">
              <NavLink to="/"><Icon type="laptop" />Дашборд</NavLink>
            </Menu.Item>
            <SubMenu key="control" title={<span><Icon type="api" />Управление</span>}>
              <Menu.Item key="clients">
                <NavLink to="/clients"><Icon type="team" />Клиенты</NavLink>
              </Menu.Item>
              <Menu.Item key="questions">
                <NavLink to="/questions"><Icon type="question-circle-o" />Вопросы</NavLink>
              </Menu.Item>
              {permissions(['root', 'buchhalter']) &&
                <Menu.Item key="users">
                  <NavLink to="/users">
                    <Icon type="team" />Пользователи
                  </NavLink>
                </Menu.Item>
              }
            </SubMenu>
            {permissions(['root']) &&
              <SubMenu key="metrics" title={<span><Icon type="area-chart" />Метрики</span>}>
                <Menu.Item key="promotion">
                  <NavLink to="/promotion">Продвижение страниц</NavLink>
                </Menu.Item>
              </SubMenu>
            }
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Breadcrumb style={{ margin: '12px 0' }} />
          <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
            {children}
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
