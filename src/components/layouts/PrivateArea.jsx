import React from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Layout, LocaleProvider, Menu, Icon, BackTop } from 'antd';
import ruRU from 'antd/lib/locale-provider/ru_RU';
import permissions from '../../utils/permissions';

const { SubMenu } = Menu;
const { Content, Sider } = Layout;

const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/';
};

const PrivateAreaLayout = ({ children, history }) => (
  <LocaleProvider locale={ruRU}>
    <Layout>
      <Layout>
        <Sider
          collapsible
          breakpoint="lg"
          collapsedWidth="0"
          style={{ minHeight: '100vh' }}
        >
          <Menu
            mode="inline"
            theme="dark"
            defaultSelectedKeys={[history.location.pathname.split('/')[1]]}
          >
            <Menu.Item key="main">
              <NavLink to="/"><Icon type="laptop" />Дашборд</NavLink>
            </Menu.Item>
            <SubMenu key="control" title={<span><Icon type="api" /><span>Управление</span></span>}>
              <Menu.Item key="clients">
                <NavLink to="/clients">Клиенты</NavLink>
              </Menu.Item>
              <Menu.Item key="questions">
                <NavLink to="/questions">Вопросы</NavLink>
              </Menu.Item>
              <Menu.Item key="reports">
                <NavLink to="/reports">Отчеты</NavLink>
              </Menu.Item>
              {permissions(['root', 'buchhalter']) &&
                <Menu.Item key="users">
                  <NavLink to="/users">
                    Пользователи
                  </NavLink>
                </Menu.Item>
              }
            </SubMenu>
            {permissions(['root']) &&
              <SubMenu key="metrics" title={<span><Icon type="area-chart" /><span>Метрики</span></span>}>
                <Menu.Item key="promotion">
                  <NavLink to="/promotion">Продвижение страниц</NavLink>
                </Menu.Item>
              </SubMenu>
            }
            <Menu.Item key="logout">
              <a
                role="button"
                tabIndex={0}
                onClick={logout}
              >
                Выход
              </a>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ padding: '24px 24px 24px' }}>
          <BackTop />
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
