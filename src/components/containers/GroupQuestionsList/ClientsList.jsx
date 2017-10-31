import React, { Component } from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import { Button, Modal, Table, Badge } from 'antd';
import BindClient from './BindClient';
import style from '../../../style.css';
import permissions from '../../../utils/permissions';
import InfoBadges from '../InfoBadges';


@observer
class QuestionList extends Component {
  componentWillMount() {
    this.props.groupQuestion.fetchClients();
  }

  renderDate = value => moment(value).format('YYYY-MM-DD')

  renderViews = (value) => {
    const { views } = this.props.groupQuestion;
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
    const { clientsData, clientsBinder, views } = this.props.groupQuestion;
    const columns = [
      { dataIndex: 'name', title: 'Имя' },
      { dataIndex: 'vatin', title: 'Инн' },
      { dataIndex: 'brand', title: 'Бренд' },
      {
        title: 'Цена',
        children: [
          { key: 'costPerClick', dataIndex: 'costPerClick', title: 'Клик' },
          { key: 'period', title: 'Период', render: this.renderPeriodCost },
        ],
      },
      {
        title: 'Дата',
        children: [
          { key: 'startDate', title: 'От', dataIndex: 'startDate', render: this.renderDate },
          { key: 'endDate', title: 'До', dataIndex: 'endDate', render: this.renderDate },
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
        {permissions(['root']) &&
          <div className={style.tableOperations}>
            <Button onClick={clientsBinder.toggleModal}>Привязать клиентов</Button>
          </div>}
        <Table
          bordered
          size="small"
          rowKey="id"
          columns={columns}
          dataSource={clientsData}
          pagination={false}
          footer={() => <InfoBadges />}
          rowClassName={row => this.renderRowClassName(now, row)}
        />
      </div>
    );
  }
}

QuestionList.propTypes = {

};

export default QuestionList;
