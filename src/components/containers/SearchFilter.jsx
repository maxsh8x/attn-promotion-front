import React from 'react';
import { observer } from 'mobx-react';
import { Select, Spin } from 'antd';

const SearchFilter = ({ store, title, width }) => (<Select
  mode="multiple"
  labelInValue
  value={store.itemsData}
  placeholder={title}
  notFoundContent={store.state === 'pending' ? <Spin size="small" /> : null}
  filterOption={false}
  onSearch={store.fetchData}
  onChange={store.setFilter}
  style={{ width }}
>
  {store.data.map(page =>
    <Select.Option key={page.value}>{page.text}</Select.Option>,
  )}
</Select>
);

SearchFilter.defaultProps = {
  width: 400,
};

export default observer(SearchFilter);
