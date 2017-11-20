import React, { Component } from 'react';
import { Table } from 'antd';
import { inject, observer } from 'mobx-react';
import style from '../../../style.css';
import ClientSearchFilter from '../SearchFilter';
import PageSelector from './PageSelector';
import CampaignSelector from './CampaignSelector';

@inject('reportSelectorStore') @observer
class ReportList extends Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        key: 'date',
        title: 'Дата',
        dataIndex: '',
        width: 100,
      },
      {
        key: 'yMetricViews',
        title: 'Просмотров в метрике',
        dataIndex: '',
        width: 100,
      },
      {
        title: 'Кликов',
        children: [
          {
            key: 'avgClicksSold',
            title: 'Куплено',
            dataIndex: '',
            width: 100,
          },
          {
            key: 'avgMoneySpent',
            title: 'Потрачено',
            dataIndex: '',
            width: 100,
          },
        ],
      },
      {
        title: 'Средняя цена',
        children: [
          {
            key: 'avgClickCost',
            title: 'Клик',
            dataIndex: '',
            width: 100,
          },
          {
            key: 'avgViewCost',
            title: 'Просмотр',
            dataIndex: '',
            width: 100,
          },
        ],
      },
    ];
  }

  render() {
    const {
      pageSelector,
      setClient,
    } = this.props.reportSelectorStore;

    return (
      <div>
        <div className={style.tableOperations}>
          <ClientSearchFilter
            title="Введите имя или бренд клиента для поиска"
            url="/v1/client/search"
            callback={setClient}
          />
          <PageSelector pageSelector={pageSelector} />
          <CampaignSelector />
        </div>
        <Table
          bordered
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
