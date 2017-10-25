import React from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import { Button, Form, InputNumber, DatePicker, Col } from 'antd';

const { RangePicker } = DatePicker;

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};

const buttonItemLayout = {
  wrapperCol: { span: 14, offset: 6 },
};

const Creator = ({ creator, form }) => [
  (<Form.Item
    key="views"
    label="Кол-во показов"
    {...formItemLayout}
  >
    <Col span={8}>
      <Form.Item>
        {form.getFieldDecorator('minViews', {
          rules: [
            { message: 'Введите число', required: true },
          ],
          getValueFromEvent: () => creator.minViews,
          onChange: value => creator.setMinViews(value),
        })(<InputNumber placeholder="Min" min={0} />)}
      </Form.Item>
    </Col>
    <Col span={8}>
      <Form.Item>
        {form.getFieldDecorator('maxViews', {
          rules: [
            { message: 'Введите число', required: true },
          ],
          getValueFromEvent: () => creator.maxViews,
          onChange: value => creator.setMaxViews(value),
        })(<InputNumber placeholder="Max" min={0} />)}
      </Form.Item>
    </Col>
  </Form.Item>),
  (<Form.Item
    key="dateRange"
    label="Время показа"
    {...formItemLayout}
  >
    {form.getFieldDecorator('dateRange', {
      rules: [{ type: 'array', required: true, message: 'Пожалуйста, укажите время' }],
      onChange: (date, [startDate, endDate]) => creator.setDate(startDate, endDate),
      getValueFromEvent: () => [
        moment(creator.startDate, 'YYYY-MM-DD'),
        moment(creator.endDate, 'YYYY-MM-DD'),
      ],
    })(
      <RangePicker
        allowClear={false}
      />)}
  </Form.Item>),
  (<Form.Item
    key="create"
    {...buttonItemLayout}
  >
    <Button
      onClick={() => form.validateFieldsAndScroll(
        (err) => {
          if (!err) { creator.create(); }
        })}
      type="primary"
    >
      Создать
    </Button>
  </Form.Item>),
];

Creator.propTypes = {

};

export default observer(Creator);
