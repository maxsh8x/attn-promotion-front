import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Table } from 'antd';


const metricName = {
  pageviews: 'Просмотры',
  pageDepth: 'Глубина просмотра',
  avgVisitDurationSeconds: 'Среднее время на сайте (в секундах)',
  bounceRate: 'Отказы %',
};


@observer
class YandexMetricsPeriod extends Component {
  componentWillMount() {
    this.props.metricsWidgetPeriod.init();
  }

  renderNumber = value => value && Number(value.toFixed(2))

  render() {
    const {
      store,
      metricsData,
      totalClickCost,
      state,
    } = this.props.metricsWidgetPeriod;
    const { metricsPeriodSelector: { startDate, endDate } } = store;
    const metricsCostColumns = store.sources.map(network => ({
      key: network,
      dataIndex: `sources.${network}`,
      title: network[0].toUpperCase() + network.substr(1),
      render: this.renderNumber,
    }));

    const columns = [
      {
        title: <span>Данные яндекс метрики за {startDate} - {endDate}</span>,
        children: [
          { dataIndex: 'metric', title: 'Метрика', render: metric => metricName[metric] },
          {
            title: 'Источники рекламы',
            children: metricsCostColumns,
          },
          {
            title: 'Метагруппы',
            children: [
              { dataIndex: 'metagroups.ad', title: 'Реклама всего', render: this.renderNumber },
              { dataIndex: 'metagroups.social', title: 'Социальные сети', render: this.renderNumber },
              { dataIndex: 'metagroups.referral', title: 'Ссылки на сайт', render: this.renderNumber },
              { dataIndex: 'metagroups.internal', title: 'Внутренние переходы', render: this.renderNumber },
              { dataIndex: 'metagroups.direct', title: 'Прямые заходы', render: this.renderNumber },
            ],
          },
          { dataIndex: 'metagroups.total', title: 'Итого', render: this.renderNumber },
        ],
      },
    ];

    // popup
    return (
      <Table
        loading={state === 'pending'}
        bordered
        rowKey="metric"
        columns={columns}
        dataSource={metricsData}
        size="small"
        pagination={false}
      />
    );
  }
}

YandexMetricsPeriod.propTypes = {

};

export default YandexMetricsPeriod;
