import React from 'react';
import { Select } from 'antd';

const PageSelector = ({ data = [] }) => (
  <Select
    showSearch
    style={{ width: 400 }}
    placeholder="Введите название страницы клиента"
    optionFilterProp="children"
    filterOption={
      (input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
    }
  >
    {data.map(item => <Select.Option value={item.key}>{item.value}</Select.Option>)}
  </Select>
);

PageSelector.propTypes = {

};

export default PageSelector;
