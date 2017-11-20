import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Select, Spin } from 'antd';
// TODO: Provider
import Filter from '../../stores/filter-store';

@observer
class SearchFilter extends Component {
  constructor(props) {
    super(props);
    this.pageFilter = Filter.create({
      length: this.props.length,
      url: this.props.url,
    }, {
      callback: this.props.callback,
    });
  }

  render() {
    return (
      <Select
        mode="multiple"
        labelInValue
        value={this.pageFilter.itemsData}
        placeholder={this.props.title}
        notFoundContent={this.pageFilter.state === 'done' ? <Spin size="small" /> : null}
        filterOption={false}
        onSearch={this.pageFilter.fetchData}
        onChange={this.pageFilter.setFilter}
        style={{ width: this.props.width }}
      >
        {this.pageFilter.data.map(page =>
          <Select.Option key={page.value}>{page.text}</Select.Option>,
        )}
      </Select>
    );
  }
}

SearchFilter.defaultProps = {
  width: 400,
  length: 1,
};

export default SearchFilter;
