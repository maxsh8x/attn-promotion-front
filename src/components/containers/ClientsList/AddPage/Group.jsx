import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Select, Form, Spin } from 'antd';
// TODO: Provider
import Filter from '../../../../stores/filter-store';

@observer
class Group extends Component {
  constructor(props) {
    super(props);
    const x = data => console.log(data, 'raised');
    this.pageFilter = Filter.create({}, {
      url: '/v1/page/search',
      fetch: x,
    });
  }

  render() {
    return (
      <Select
        mode="multiple"
        labelInValue
        value={this.pageFilter.itemsData}
        placeholder="Введите страницу для поиска"
        notFoundContent={this.pageFilter.state === 'done' ? <Spin size="small" /> : null}
        filterOption={false}
        onSearch={this.pageFilter.fetchData}
        onChange={this.pageFilter.setFilter}
        style={{ width: 400 }}
      >
        {this.pageFilter.data.map(page =>
          <Select.Option key={page.value}>{page.text}</Select.Option>,
        )}
      </Select>
    );
  }
}

export default Group;
