import React from 'react';
import { observer } from 'mobx-react';
import { Button, Form, Input, InputNumber } from 'antd';

const GroupQuestionCreator = ({ groupQuestionCreator, form }) => (
  <div>
    <Form layout="inline">
      <Form.Item>
        {form.getFieldDecorator('url', {
          rules: [
            { required: true, message: 'Введите адрес страницы' },
            { message: 'Неверный формат ссылки', type: 'url' },
          ],
          onChange: e => groupQuestionCreator.setURL(e.target.value),
        })(<Input placeholder="Адрес страницы" style={{ width: 250 }} />)}
      </Form.Item>
      <Form.Item>
        {form.getFieldDecorator('counterID', {
          rules: [
            { message: 'Введите ID счетчика', required: true },
            { message: 'Неверный ID счетчика', type: 'number', min: 10000000 },
          ],
          onChange: value => groupQuestionCreator.setCounterID(value),
        })(<InputNumber placeholder="41234234" />)}
      </Form.Item>
      <Form.Item>
        <Button
          onClick={() => form.validateFieldsAndScroll(
            (err) => {
              if (!err) { groupQuestionCreator.createGroupQuestion(); }
            })}
          type="primary"
        >
          Создать
        </Button>
      </Form.Item>
    </Form>
  </div>
);

GroupQuestionCreator.propTypes = {

};

export default Form.create({
  mapPropsToFields({ groupQuestionCreator }) {
    return {
      url: {
        value: groupQuestionCreator.url,
      },
      counterID: {
        value: groupQuestionCreator.counterID,
      },
    };
  },
})(observer(GroupQuestionCreator));
