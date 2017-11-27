import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Table, Button, Popover, Icon } from 'antd';
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
    this.props.metricsWidget.fetchMetrics();
  }

  render() {
    const {
      store,
      metricsData,
      totalClickCost,
      updateMetrics,
      state,
      startDate,
      endDate,
      setDate,
      popoverShown,
      togglePopover,
    } = this.props.metricsWidget;
    const metricsCostColumns = store.sources.map(network => ({
      key: network,
      dataIndex: `sources.${network}`,
      title: network[0].toUpperCase() + network.substr(1),
    }));


    const TableTitle = (<Popover
      visible={popoverShown}
      content={
        <div className={style.headerOperations}>
          <Period
            startDate={startDate}
            endDate={endDate}
            setDate={setDate}
            label=""
          />
          <Button onClick={updateMetrics}>
            <Icon type="reload" />
            Обновить из метрики
          </Button>
        </div>
      }
      trigger="click"
    >
      <a
        role="button"
        tabIndex={0}
        onClick={togglePopover}
      >
        Обновить
      </a>
    </Popover>);

    const columns = [
      {
        title: <span>Данные яндекс метрики ({TableTitle})</span>,
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
          loading={state === 'pending'}
          bordered
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
