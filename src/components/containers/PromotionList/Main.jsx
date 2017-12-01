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

  getTotal = (rowIndex, type) => {
    const page = this.props.promotionStore.pages[rowIndex];
    return [
      <div key="totalDay" className={style.dayCostPerClick}>
        {page.total.day[type].toFixed(2)}
      </div>,
      <div key="totalPeriod" className={style.periodCostPerClick}>
        {page.total.period[type].toFixed(2)}
      </div>,
    ];
  }

  expandedRowRender = (row, rowIndex) => {
    const date = this.props.promotionStore.date;
    const page = this.props.promotionStore.pages[rowIndex];
    return <PageLayout page={page} date={date} />;
  }

  metricRender = (network, inputsDay, inputsPeriod) => {
    const day = inputsDay[network];
    const period = inputsPeriod[network];
    const dayResult = (day && day.cost && day.clicks)
      ? (day.cost / day.clicks).toFixed(2)
      : 0;
    const periodResult = (period && period.cost && period.clicks)
      ? (period.cost / period.clicks).toFixed(2)
      : 0;
    return [
      <div key="costDay" className={style.dayCostPerClick}>{dayResult}</div>,
      <div key="costPeriod" className={style.periodCostPerClick}>{periodResult}</div>,
    ];
  }

  renderLabels = () => [
    <div key="labelDay" className={style.dayCostPerClick}>День</div>,
    <div key="labelPeriod" className={style.periodCostPerClick}>Период</div>,
  ]

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
      title: network[0].toUpperCase() + network.substr(1),
      render: (v, { inputsDay, inputsPeriod }) =>
        this.metricRender(network, inputsDay, inputsPeriod),
      width: 100,
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
        key: 'labels',
        render: this.renderLabels,
        width: 80,
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
            title: 'Кликов',
            render: (v, p, rowIndex) => this.getTotal(rowIndex, 'clicks'),
            width: 100,
          },
          {
            key: 'totalCost',
            title: 'Потрачено',
            render: (v, p, rowIndex) => this.getTotal(rowIndex, 'cost'),
            width: 100,
          },
          {
            key: 'totalCostPerClick',
            title: 'Стоимость',
            render: (v, p, rowIndex) => this.getTotal(rowIndex, 'costPerClick'),
            width: 100,
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
        <div>
          Список продвигаемых страниц
          <div style={{ float: 'right' }}>
            <Period
              startDate={metricsPeriodSelector.startDate}
              endDate={metricsPeriodSelector.endDate}
              setDate={metricsPeriodSelector.setDate}
              label="Подсчет метрик за период"
            />
          </div>
        </div>
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
