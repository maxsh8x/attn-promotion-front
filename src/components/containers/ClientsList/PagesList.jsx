import React, { Component } from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import { Table, Switch, Modal, Badge } from 'antd';
import style from '../../../style.css';
import AddPage from './AddPage';
import permissions from '../../../utils/permissions';
import shallowCompare from '../../../utils/helper';
import { answerURL } from '../../../constants';
import TextWithDots from '../TextWithDots';

const typeNames = {
  individual: 'Индивидуальный',
  group: 'Групповой',
};

@observer
class PagesList extends Component {
  constructor(props) {
    super(props);
    this.basicColumns = [
      {
        dataIndex: 'active',
        title: 'Статус',
        render: active => <Switch checked={active} />,
      },
      {
        dataIndex: 'title',
        title: 'Название',
        render: this.renderPageURL,
      },
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
      this.basicColumns.push({ key: 'periodCost', title: 'Стоимость за период', render: this.renderPeriodCost });
    }
  }

  componentWillMount() {
    this.props.client.fetchPages();
  }

  componentWillReceiveProps({ dates }) {
    if (!(shallowCompare(dates, this.props.dates))) {
      this.props.client.fetchPages();
    }
  }

  setPagination = ({ current, pageSize }) =>
    this.props.client.setPagination(current, pageSize);

  expandedRowRender = ({ id, type }) => {
    if (type === 'group') {
      const { client } = this.props;
      const page = client.findPageById(id);
      return (
        <div>
          <Table
            rowKey="id"
            columns={this.basicColumns}
            dataSource={page.pagesData}
            size="small"
            pagination={false}
            title={() => 'Список страниц группового вопроса'}
          />
        </div>
      );
    }
    return null;
  }
  renderPageURL = (title, { url }) =>
    (<a href={answerURL + url}>
      <TextWithDots text={title} length={80} />
    </a>);

  renderDate = value => moment(value).format('YYYY-MM-DD')

  renderViews = (value, { views }) => {
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

  renderPeriodCost = (k, { views, costPerClick }) => costPerClick * views;

  render() {
    const {
      fetchPagesState,
      pageCreator,
      pagesData,
      current,
      pageSize,
      total,
    } = this.props.client;
    const spinning = !(fetchPagesState === 'done');

    const columns = this.basicColumns.concat([
      {
        dataIndex: 'type',
        title: 'Тип',
        render: type => typeNames[type],
      },
    ]);

    const paginationParams = { current, pageSize, total };
    const now = new Date().getTime();
    return (
      <div>
        <Modal
          visible={pageCreator.modalShown}
          title="Информация о странице"
          footer={null}
          onCancel={pageCreator.toggleModal}
        >
          <AddPage creator={pageCreator} />
        </Modal>
        <Table
          loading={spinning}
          bordered
          rowKey="id"
          columns={columns}
          dataSource={pagesData}
          size="small"
          title={() => 'Список страниц клиента'}
          expandedRowRender={this.expandedRowRender}
          onChange={this.setPagination}
          pagination={paginationParams}
          rowClassName={row => this.renderRowClassName(now, row)}
        />
      </div>
    );
  }
}

export default PagesList;
