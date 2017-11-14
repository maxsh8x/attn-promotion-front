import React, { Component } from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import { Table, Switch, Modal, Badge, Icon } from 'antd';
import style from '../../../style.css';
import permissions from '../../../utils/permissions';
import shallowCompare from '../../../utils/helper';
import { answerURL } from '../../../constants';
import TextWithDots from '../TextWithDots';

const typeNames = {
  individual: <Icon type="user" style={{ fontSize: 16, color: '#ffbf00' }} />,
  group: <Icon type="team" style={{ fontSize: 16, color: '#7265e6' }} />,
};

@observer
class PagesList extends Component {
  constructor(props) {
    super(props);
    this.columns = [
      {
        dataIndex: 'type',
        title: 'Тип',
        render: type => typeNames[type],
      },
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
      this.columns.push(
        {
          title: 'Выбранный период',
          children: [
            { key: 'periodViews', title: 'Просмотры', dataIndex: 'viewsPeriod' },
            { key: 'periodCost', title: 'Стоимость', render: this.renderPeriodCost },
          ],
        },
      );
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

  expandedRowRender = ({ id, type }, rowIndex) => {
    if (type === 'group') {
      const { pages } = this.props.client;
      const page = pages[rowIndex];
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

  renderPeriodCost = (k, { viewsPeriod, costPerClick }) => viewsPeriod * costPerClick;
  renderCampaignCost = (k, { views, costPerClick }) => views * costPerClick;

  render() {
    const {
      fetchPagesState,
      pagesData,
      current,
      total,
      settings,
    } = this.props.client;
    const {
      pageSize,
      header,
    } = settings;

    const paginationParams = { current, pageSize, total };
    const now = new Date().getTime();
    return (
      <div>

        <Table
          loading={fetchPagesState === 'pending'}
          bordered
          rowKey="id"
          columns={this.columns}
          dataSource={pagesData}
          size="small"
          showHeader={header}
          expandedRowRender={this.expandedRowRender}
          onChange={this.setPagination}
          pagination={settings.paginate ? paginationParams : false}
          rowClassName={row => this.renderRowClassName(now, row)}
        />
      </div>
    );
  }
}

export default PagesList;
