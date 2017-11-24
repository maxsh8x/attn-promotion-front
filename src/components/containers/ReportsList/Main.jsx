import React, { Component } from 'react';
import { Table, Button } from 'antd';
import { inject, observer } from 'mobx-react';
import style from '../../../style.css';
import ClientSearchFilter from '../SearchFilter';
import PageSelector from './PageSelector';
import CampaignSelector from './CampaignSelector';

@inject('reportStore')
@inject('reportSelectorStore')
@observer
class ReportList extends Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        key: 'date',
        title: 'Дата',
        dataIndex: 'id',
        width: 100,
      },
      {
        key: 'yMetricViews',
        title: 'Просмотров в метрике',
        dataIndex: 'views',
        width: 100,
      },

      {
        key: 'avgClicksSold',
        title: 'Кликов куплено',
        dataIndex: 'clicks',
        width: 100,
      },
      {
        key: 'avgMoneySpent',
        title: 'Потрачено',
        dataIndex: 'cost',
        width: 100,
      },
      {
        title: 'Средняя цена',
        children: [
          {
            key: 'avgClickCost',
            title: 'Клик',
            dataIndex: '',
            width: 100,
            render: this.renderAvgClickCost,
          },
          {
            key: 'avgViewCost',
            title: 'Просмотр',
            dataIndex: '',
            width: 100,
            render: this.renderAvgViewCost,
          },
        ],
      },
    ];
  }

  getReport = () => {
    this.props.reportStore.fetchReport(this.props.reportSelectorStore.result);
  }

  renderAvgClickCost = (value, { cost, clicks }) =>
    ((cost && clicks)
      ? (cost / clicks).toFixed(2)
      : 0)

  renderAvgViewCost = (value, { cost, views }) => ((cost && views)
    ? (cost / views).toFixed(2)
    : 0)

  render() {
    const {
      pageSelector,
      setClient,
      filter,
    } = this.props.reportSelectorStore.clientSelector;
    const { campaignSelector } = pageSelector;
    const { reportData, settings, total, state } = this.props.reportStore;

    const data = reportData.length > 0
      ? [{ ...total, id: 'Всего' }, ...reportData]
      : [];

    return (
      <div>
        <div className={style.tableOperations}>
          <ClientSearchFilter
            title="Введите имя или бренд клиента для поиска"
            store={filter}
          />
          <PageSelector pageSelector={pageSelector} />
          <CampaignSelector campaignSelector={campaignSelector} />
          <Button
            disabled={campaignSelector.index === null}
            onClick={this.getReport}
          >
            Сформировать
          </Button>
        </div>
        <Table
          loading={state === 'pending'}
          className={style.reportTable}
          bordered
          rowKey="id"
          pagination={false}
          dataSource={data}
          title={() => 'Краткий отчет'}
          columns={this.columns}
        />
      </div>
    );
  }
}

ReportList.propTypes = {

};

export default ReportList;
