import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Table, Button, Icon } from 'antd';
import Period from '../Period';
import style from '../../../style.css';


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
      fetchMetricsState,
      startDate,
      endDate,
      setDate,
    } = this.props.page;
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
        <Table
          loading={fetchMetricsState === 'pending'}
          bordered
          title={() => (
            <div className={style.headerOperations}>
              <Period
                startDate={startDate}
                endDate={endDate}
                setDate={setDate}
                label="Подсчет просмотров за период"
              />
              <Button onClick={updateMetrics}>
                <Icon type="reload" />
                Обновить данные
              </Button>
              <div style={{ float: 'right' }}>
              </div>
            </div>
          )}
          rowKey="metric"
          columns={columns}
          dataSource={metricsData}
          size="small"
          pagination={false}
          footer={() => `Стоимость за клик: ${totalClickCost}`}
        />
      </div>
    );
  }
}

YandexMetrics.propTypes = {

};

export default YandexMetrics;
