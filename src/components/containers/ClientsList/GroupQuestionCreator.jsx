import React from 'react';
import { observer } from 'mobx-react';
import { Button, Form, Input, InputNumber } from 'antd';

const GroupQuestionCreator = ({ groupQuestionCreator }) => (
  <div>
    <Form layout="inline">
      <Form.Item>
        <Input
          placeholder="Адрес страницы"
          name="url"
          value={groupQuestionCreator.url}
          onChange={e => groupQuestionCreator.setURL(e.target.value)}
        />
      </Form.Item>
      <Form.Item>
        <InputNumber
          placeholder="ID счетчика"
          min={1}
          name="counterID"
          value={groupQuestionCreator.counterID}
          onChange={groupQuestionCreator.setCounterID}
        />
      </Form.Item>
      <Form.Item>
        <Button
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

export default observer(GroupQuestionCreator);
