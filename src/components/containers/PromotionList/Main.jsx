import React, { Component } from 'react';
import moment from 'moment';
import { inject, observer } from 'mobx-react';
import { Tabs, Table, DatePicker, Popover, Switch, Input } from 'antd';
import style from '../../../style.css';
import PageLayout from './PageLayout';
import SearchFilter from '../SearchFilter';
import TextWithDots from '../TextWithDots';
import { answerURL } from '../../../constants';
import Period from '../Period';


@inject('promotionStore') @observer
class PromotionList extends Component {
  componentWillMount() {
    this.props.promotionStore.fetchPages();
  }

  getTotal = (rowIndex, type) =>
    this.props.promotionStore.pages[rowIndex].total[type];

  expandedRowRender = (row, rowIndex) => {
    const date = this.props.promotionStore.date;
    const page = this.props.promotionStore.pages[rowIndex];
    return <PageLayout page={page} date={date} />;
  }

  metricRender = value => ((value && value.cost && value.clicks)
    ? (value.cost / value.clicks).toFixed(2)
    : 0)

  renderPageURL = (pageURL, { title, createdAt }) => {
    const content = (
      <div>
        <p>Создана: {moment(createdAt).format('YYYY-MM-DD')}</p>
      </div>
    );

    return (
      <Popover content={content}>
        <a href={answerURL + pageURL}>
          <TextWithDots text={title} length={100} />
        </a>
      </Popover>
    );
  }

  renderStatus = (value, row, rowIndex) => {
    const page = this.props.promotionStore.pages[rowIndex];
    return <Switch checked={page.active} onChange={checked => page.updateStatus(checked)} />;
  }

  render() {
    const {
      sources,
      setDate,
      state,
      date,
      switchTab,
      activeTabSettings,
      inactiveTabSettings,
      pagesData,
      filter,
      setPageFilter,
      setExpandedPages,
      pageFilter,
      settings,
      metricsPeriodSelector,
    } = this.props.promotionStore;

    const { current, total, pageSize, setPagination } = settings;

    const metricsCostColumns = sources.map(network => ({
      key: network,
      dataIndex: `inputs.${network}`,
      title: network[0].toUpperCase() + network.substr(1),
      render: this.metricRender,
      width: 80,
    }));

    const columns = [
      {
        key: 'status',
        dataIndex: 'active',
        render: this.renderStatus,
        width: 80,
      },
      {
        key: 'url',
        dataIndex: 'url',
        render: this.renderPageURL,
        width: 800,
      },
      {
        title: 'Стоимость за клик',
        children: metricsCostColumns,
      },
      {
        title: 'Итого',
        children: [
          {
            key: 'totalClicks',
            dataIndex: 'total.clicks',
            title: 'Кликов',
            render: (v, p, rowIndex) => this.getTotal(rowIndex, 'clicks'),
            width: 80,
          },
          {
            key: 'totalCost',
            dataIndex: 'total.cost',
            title: 'Потрачено',
            render: (v, p, rowIndex) => this.getTotal(rowIndex, 'cost'),
            width: 80,
          },
          {
            key: 'totalCostPerClick',
            dataIndex: 'total.costPerClick',
            title: 'Стоимость',
            render: (v, p, rowIndex) => this.getTotal(rowIndex, 'costPerClick'),
            width: 80,
          },
        ],
      },
    ];

    const standartProps = {
      loading: state === 'pending',
      bordered: true,
      rowKey: 'id',
      dataSource: pagesData,
      columns,
      title: () => (
        <span>
          Список продвигаемых страниц
          <Period
            startDate={metricsPeriodSelector.startDate}
            endDate={metricsPeriodSelector.endDate}
            setDate={metricsPeriodSelector.setDate}
            label=""
          />
        </span>
      ),
      expandedRowRender: this.expandedRowRender,
      onChange: setPagination,
      pagination: { current, pageSize, total },
    };

    const renderExtraActions = (
      <div className={style.headerOperations}>
        <SearchFilter
          className={style.searchPage}
          title="Введите имя или бренд клиента для поиска"
          store={filter}
        />
        <Input
          placeholder="Введите название страницы"
          className={style.searchPage}
          onChange={e => setPageFilter(e.target.value)}
          value={pageFilter}
        />
        <DatePicker
          onChange={setDate}
          value={moment(date, 'YYYY-MM-DD')}
          allowClear={false}
        />
      </div>
    );

    return (
      <div>
        <Tabs
          tabBarExtraContent={renderExtraActions}
          animated={false}
          defaultActiveKey="active"
          onChange={switchTab}
        >
          <Tabs.TabPane tab={`Активные (${activeTabSettings.total})`} key="active">
            <Table {...standartProps} />
          </Tabs.TabPane>
          <Tabs.TabPane tab={`Неактивные (${inactiveTabSettings.total})`} key="inactive">
            <Table {...standartProps} />
          </Tabs.TabPane>
        </Tabs>
      </div>
    );
  }
}

PromotionList.propTypes = {

};

export default PromotionList;
