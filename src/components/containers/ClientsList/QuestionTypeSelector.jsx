import React, { Component } from 'react';
import { Select } from 'antd';

class QuestionTypeSelector extends Component {
  render() {
    return (
      <Select defaultValue="individual" style={{ width: 140 }}>
        <Select.Option value="individual">Индивидуальный</Select.Option>
        <Select.Option value="group">Групповой</Select.Option>
      </Select>
    );
  }
}

export default QuestionTypeSelector;
