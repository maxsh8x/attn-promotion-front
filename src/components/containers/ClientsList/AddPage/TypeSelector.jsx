import React from 'react';
import { Select } from 'antd';
import { observer } from 'mobx-react';

const TypeSelector = ({ value, onChange }) => (
  <Select value={value} style={{ width: 140 }} onChange={onChange}>
    <Select.Option value="group">Групповой</Select.Option>
    <Select.Option value="individual">Индивидуальный</Select.Option>
  </Select>
);

TypeSelector.propTypes = {

};

export default observer(TypeSelector);
