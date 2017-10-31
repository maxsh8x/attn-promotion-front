import React from 'react';
import { Spin, Form, Input, Button, Select } from 'antd';
import { observer } from 'mobx-react';

const Option = Select.Option;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};

const buttonItemLayout = {
  wrapperCol: { span: 14, offset: 6 },
};

const roleLables = {
  root: 'Администратор',
  buchhalter: 'Бухгалтер',
  manager: 'Менеджер',
};

const UserCreator = ({ creator, form }) => (
  <Spin spinning={creator.state === 'pending'}>
    <Form layout="horizontal">
      <Form.Item
        label="Ник"
        {...formItemLayout}
      >
        {form.getFieldDecorator('username', {
          rules: [
            { required: true, message: 'Введите ник пользователя', whitespace: true },
            { message: 'Ник должен быть более 5 символов', min: 5 },
          ],
          onChange: e => creator.setUsername(e.target.value),
        })(<Input placeholder="nikolay.sobolev" />)}
      </Form.Item>
      <Form.Item
        label="Имя пользователя"
        {...formItemLayout}
      >
        {form.getFieldDecorator('name', {
          rules: [{ required: true, message: 'Введите имя пользователя', whitespace: true }],
          onChange: e => creator.setName(e.target.value),
        })(<Input placeholder="Николай Соболев" />)}
      </Form.Item>
      <Form.Item
        label="Почтовый адрес"
        {...formItemLayout}
      >
        {form.getFieldDecorator('email', {
          rules: [
            { required: true, message: 'Введите почтовый адрес' },
            { type: 'email', message: 'Неправильный почтовый адрес' },
          ],
          onChange: e => creator.setEmail(e.target.value),
        })(<Input placeholder="nikolay.sobolev@mail.com" />)}
      </Form.Item>
      <Form.Item
        label="Роль"
        {...formItemLayout}
      >
        {form.getFieldDecorator('role', {
          rules: [{ required: true, message: 'Выберите роль' }],
          onChange: value => creator.setRole(value),
        })(<Select style={{ width: 120 }} onChange={creator.setRole}>
          <Option value="root">{roleLables.root}</Option>
          <Option value="buchhalter">{roleLables.buchhalter}</Option>
          <Option value="manager">{roleLables.manager}</Option>
        </Select >)}
      </Form.Item>
      <Form.Item
        label="Пароль"
        {...formItemLayout}
      >
        {form.getFieldDecorator('brand', {
          rules: [{ required: true, message: 'Введите пароль', whitespace: true }],
          onChange: e => creator.setPassword(e.target.value),
        })(<Input type="password" />)}
      </Form.Item>
      <Form.Item
        {...buttonItemLayout}
      >
        <Button
          onClick={() => form.validateFieldsAndScroll(
            (err) => {
              if (!err) { creator.createUser(); }
            })}
          type="primary"
        >
          Создать
        </Button>
      </Form.Item>
    </Form>
  </Spin>
);

UserCreator.propTypes = {

};

export default Form.create({
  mapPropsToFields({ creator }) {
    return {
      username: {
        value: creator.username,
      },
      name: {
        value: creator.name,
      },
      email: {
        value: creator.email,
      },
      role: {
        value: creator.role,
      },
      password: {
        value: creator.password,
      },
    };
  },
})(observer(UserCreator));
