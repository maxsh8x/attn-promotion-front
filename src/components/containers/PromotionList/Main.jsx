import React, { Component } from 'react';
import moment from 'moment';
import { inject, observer } from 'mobx-react';
import { Tabs, Table, DatePicker, Spin, Popover, Switch, Input } from 'antd';
import style from './Main.css';
import PageLayout from './PageLayout';
import SearchFilter from '../SearchFilter';

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
    const page = this.props.promotionStore.pages[rowIndex];
    return <PageLayout page={page} />;
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

    // const urlParts = pageURL.split('/');
    // urlParts[urlParts.length - 2]
    return (
      <Popover content={content}>
        <a href={pageURL}>{title}</a>
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
      { key: 'status', dataIndex: 'active', render: this.renderStatus },
      { key: 'url', dataIndex: 'url', render: this.renderPageURL },
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

    const title = () => 'Список продвигаемых страниц';
    const paginationParams = { current, pageSize}

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

        <Spin spinning={state === 'pending'}>
          <Tabs defaultActiveKey="active" onChange={switchTab} animated={false}>
            <Tabs.TabPane tab={`Активные (${activePages})`} key="active">
              <Table
                bordered
                rowKey="id"
                dataSource={pagesData}
                columns={columns}
                title={title}
                expandedRowRender={this.expandedRowRender}
                onChange={this.setPagination}
                pagination={{ ...paginationParams, total: activePages }}
              />
            </Tabs.TabPane>
            <Tabs.TabPane tab={`Неактивные (${inactivePages})`} key="inactive">
              <Table
                bordered
                rowKey="id"
                dataSource={pagesData}
                columns={columns}
                title={title}
                expandedRowRender={this.expandedRowRender}
                onChange={this.setPagination}
                pagination={{ ...paginationParams, total: inactivePages }}
              />
            </Tabs.TabPane>
          </Tabs>
        </Spin>
      </div>
    );
  }
}

PromotionList.propTypes = {

};

export default PromotionList;
