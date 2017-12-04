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
class YandexMetricsDay extends Component {
  componentWillMount() {
    this.props.metricsWidgetDay.fetchMetrics();
  }

  renderNumber = value => value && Number(value.toFixed(2))

  render() {
    const {
      store,
      metricsData,
      totalClickCost,
      updateMetrics,
      removeMetrics,
      state,
      startDate,
      endDate,
      setDate,
      popoverShown,
      togglePopover,
    } = this.props.metricsWidgetDay;
    const metricsCostColumns = store.sources.map(network => ({
      key: network,
      dataIndex: `sources.${network}`,
      title: network[0].toUpperCase() + network.substr(1),
      render: this.renderNumber,
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
          <Button onClick={removeMetrics}>
            <Icon type="delete" />
            Удалить метрики
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
        title: <span>Данные яндекс метрики за {store.date} ({TableTitle})</span>,
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
        style={{ marginBottom: '8px' }}
        loading={state === 'pending'}
        bordered
        rowKey="metric"
        columns={columns}
        dataSource={metricsData}
        size="small"
        pagination={false}
        footer={() => `Стоимость за клик: ${totalClickCost}`}
      />
    );
  }
}

YandexMetricsDay.propTypes = {

};

export default YandexMetricsDay;
