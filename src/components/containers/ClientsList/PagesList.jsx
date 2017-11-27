import React, { Component } from 'react';
import { observer } from 'mobx-react';
import moment from 'moment';
import { Table, Switch, Badge, Icon, Tabs, Button, Popconfirm } from 'antd';
import style from '../../../style.css';
import permissions from '../../../utils/permissions';
import shallowCompare from '../../../utils/helper';
import { answerURL } from '../../../constants';
import TextWithDots from '../TextWithDots';
import Archive from './Archive';

const typeNames = {
  individual: <Icon type="user" style={{ fontSize: 16, color: '#ffbf00' }} />,
  group: <Icon type="team" style={{ fontSize: 16, color: '#7265e6' }} />,
};

@observer
class PagesList extends Component {
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
        dataIndex: 'type',
        title: 'Тип',
        render: type => typeNames[type],
        width: 40,
      },
      {
        dataIndex: 'active',
        title: 'Статус',
        render: active => <Switch checked={active} />,
        width: 70,
      },
      {
        dataIndex: 'title',
        title: 'Название',
        render: this.renderPageURL,
        width: 600,
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
            key: 'costPerClick',
            dataIndex: 'costPerClick',
            title: 'Цена за клик',
            width: 110,
          },
          {
            key: 'campaignPeriod',
            title: 'Стоимость',
            width: 110,
            render: this.renderCampaignCost,
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
    this.props.client.fetchPages();
  }

  componentWillReceiveProps({ dates }) {
    if (!(shallowCompare(dates, this.props.dates))) {
      this.props.client.fetchPages();
    }
  }

  setPagination = ({ current, pageSize }) =>
    this.props.client.setPagination(current, pageSize);

  expandedRowRender = (row, rowIndex) => {
    const { pages } = this.props.client;
    const page = pages[rowIndex];
    return (
      <Archive page={page} />
    );
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

  renderActions = (value, { archiveID }, rowIndex) => {
    const page = this.props.client.pages[rowIndex];
    return (
      this.props.client.activeTab === 'active'
        ? <Popconfirm
          title="Вы действительно хотите перенести кампанию в архив?"
          onConfirm={page.metaToArchive}
        >
          <Button icon="delete" />
        </Popconfirm>
        : <Button icon="to-top" onClick={() => page.archiveToMeta(archiveID)} />
    );
  }

  render() {
    const {
      state,
      pagesData,
      current,
      total,
      settings,
      activeTab,
      switchTab,
    } = this.props.client;
    const {
      pageSize,
      header,
    } = settings;

    const paginationParams = { current, pageSize, total };
    const now = new Date().getTime();
    const standartProps = {
      loading: state === 'pending',
      bordered: true,
      rowKey: 'id',
      columns: this.columns,
      dataSource: pagesData,
      size: 'small',
      showHeader: header,
      onChange: this.setPagination,
      pagination: settings.paginate ? paginationParams : false,
      rowClassName: row => this.renderRowClassName(now, row)
    };

    return (
      <div>
        <Tabs
          animated={false}
          value={activeTab}
          onChange={switchTab}
          size="small"
        >
          <Tabs.TabPane tab="Действующие" key="active">
            <Table {...standartProps} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Архивные" key="archived">
            <Table {...standartProps} expandedRowRender={this.expandedRowRender} />
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}

export default PagesList;
