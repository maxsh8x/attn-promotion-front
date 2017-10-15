import React, { Component } from 'react';
import { PropTypes, inject, observer } from 'mobx-react';
import { Select } from 'antd';

@observer
class QuestionTypeSelector extends Component {
  componentWillMount() {
    this.props.onChange('individual');
  }

  render() {
    return (
      <Select defaultValue="individual" style={{ width: 140 }} onChange={this.props.onChange}>
        <Select.Option value="individual">Индивидуальный</Select.Option>
        <Select.Option value="group">Групповой</Select.Option>
      </Select>
    );
  }
}

export default QuestionTypeSelector;
