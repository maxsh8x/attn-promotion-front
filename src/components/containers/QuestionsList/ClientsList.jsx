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

  setPagination = ({ current, pageSize }) =>
    this.props.groupQuestion.setPagination(current, pageSize);

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
      footer,
      controls,
    } = settings;

    const columns = [
      { dataIndex: 'name', title: 'Имя' },
      { dataIndex: 'vatin', title: 'Инн' },
      { dataIndex: 'brand', title: 'Бренд' },
      {
        title: 'Цена',
        children: [
          { key: 'costPerClick', dataIndex: 'costPerClick', title: 'Клик' },
          { key: 'tablePeriod', title: 'За выбранный период', render: this.renderPeriodCost },
          { key: 'campaignPeriod', title: 'За время кампании', render: this.renderCampaignCost },
        ],
      },
      {
        title: 'Кампания',
        children: [
          { key: 'startDate', title: 'Начало', dataIndex: 'startDate', render: this.renderDate },
          { key: 'endDate', title: 'Конец', dataIndex: 'endDate', render: this.renderDate },
          { key: 'views', title: 'Просмотров', dataIndex: 'views' },
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

        {controls &&
          <div className={style.tableOperations}>
            {permissions(['root']) &&
              <Button onClick={clientsBinder.toggleModal}>Привязать клиентов</Button>
            }
          </div>
        }
        <Table
          loading={state === 'pending'}
          bordered
          size="small"
          rowKey="id"
          columns={columns}
          showHeader={header}
          dataSource={clientsData}
          onChange={this.setPagination}
          pagination={settings.paginate && paginationParams}
          footer={footer ? () => <InfoBadges /> : null}
          rowClassName={row => this.renderRowClassName(now, row)}
        />
      </div>
    );
  }
}

QuestionList.propTypes = {

};

export default QuestionList;
