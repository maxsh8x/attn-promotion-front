import React from 'react';
import { inject, observer } from 'mobx-react';
import { Form, Icon, Input, Button, Card } from 'antd';

const Login = ({ authStore }) => (
  <Card style={{ width: 300 }}>
    <Form>
      <Form.Item>
        <Input
          name="username"
          prefix={<Icon type="user" style={{ fontSize: 13 }} />}
          placeholder="Логин"
          onChange={e => authStore.setUsername(e.target.value)}
          value={authStore.username}
        />
      </Form.Item>
      <Form.Item>
        <Input
          type="password"
          name="password"
          prefix={<Icon type="lock" style={{ fontSize: 13 }} />}
          placeholder="Пароль"
          onChange={e => authStore.setPassword(e.target.value)}
          value={authStore.password}
        />
      </Form.Item>
      <Form.Item>
        <Button onClick={authStore.login}>Авторизоваться</Button>
      </Form.Item>
    </Form>
  </Card>
);


Login.propTypes = {

};

export default inject('authStore')(observer(Login));
