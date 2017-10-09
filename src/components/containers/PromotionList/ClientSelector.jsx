import React, { Component } from 'react';
import { Select, Spin } from 'antd';
import debounce from 'lodash.debounce';
import { PropTypes, inject, observer } from 'mobx-react';
import style from './ClientSelector.css';

const Option = Select.Option;

@inject('clientSelectorStore') @observer
class ClientSelector extends Component {
  constructor(props) {
    super(props);
    this.fetchClients = debounce(this.fetchClients.bind(this), 800);
    this.changeSelect = this.changeSelect.bind(this);
  }
  fetchClients(value) {
    this.props.clientSelectorStore.fetchClients(value);
  }

  changeSelect(value) {
    this.props.clientSelectorStore.changeSelect(value);
  }

  render() {
    const { state, data, clients } = this.props.clientSelectorStore;
    return (
      <Select
        mode="multiple"
        labelInValue
        value={clients.toJS()}
        placeholder="Введите имя клиента"
        notFoundContent={state !== 'success' ? <Spin size="small" /> : null}
        filterOption={false}
        onSearch={this.fetchClients}
        onChange={this.changeSelect}
        className={style.inputField}
      >
        {data.toJS().map(d => <Option key={d.value}>{d.text}</Option>)}
      </Select>
    );
  }
}

export default ClientSelector;
