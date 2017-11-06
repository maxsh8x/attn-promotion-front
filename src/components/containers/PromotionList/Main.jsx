import React, { Component } from 'react';
import moment from 'moment';
import { inject, observer } from 'mobx-react';
import { Tabs, Table, DatePicker, Popover, Switch, Input } from 'antd';
import style from '../../../style.css';
import PageLayout from './PageLayout';
import SearchFilter from '../SearchFilter';
import TextWithDots from '../TextWithDots';
import { answerURL } from '../../../constants';

@inject('promotionStore') @observer
class PromotionList extends Component {
  componentWillMount() {
    this.props.promotionStore.fetchPages();
  }

  getTotal = (rowIndex, type) =>
    this.props.promotionStore.pages[rowIndex].total[type];

  setPagination = ({ current, pageSize }) =>
    this.props.promotionStore.setPagination(current, pageSize);

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
      setPagination,
      setDate,
      state,
      date,
      switchTab,
      activePages,
      inactivePages,
      pagesData,
      setClientsFilter,
      setPageFilter,
      setExpandedPages,
      current,
      pageSize,
      pageFilter
    } = this.props.promotionStore;

    const metricsCostColumns = sources.map(network => ({
      key: network,
      dataIndex: `inputs.${network}`,
      title: network[0].toUpperCase() + network.substr(1),
      render: this.metricRender,
    }));

    const columns = [
      {
        key: 'status',
        dataIndex: 'active',
        render: this.renderStatus,
      },
      {
        key: 'url',
        dataIndex: 'url',
        render: this.renderPageURL,
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
          },
          {
            key: 'totalCost',
            dataIndex: 'total.cost',
            title: 'Потрачено',
            render: (v, p, rowIndex) => this.getTotal(rowIndex, 'cost'),
          },
          {
            key: 'totalCostPerClick',
            dataIndex: 'total.costPerClick',
            title: 'Стоимость',
            render: (v, p, rowIndex) => this.getTotal(rowIndex, 'costPerClick'),
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
      title: () => 'Список продвигаемых страниц',
      expandedRowRender: this.expandedRowRender,
      onChange: this.setPagination,
      pagination: { current, pageSize, total: activePages },
    };

    return (
      <div>
        <div className={style.tableOperations}>
          <DatePicker
            onChange={setDate}
            value={moment(date, 'YYYY-MM-DD')}
            allowClear={false}
          />
          <SearchFilter
            title="Введите имя клиента для поиска"
            url="/v1/client/search"
            callback={clients => setClientsFilter(clients.map(client => client.key))}
          />
          <Input
            placeholder="Введите название страницы"
            className={style.searchPage}
            onChange={e => setPageFilter(e.target.value)}
            value={pageFilter}
          />
        </div>

        <Tabs defaultActiveKey="active" onChange={switchTab}>
          <Tabs.TabPane tab={`Активные (${activePages})`} key="active">
            <Table {...standartProps} />
          </Tabs.TabPane>
          <Tabs.TabPane tab={`Неактивные (${inactivePages})`} key="inactive">
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
