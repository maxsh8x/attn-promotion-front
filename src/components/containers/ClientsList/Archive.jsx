import React, { Component } from 'react';
import moment from 'moment';
import { Table } from 'antd';
import { observer } from 'mobx-react';

@observer
class ClientsList extends Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        title: 'Кампания',
        children: [
          {
            key: 'startDate',
            title: 'Начало',
            dataIndex: 'startDate',
            render: this.renderDate,
            width: 110,
          },
          {
            key: 'endDate',
            title: 'Конец',
            dataIndex: 'endDate',
            render: this.renderDate,
            width: 110,
          },
          {
            key: 'costPerClick',
            dataIndex: 'costPerClick',
            title: 'Цена за клик',
            width: 110,
          },
        ],
      },
      {
        title: 'Показы',
        children: [
          {
            key: 'minViews',
            title: 'Min',
            dataIndex: 'minViews',
            render: this.renderViews,
            width: 60,
          },
          {
            key: 'maxViews',
            title: 'Max',
            dataIndex: 'maxViews',
            render: this.renderViews,
            width: 60,
          },
        ],
      },
    ];
  }

  componentWillMount() {
    this.props.page.fetchArchive();
  }

  renderDate = value => moment(value).format('YYYY-MM-DD')

  render() {
    const { archiveData } = this.props.page;
    return (
      <div>
        <Table
          dataSource={archiveData}
          columns={this.columns}
          rowKey="id"
          size="small"
          pagination={false}
          title={() => 'Список архивных данных'}
        />
      </div>
    );
  }
}

ClientsList.propTypes = {

};

export default ClientsList;
