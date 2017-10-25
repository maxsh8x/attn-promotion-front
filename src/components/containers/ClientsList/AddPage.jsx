import React from 'react';
import { observer } from 'mobx-react';
import { Form, Input } from 'antd';

import CreatorFragments from '../CreatorFragments';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};

// TODO: check maxViews > minViews
const AddPage = ({ creator, form }) => (
  <Form>
    <Form.Item
      label="Адрес страницы"
      {...formItemLayout}
    >
      {form.getFieldDecorator('url', {
        rules: [
          { required: true, message: 'Введите адрес страницы' },
          { message: 'Неверный формат ссылки', type: 'url' },
        ],
        onChange: e => creator.setURL(e.target.value),
      })(<Input placeholder="https://www.the-answer.ru/questions/article-name/" style={{ width: 250 }} />)}
    </Form.Item>
    <CreatorFragments creator={creator} form={form} />
  </Form >
);

AddPage.propTypes = {

};

export default Form.create({
  mapPropsToFields({ creator }) {
    return {
      url: {
        value: creator.url,
      },
    };
  },
})(observer(AddPage));
