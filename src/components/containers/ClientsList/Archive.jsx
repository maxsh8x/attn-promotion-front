import React, { Component } from 'react';
import moment from 'moment';
import { Table, Button } from 'antd';
import { observer } from 'mobx-react';
import permissions from '../../../utils/permissions';

@observer
class ClientsList extends Component {
  constructor(props) {
    super(props);
    const additionalFields = [];
    if (permissions(['root', 'buchhalter'])) {
      additionalFields.push(
        {
          title: 'Выбранный период',
          children: [
            {
              key: 'periodViews',
              title: 'Просмотры',
              dataIndex: 'viewsPeriod',
              width: 100,
            },
            {
              key: 'periodCost',
              title: 'Стоимость',
              render: this.renderPeriodCost,
              width: 100,
            },
          ],
        },
      );
    }
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
            key: 'views',
            title: 'Просмотров',
            dataIndex: 'views',
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
      ...additionalFields,
      {
        key: 'actions',
        width: 40,
        render: this.renderActions,
      },
    ];
  }

  componentWillMount() {
    this.props.page.fetchArchive();
  }

  renderDate = value => moment(value).format('YYYY-MM-DD')

  renderActions = (value, { id }) => (
    <Button icon="to-top" onClick={() => this.props.page.archiveToMeta(id)} />
  );

  render() {
    const { archiveData, archiveState } = this.props.page;
    return (
      <div>
        <Table
          loading={archiveState === 'pending'}
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
