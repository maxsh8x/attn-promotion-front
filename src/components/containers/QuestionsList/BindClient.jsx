import React from 'react';
import moment from 'moment';
import { observer } from 'mobx-react';
import { Form, Spin } from 'antd';
import SearchFilter from '../SearchFilter';
import CreatorFragments from '../CreatorFragments';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};

// TODO: check maxViews > minViews
const BindClient = ({ clientsBinder, form }) => (
  <Spin spinning={clientsBinder.state === 'pending'}>
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
  </Spin>
);

BindClient.propTypes = {

};

export default Form.create({
  mapPropsToFields({ clientsBinder }) {
    return {
      minViews: {
        value: clientsBinder.minViews,
      },
      maxViews: {
        value: clientsBinder.maxViews,
      },
      dateRange: {
        value: [
          moment(clientsBinder.startDate, 'YYYY-MM-DD'),
          moment(clientsBinder.endDate, 'YYYY-MM-DD'),
        ],
      },
    };
  },
})(observer(BindClient));
