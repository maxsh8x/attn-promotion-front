import React, { Component } from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import { Table, Badge } from 'antd';
import style from '../../../style.css';
import permissions from '../../../utils/permissions';


@observer
class QuestionList extends Component {
  componentWillMount() {
    this.props.groupQuestion.fetchClients();
  }

  setPagination = ({ current, pageSize }) =>
    this.props.groupQuestion.setPagination(current, pageSize);

  renderDate = value => moment(value).format('YYYY-MM-DD')

  renderViews = (value, row, rowIndex) => {
    const client = this.props.groupQuestion.clients[rowIndex];
    const views = client.question.views;
    const badgeStyle = value <= views
      ? { backgroundColor: '#87d068' }
      : {};
    return (<Badge
      count={value}
      style={badgeStyle}
      overflowCount={99999999}
      showZero
    />);
  }

  renderPeriodCost = (k, { costPerClick }, rowIndex) => {
    const client = this.props.groupQuestion.clients[rowIndex];
    const views = client.question.views;
    return costPerClick * views;
  }

  renderCampaignCost = (k, { views, costPerClick }) =>
    costPerClick * views;


  renderRowClassName = (now, { startDate, endDate }) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    if (start <= now && now <= end) {
      return style.rowStarted;
    } else if (start > now) {
      return style.rowWaited;
    }
    return style.rowDone;
  }

  render() {
    const {
      clientsData,
      views,
      state,
      current,
      total,
      settings,
    } = this.props.groupQuestion;
    const {
      pageSize,
      header,
    } = settings;

    const columns = [
      {
        dataIndex: 'name',
        title: 'Имя',
        width: 250,
      },
      {
        dataIndex: 'vatin',
        title: 'Инн',
        width: 250,
      },
      {
        dataIndex: 'brand',
        title: 'Бренд',
        width: 250,
      },
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
            title: 'Цена',
            children: [
              {
                key: 'costPerClick',
                dataIndex: 'costPerClick',
                title: 'Продажи',
                width: 110,
              },
              {
                key: 'targetClickCost',
                dataIndex: 'targetClickCost',
                title: 'Плановая',
                width: 110,
              },
            ],
          },
          {
            key: 'campaignPeriod',
            title: 'Стоимость',
            render: this.renderCampaignCost,
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

    if (permissions(['root', 'buchhalter'])) {
      columns.push({
        key: 'periodCost',
        title: 'Стоимость за период',
        render: this.renderPeriodCost,
        width: 200,
      });
    }

    const paginationParams = { current, pageSize, total };
    const now = new Date().getTime();
    return (
      <div>
        <Table
          loading={state === 'pending'}
          bordered
          size="small"
          rowKey="id"
          columns={columns}
          showHeader={header}
          dataSource={clientsData}
          onChange={this.setPagination}
          pagination={settings.paginate ? paginationParams : false}
          rowClassName={row => this.renderRowClassName(now, row)}
        />
      </div>
    );
  }
}

QuestionList.propTypes = {

};

export default QuestionList;
