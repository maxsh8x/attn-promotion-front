import React, { Component } from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import { Button, Modal, Table, Badge } from 'antd';
import BindClient from './BindClient';
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
      clientsBinder,
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
      { dataIndex: 'name', title: 'Имя' },
      { dataIndex: 'vatin', title: 'Инн' },
      { dataIndex: 'brand', title: 'Бренд' },
      {
        title: 'Кампания',
        children: [
          { key: 'startDate', title: 'Начало', dataIndex: 'startDate', render: this.renderDate },
          { key: 'endDate', title: 'Конец', dataIndex: 'endDate', render: this.renderDate },
          { key: 'views', title: 'Просмотров', dataIndex: 'views' },
          { key: 'costPerClick', dataIndex: 'costPerClick', title: 'Цена за клик' },
          { key: 'campaignPeriod', title: 'Стоимость', render: this.renderCampaignCost },
        ],
      },
      {
        title: 'Показы',
        children: [
          { key: 'minViews', title: 'Min', dataIndex: 'minViews', render: this.renderViews },
          { key: 'maxViews', title: 'Max', dataIndex: 'maxViews', render: this.renderViews },
        ],
      },
    ];

    if (permissions(['root', 'buchhalter'])) {
      columns.push({ key: 'periodCost', title: 'Стоимость за период', render: this.renderPeriodCost });
    }

    const paginationParams = { current, pageSize, total };
    const now = new Date().getTime();
    return (
      <div>
        <Modal
          visible={clientsBinder.modalShown}
          title="Информация о клиенте"
          footer={null}
          onCancel={clientsBinder.toggleModal}
        >
          <BindClient clientsBinder={clientsBinder} />
        </Modal>
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
