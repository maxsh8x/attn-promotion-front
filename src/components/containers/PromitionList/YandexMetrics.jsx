import React, { Component } from 'react';
import ReactPropTypes from 'prop-types';
import { PropTypes, inject, observer } from 'mobx-react';
import { Table, Button } from 'antd';

const metricName = {
  pageviews: 'Просмотры',
  pageDepth: 'Глубина просмотра',
  avgVisitDurationSeconds: 'Среднее время на сайте (в секундах)',
  bounceRate: 'Отказы %'
}

@inject('promotionStore') @observer
class YandexMetrics extends Component {
  static propTypes = {
    promotionStore: ReactPropTypes.shape({
    }).isRequired,
  }

  componentDidMount() {
    const { pageID } = this.props;
    this.props.promotionStore.fetchMetrics(pageID);
  }


  render() {
    const { pageID } = this.props;
    const data = this.props.promotionStore.yandexData.get(pageID) || [];
    const columns = [
      { dataIndex: 'metric', title: 'Метрика', render: metric => metricName[metric] },
      { dataIndex: 'google', title: 'Google' },
      { dataIndex: 'facebook', title: 'Facebook' },
      { dataIndex: 'vk', title: 'Vk' },
      { dataIndex: 'instagram', title: 'Instagram' },
      { dataIndex: 'yandex', title: 'Yandex' },
    ];
    return <Table rowKey="_id" columns={columns} dataSource={data} size="small" pagination={false} />;
  }
}

export default YandexMetrics;
