import React, { Component } from 'react';
import ReactPropTypes from 'prop-types';
import { PropTypes, inject, observer } from 'mobx-react';
import { Table, Button, Spin } from 'antd';

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
    const { pageID } = this.props;
    const data = this.props.promotionStore.yandexData.get(pageID);
    // const spinning = typeof data === 'undefined';
    const spinning = this.props.promotionStore.states.fetchMetrics !== 'success';
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
    return (
      <Spin spinning={spinning}>
        <Table
          rowKey="_id"
          columns={columns}
          dataSource={data || []}
          size="small"
          pagination={false}
          footer={() => 'Стоимость за клик: 0'}
        />
      </Spin>
    );
  }
}

export default YandexMetrics;
