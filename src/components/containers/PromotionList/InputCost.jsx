import React, { Component } from 'react';
import ReactPropTypes from 'prop-types';
import { PropTypes, inject, observer } from 'mobx-react';
import { Table, Button } from 'antd';
import EditableCell from './EditableCell';

const metricName = {
  pageviews: 'Просмотры',
  pageDepth: 'Глубина просмотра',
  avgVisitDurationSeconds: 'Среднее время на сайте (в секундах)',
  bounceRate: 'Отказы %',
};

@inject('promotionStore') @observer
class InputCost extends Component {
  static propTypes = {
    promotionStore: ReactPropTypes.shape({
    }).isRequired,
  }

  componentDidMount() {
    const { pageID } = this.props;
    this.props.promotionStore.fetchMetrics(pageID);
  }


  onCellChange = (key, dataIndex) => (value) => {
    const dataSource = [...this.state.dataSource];
    const target = dataSource.find(item => item.key === key);
    if (target) {
      target[dataIndex] = value;
      this.setState({ dataSource });
    }
  };

  editableCell = (text, record) => (
    <EditableCell
      value={text}
      onChange={this.onCellChange(record.key, 'name')}
    />
  )

  render() {
    const { pageID } = this.props;
    // const data = this.props.promotionStore.yandexData.get(pageID) || [];
    const data = [
      {
        google: { clicks: 0, cost: 0 },
        facebook: { clicks: 0, cost: 0 },
        vk: { clicks: 0, cost: 0 },
        odnoklassniki: { clicks: 0, cost: 0 },
        yandex: { clicks: 0, cost: 0 },
      },
    ];

    const fields = ['google', 'facebook', 'vk', 'odnoklassniki', 'yandex'];
    const childItems = fields.map(field => (
      {
        title: field[0].toUpperCase() + field.substr(1),
        children: [
          {
            title: 'Кликов',
            dataIndex: `${field}.clicks`,
            render: this.editableCell,
          },
          {
            title: 'Потрачено',
            dataIndex: `${field}.cost`,
            render: this.editableCell,
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
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={data}
        size="small"
        pagination={false}
      />
    );
  }
}

export default InputCost;
