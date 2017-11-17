import React, { Component } from 'react';
import { Table } from 'antd';
import { inject, observer } from 'mobx-react';

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
        <Table
          bordered
          columns={this.columns}
        />
      </div>
    );
  }
}

ReportList.propTypes = {

};

export default ReportList;
