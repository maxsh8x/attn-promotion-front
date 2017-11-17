import React, { Component } from 'react';
import { Table } from 'antd';
import { inject, observer } from 'mobx-react';
import style from '../../../style.css';
import ClientSearchFilter from '../SearchFilter';
import PageSelector from './PageSelector';
import CampaignSelector from './CampaignSelector';

@inject('reportsStore') @observer
class ReportList extends Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: 'Дата',
        dataIndex: '',
        width: 100,
      },
      {
        title: 'Просмотров в метрике',
        dataIndex: '',
        width: 100,
      },
      {
        title: 'Кликов',
        children: [
          {
            title: 'Куплено',
            dataIndex: '',
            width: 100,
          },
          {
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
            title: 'Клик',
            dataIndex: '',
            width: 100,
          },
          {
            title: 'Просмотр',
            dataIndex: '',
            width: 100,
          },
        ],
      },
    ];
  }

  render() {
    return (
      <div>
        <div className={style.tableOperations}>
          <ClientSearchFilter
            title="Введите имя или бренд клиента для поиска"
            url="/v1/client/search"
          />
          <PageSelector />
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
