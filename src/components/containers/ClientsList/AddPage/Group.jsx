import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Select, Form, Spin } from 'antd';
// TODO: Provider
import { PageFilter } from '../../../../stores/filter-store';

@observer
class Group extends Component {
  constructor(props) {
    super(props);
    this.pageFilter = PageFilter.create({});
  }

  render() {
    return (
      <Form>
        <Select
          mode="multiple"
          labelInValue
          value={this.pageFilter.filter.toJS()}
          placeholder="Select users"
          notFoundContent={this.pageFilter.state === 'done' ? <Spin size="small" /> : null}
          filterOption={false}
          onSearch={this.pageFilter.fetchPages}
          onChange={this.pageFilter.setFilter}
          style={{ width: '100%' }}
        >
          {this.pageFilter.pages.map(page =>
            <Select.Option key={page.id}>{page.url}</Select.Option>,
          )}
        </Select>
      </Form>
    );
  }
}

export default Group;
