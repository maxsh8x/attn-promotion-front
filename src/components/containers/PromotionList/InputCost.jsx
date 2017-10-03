import React, { Component } from 'react';
import ReactPropTypes from 'prop-types';
import { toJS } from 'mobx';
import { PropTypes, inject, observer } from 'mobx-react';
import { Table, Button, Spin } from 'antd';
import EditableCell from './EditableCell';

@inject('promotionStore') @observer
class InputCost extends Component {
  static propTypes = {
    promotionStore: ReactPropTypes.shape({
    }).isRequired,
  }

  editableCell = (field, type, value) => {
    return (
      <EditableCell
        field={field}
        type={type}
        value={value}
        pageID={this.props.pageID}
        rowIndex={this.props.rowIndex}
      />
    );
  }

  render() {
    const { pageID, rowIndex } = this.props;
    const data = this.props.promotionStore.data[rowIndex].metrics;
    const spinning = this.props.promotionStore.states.fetchMetrics !== 'success';
    const fields = ['google', 'facebook', 'vk', 'odnoklassniki', 'yandex'];
    const childItems = fields.map(field => (
      {
        title: field[0].toUpperCase() + field.substr(1),
        children: [
          {
            title: 'Кликов',
            dataIndex: `${field}.clicks`,
            render: value => (this.editableCell(field, 'clicks', value)),
          },
          {
            title: 'Потрачено',
            dataIndex: `${field}.cost`,
            render: value => (this.editableCell(field, 'cost', value)),
          },
        ],
      }
    ));
    const columns = [
      {
        title: 'Ввод данных',
        children: childItems,
      },
    ];

    return (
      <Spin spinning={spinning}>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={data ? [toJS({ ...data, _id: pageID })] : []}
          size="small"
          pagination={false}
        />
      </Spin>
    );
  }
}

export default InputCost;
