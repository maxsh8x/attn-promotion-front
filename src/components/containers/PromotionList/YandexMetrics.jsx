import React, { Component } from 'react';
import ReactPropTypes from 'prop-types';
import { PropTypes, inject, observer } from 'mobx-react';
import { Table, Spin } from 'antd';

const metricName = {
  pageviews: 'Просмотры',
  pageDepth: 'Глубина просмотра',
  avgVisitDurationSeconds: 'Среднее время на сайте (в секундах)',
  bounceRate: 'Отказы %',
};

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
    const { pageID, rowIndex } = this.props;
    const data = this.props.promotionStore.yandexData.get(pageID) || [];
    const totalCost = this.props.promotionStore.data[rowIndex].total.cost;
    const spinning = this.props.promotionStore.states.fetchMetrics !== 'success';
    // TODO: generator
    const columns = [
      {
        title: 'Данные яндекс метрики',
        children: [
          { dataIndex: 'metric', title: 'Метрика', render: metric => metricName[metric] },
          { dataIndex: 'google', title: 'Google' },
          { dataIndex: 'facebook', title: 'Facebook' },
          { dataIndex: 'vk', title: 'Vk' },
          { dataIndex: 'odnoklassniki', title: 'Odnoklassniki' },
          { dataIndex: 'yandex', title: 'Yandex' },
          { dataIndex: 'ad', title: 'Реклама всего' },
          { dataIndex: 'social', title: 'Социальные сети' },
          { dataIndex: 'referral', title: 'Ссылки на сайт' },
          { dataIndex: 'internal', title: 'Внутренние переходы' },
          { dataIndex: 'direct', title: 'Прямые заходы' },
          { dataIndex: 'total', title: 'Итого' },
        ],
      },
    ];

    // TODO: generator
    // TODO: cache value
    const targetFields = ['google', 'facebook', 'vk', 'odnoklassniki', 'yandex'];
    let totalClickCost = 0;
    if (data.length > 0) {
      let totalViews = 0;
      for (let i = 0; i < targetFields.length; i++) {
        totalViews += data[0][targetFields[i]] || 0;
      }
      if (totalCost && totalViews) {
        totalClickCost = (totalCost / totalViews).toFixed(2);
      }
    }

    return (
      <Spin spinning={spinning}>
        <Table
          rowKey="metric"
          columns={columns}
          dataSource={data}
          size="small"
          pagination={false}
          footer={() => `Стоимость за клик: ${totalClickCost}`}
        />
      </Spin>
    );
  }
}

export default YandexMetrics;
