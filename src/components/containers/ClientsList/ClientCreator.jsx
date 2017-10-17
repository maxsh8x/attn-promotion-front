import React from 'react';
import { observer } from 'mobx-react';
import { Button, Form, Input, InputNumber } from 'antd';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};

const buttonItemLayout = {
  wrapperCol: { span: 14, offset: 6 },
};

const ClientCreator = ({ clientCreator }) => (
  <div>
    <Form layout="horizontal">
      <Form.Item
        label="Имя клиента"
        {...formItemLayout}
      >
        <Input
          placeholder="ООО Ромашка"
          name="name"
          value={clientCreator.name}
          onChange={e => clientCreator.setName(e.target.value)}
        />
      </Form.Item>
      <Form.Item
        label="Название бренда"
        {...formItemLayout}
      >
        <Input
          placeholder="Детский центр"
          name="brand"
          value={clientCreator.brand}
          onChange={e => clientCreator.setBrand(e.target.value)}
        />
      </Form.Item>
      <Form.Item
        label="ИНН"
        {...formItemLayout}
      >
        <Input
          placeholder="430601071197"
          name="vatin"
          value={clientCreator.vatin}
          onChange={e => clientCreator.setVATIN(e.target.value)}
        />
      </Form.Item>
      <Form.Item
        label="ID счетчика"
        {...formItemLayout}
      >
        <InputNumber
          placeholder="41234234"
          min={1}
          name="counterID"
          value={clientCreator.counterID}
          onChange={clientCreator.setCounterID}
        />
      </Form.Item>
      <Form.Item
        {...buttonItemLayout}
      >
        <Button
          onClick={clientCreator.createClient}
          type="primary"
        >
          Создать
        </Button>
      </Form.Item>
    </Form>
  </div>
);

ClientCreator.propTypes = {
};

export default observer(ClientCreator);
