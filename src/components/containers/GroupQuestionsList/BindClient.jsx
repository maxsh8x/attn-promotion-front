import React from 'react';
import { observer } from 'mobx-react';
import { Form } from 'antd';
import SearchFilter from '../SearchFilter';
import CreatorFragments from '../CreatorFragments';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};

// TODO: check maxViews > minViews
const BindClient = ({ clientsBinder, form }) => (
  <Form>
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
    <CreatorFragments creator={clientsBinder} form={form} />
  </Form>
);

BindClient.propTypes = {

};

export default Form.create()(observer(BindClient));
