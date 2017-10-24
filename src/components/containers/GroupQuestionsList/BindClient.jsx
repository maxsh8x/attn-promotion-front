import React from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import { Button, Form, InputNumber, DatePicker, Col } from 'antd';
import SearchFilter from '../SearchFilter';

const { RangePicker } = DatePicker;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};

const buttonItemLayout = {
  wrapperCol: { span: 14, offset: 6 },
};

// TODO: check maxViews > minViews
const BindClient = ({ clientsBinder, form }) => (
  <Form layout="horizontal">
    <Form.Item
      label="Клиенты"
      {...formItemLayout}
    >
      <SearchFilter
        title="Введите имя клиента для поиска"
        url="/v1/client/search"
        callback={clientsBinder.setClients}
        width={300}
      />
    </Form.Item>
    <Form.Item
      label="Кол-во показов"
      {...formItemLayout}
    >
      <Col span={8}>
        <Form.Item>
          {form.getFieldDecorator('minViews', {
            rules: [
              { message: 'Введите число', required: true },
            ],
            getValueFromEvent: () => clientsBinder.minViews,
            onChange: value => clientsBinder.setMinViews(value),
          })(<InputNumber placeholder="Min" />)}
        </Form.Item>
      </Col>
      <Col span={8}>
        <Form.Item>
          {form.getFieldDecorator('maxViews', {
            rules: [
              { message: 'Введите число', required: true },
            ],
            getValueFromEvent: () => clientsBinder.maxViews,
            onChange: value => clientsBinder.setMaxViews(value),
          })(<InputNumber placeholder="Max" />)}
        </Form.Item>
      </Col>
    </Form.Item>
    <Form.Item
      label="Время показа"
      {...formItemLayout}
    >
      {form.getFieldDecorator('dateRange', {
        rules: [{ type: 'array', required: true, message: 'Пожалуйста, укажите время' }],
        onChange: (date, [startDate, endDate]) => clientsBinder.setDate(startDate, endDate),
        getValueFromEvent: () => [
          moment(clientsBinder.startDate, 'YYYY-MM-DD'),
          moment(clientsBinder.endDate, 'YYYY-MM-DD'),
        ],
      })(
        <RangePicker
          allowClear={false}
        />)}
    </Form.Item>
    <Form.Item
      {...buttonItemLayout}
    >
      <Button
        onClick={() => form.validateFieldsAndScroll(
          (err) => {
            if (!err) { clientsBinder.bindClients(); }
          })}
        type="primary"
      >
        Привязать
      </Button>
    </Form.Item>
  </Form>
);

BindClient.propTypes = {

};

export default Form.create()(observer(BindClient));
