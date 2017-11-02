import React from 'react';
import { observer } from 'mobx-react';
import { Button, Form, Input, InputNumber, Spin } from 'antd';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};

const buttonItemLayout = {
  wrapperCol: { span: 14, offset: 6 },
};

const ClientCreator = ({ clientCreator, form }) => (
  <Spin spinning={clientCreator.state === 'pending'}>
    <Form layout="horizontal">
      <Form.Item
        label="Имя клиента"
        {...formItemLayout}
      >
        {form.getFieldDecorator('name', {
          rules: [{ required: true, message: 'Введите имя клиента', whitespace: true }],
          onChange: e => clientCreator.setName(e.target.value),
        })(<Input placeholder="ООО Ромашка" />)}
      </Form.Item>
      <Form.Item
        label="Название бренда"
        {...formItemLayout}
      >
        {form.getFieldDecorator('brand', {
          rules: [],
          onChange: e => clientCreator.setBrand(e.target.value),
        })(<Input placeholder="Детский центр" />)}
      </Form.Item>
      <Form.Item
        label="ИНН"
        {...formItemLayout}
      >
        {form.getFieldDecorator('vatin', {
          rules: [
            { len: 12, message: 'Длина ИНН 12 цифр' },
            { pattern: /^[0-9]+$/, message: 'ИНН должен состоять из цифр' },
          ],
          onChange: e => clientCreator.setVATIN(e.target.value),
        })(<Input placeholder="430601071197" />)}
      </Form.Item>
      <Form.Item
        label="ID счетчика"
        {...formItemLayout}
      >
        {form.getFieldDecorator('counterID', {
          rules: [
            { message: 'Введите ID счетчика', required: true },
            { message: 'Неверный ID счетчика', type: 'number', min: 10000000 },
          ],
          onChange: value => clientCreator.setCounterID(value),
        })(<InputNumber placeholder="41234234" />)}
      </Form.Item>
      <Form.Item
        {...buttonItemLayout}
      >
        <Button
          onClick={() => form.validateFieldsAndScroll(
            (err) => {
              if (!err) { clientCreator.createClient(); }
            })}
          type="primary"
        >
          Создать
        </Button>
      </Form.Item>
    </Form>
  </Spin>
);

ClientCreator.propTypes = {
};

export default Form.create({
  mapPropsToFields({ clientCreator }) {
    return {
      name: {
        value: clientCreator.name,
      },
      brand: {
        value: clientCreator.brand,
      },
      vatin: {
        value: clientCreator.vatin,
      },
      counterID: {
        value: clientCreator.counterID,
      },
    };
  },
})(observer(ClientCreator));
