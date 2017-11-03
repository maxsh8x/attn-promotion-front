import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Table, Button, Spin, Icon } from 'antd';

const metricName = {
  pageviews: 'Просмотры',
  pageDepth: 'Глубина просмотра',
  avgVisitDurationSeconds: 'Среднее время на сайте (в секундах)',
  bounceRate: 'Отказы %',
};


@observer
class YandexMetrics extends Component {
  componentWillMount() {
    this.props.page.fetchMetrics();
  }

  render() {
    const {
      store,
      metricsData,
      totalClickCost,
      updateMetrics,
      fetchMetricsState
    } = this.props.page;
    const { date } = this.props.page.store;
    const metricsCostColumns = store.sources.map(network => ({
      key: network,
      dataIndex: `sources.${network}`,
      title: network[0].toUpperCase() + network.substr(1),
    }));

    const columns = [
      {
        title: 'Данные яндекс метрики',
        children: [
          { dataIndex: 'metric', title: 'Метрика', render: metric => metricName[metric] },
          {
            title: 'Источники рекламы',
            children: metricsCostColumns,
          },
          {
            title: 'Метагруппы',
            children: [
              { dataIndex: 'metagroups.ad', title: 'Реклама всего' },
              { dataIndex: 'metagroups.social', title: 'Социальные сети' },
              { dataIndex: 'metagroups.referral', title: 'Ссылки на сайт' },
              { dataIndex: 'metagroups.internal', title: 'Внутренние переходы' },
              { dataIndex: 'metagroups.direct', title: 'Прямые заходы' },
            ],
          },
          { dataIndex: 'metagroups.total', title: 'Итого' },
        ],
      },
    ];

    // popup
    return (
      <div>
        <Spin spinning={fetchMetricsState === 'pending'}>
          <Table
            bordered
            title={() => (
              <Button onClick={updateMetrics}>
                <Icon type="reload" />
                Обновить данные за {date}
              </Button>
            )}
            rowKey="metric"
            columns={columns}
            dataSource={metricsData}
            size="small"
            pagination={false}
            footer={() => `Стоимость за клик: ${totalClickCost}`}
          />
        </Spin>
      </div>
    );
  }
}

YandexMetrics.propTypes = {

};

export default YandexMetrics;
